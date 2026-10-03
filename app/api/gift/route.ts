import {NextResponse} from "next/server";
import {randomBytes} from "node:crypto";
import {saveCard, getCard, markOpened, migrate} from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 30;

const FROM = process.env.EMAIL_FROM?.trim() || "SoMeCard <onboarding@resend.dev>";
const newToken = () => randomBytes(9).toString("base64url");

/**
 * One route for the gift: save the finished card, read it back by token, and send the link.
 * GET  /api/gift?token=…                -> the stored card (recipient's reveal)
 * POST {op:'save', recipient, …}        -> {token}
 * POST {op:'send', token, to}           -> sends the link with Resend
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({error: "token required"}, {status: 400});
  try {
    const row = await getCard(token);
    if (!row) return NextResponse.json({error: "not_found"}, {status: 404});
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({error: "db", message: e instanceof Error ? e.message : ""}, {status: 500});
  }
}

export async function POST(request: Request) {
  let body: Record<string, string>;
  try { body = await request.json(); } catch { return NextResponse.json({error: "bad body"}, {status: 400}); }

  if (body.op === "save") {
    if (!body.cardPng || !body.recipient) {
      return NextResponse.json({error: "cardPng and recipient are required"}, {status: 400});
    }
    const token = newToken();
    try {
      await saveCard({
        token, recipient: body.recipient, sender: body.sender ?? "", greeting: body.greeting ?? "",
        card: JSON.parse(body.cardText ?? "{}"), card_png: body.cardPng
      });
      return NextResponse.json({token, url: `${new URL(request.url).origin}/gift/${token}`});
    } catch (e) {
      return NextResponse.json({error: "db", message: e instanceof Error ? e.message : ""}, {status: 500});
    }
  }

  if (body.op === "opened") {
    try { await markOpened(body.token ?? ""); } catch { /* best effort */ }
    return NextResponse.json({ok: true});
  }

  if (body.op === "send") {
    const key = process.env.RESEND_API_KEY;
    if (!key) return NextResponse.json({error: "not-configured", message: "RESEND_API_KEY saknas"}, {status: 503});
    if (!body.token || !body.to) return NextResponse.json({error: "token and to are required"}, {status: 400});
    await migrate().catch(() => {});
    const url = `${new URL(request.url).origin}/gift/${body.token}`;
    const subject = `${body.sender || "Någon"} har gjort ett kort till ${body.recipient}`;
    const html = `<div style="font:16px/1.5 system-ui,sans-serif;color:#12255f;max-width:520px">
      <p style="font-size:22px;font-weight:800;margin:0 0 12px">Hej ${body.recipient}!</p>
      <p style="margin:0 0 18px">${body.sender || "Någon"} sa att du hade några superkrafter. Vill du se?</p>
      <p style="margin:0 0 22px"><a href="${url}" style="background:#ffb62e;color:#2b1c00;font-weight:800;
        padding:14px 20px;border-radius:10px;text-decoration:none">Öppna ditt pack</a></p>
      <p style="color:#5b6b93;font-size:14px;margin:0">Eller klistra in länken: ${url}</p></div>`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {Authorization: `Bearer ${key}`, "Content-Type": "application/json"},
        body: JSON.stringify({from: FROM, to: [body.to], subject, html}),
        signal: AbortSignal.timeout(20000)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json({error: "resend", message: data?.message ?? `HTTP ${res.status}`}, {status: 502});
      }
      return NextResponse.json({ok: true, id: data?.id ?? null, url});
    } catch (e) {
      return NextResponse.json({error: "send_failed", message: e instanceof Error ? e.message : ""}, {status: 502});
    }
  }

  return NextResponse.json({error: "unknown op"}, {status: 400});
}
