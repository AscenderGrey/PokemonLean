"use client";

/**
 * Stripe embedded Checkout. Stripe.js is loaded from Stripe's CDN rather than adding an npm
 * dependency; the client secret comes from /api/checkout. When the deployment has no Stripe key
 * this reports honestly instead of pretending a payment happened.
 */
import {useEffect, useRef, useState} from "react";

type State = "loading" | "ready" | "unconfigured" | "error";

const STRIPE_JS = "https://js.stripe.com/v3/";

function loadStripeJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Stripe) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${STRIPE_JS}"]`);
    if (existing) { existing.addEventListener("load", () => resolve()); existing.addEventListener("error", () => reject(new Error("stripe.js failed"))); return; }
    const s = document.createElement("script");
    s.src = STRIPE_JS; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Kunde inte ladda Stripe"));
    document.head.appendChild(s);
  });
}

export default function StripeCheckout({pack, returnOrigin}: {pack: "single" | "family"; returnOrigin?: string}) {
  const mount = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let checkout: {mount: (el: HTMLElement) => void; destroy: () => void} | undefined;
    let cancelled = false;
    (async () => {
      try {
        const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!pk) { setState("unconfigured"); setMessage("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY saknas."); return; }
        const res = await fetch("/api/checkout", {
          method: "POST", headers: {"content-type": "application/json"},
          body: JSON.stringify({pack, returnOrigin})
        });
        const data = await res.json();
        if (res.status === 503) { setState("unconfigured"); setMessage(data.message ?? "Betalning är inte aktiverad än."); return; }
        if (!res.ok) throw new Error(data.message ?? data.error ?? "Kunde inte starta betalningen");
        await loadStripeJs();
        const stripe = (window as any).Stripe(pk);
        checkout = await stripe.initEmbeddedCheckout({fetchClientSecret: async () => data.clientSecret});
        if (cancelled || !mount.current || !checkout) return;
        checkout.mount(mount.current);
        setState("ready");
      } catch (e) {
        if (!cancelled) { setState("error"); setMessage(e instanceof Error ? e.message : "Något gick fel"); }
      }
    })();
    return () => { cancelled = true; checkout?.destroy(); };
  }, [pack, returnOrigin]);

  return (
    <div className="stripe-box">
      {state === "loading" && <p className="note">Startar betalningen…</p>}
      {state === "unconfigured" && (
        <p className="note warn">
          Betalning är inte aktiverad på den här miljön än: {message}
          <br />Ingen betalning har skett och inget kort har låsts upp.
        </p>
      )}
      {state === "error" && <p className="note warn">Betalningen kunde inte startas: {message}</p>}
      <div ref={mount} className="stripe-mount" hidden={state !== "ready"} />
    </div>
  );
}
