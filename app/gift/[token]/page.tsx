"use client";

/**
 * /gift/[token] — the recipient's gift. Loads the card the buyer saved, greets them by name,
 * and hands the pack to the same Unboxing the buyer saw. Reopenable as often as they like.
 */
import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import Unboxing from "@/components/Unboxing";

type Gift = {recipient: string; sender: string; greeting: string; card_png: string};

export default function Gift() {
  const params = useParams<{token: string}>();
  const token = params?.token ?? "";
  const [gift, setGift] = useState<Gift | null>(null);
  const [view, setView] = useState<"loading" | "ready" | "missing">("loading");
  const [settled, setSettled] = useState(false);
  const [replay, setReplay] = useState(0);
  const [note, setNote] = useState("");
  const url = typeof location === "undefined" ? "" : location.href;

  useEffect(() => {
    if (!token) return;
    fetch(`/api/gift?token=${encodeURIComponent(token)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((d: Gift) => { setGift(d); setView("ready"); })
      .catch(() => setView("missing"));
  }, [token]);

  const onSettled = () => {
    setSettled(true);
    void fetch("/api/gift", {
      method: "POST", headers: {"content-type": "application/json"},
      body: JSON.stringify({op: "opened", token})
    }).catch(() => {});
  };

  const download = () => {
    if (!gift) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${gift.card_png}`;
    a.download = `kort-${gift.recipient || "somecard"}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  };

  const share = async (text: string, done: string) => {
    try {
      if (navigator.share) await navigator.share({title: "That’s So Me!", text, url});
      else { await navigator.clipboard.writeText(`${text} ${url}`); setNote(done); }
    } catch { /* cancelled */ }
  };

  if (view === "loading") return <main className="flow"><p className="note">Öppnar ditt pack…</p></main>;
  if (view === "missing" || !gift) return (
    <main className="flow">
      <header className="bar"><Link className="brand" href="/">So<em>Me</em>Card</Link></header>
      <section className="panel">
        <h1>Vi hittar inte det packet.</h1>
        <p className="sub">Länken finns inte eller är inte tillgänglig än.</p>
        <Link className="btn" href="/">Till startsidan</Link>
      </section>
    </main>
  );

  return (
    <main className="flow gift">
      <Link className="brand" href="/">So<em>Me</em>Card</Link>
      <Unboxing
        key={replay}
        mode="full"
        image={`data:image/png;base64,${gift.card_png}`}
        name={gift.recipient}
        sub={gift.greeting || (gift.sender ? `${gift.sender} sa att du hade några superkrafter. Vill du se?` : "Någon sa att du hade några superkrafter. Vill du se?")}
        cta="Öppna ditt pack."
        onSettled={onSettled}
      />
      {settled && (
        <div className="settle">
          <h1>Det finns bara en som du.</h1>
          {gift.sender && <p className="sub">Från {gift.sender}.</p>}
          <div className="row">
            <button className="btn big" type="button" onClick={download}>Spara kortet</button>
            <button className="btn ghost" type="button" onClick={() => { setSettled(false); setReplay(n => n + 1); }}>Öppna igen</button>
          </div>
          <div className="row">
            <button className="btn ghost" type="button" onClick={() => share(`Titta vad ${gift.sender || "någon"} gjorde till mig 😂`, "Länken är kopierad.")}>Dela</button>
            <button className="btn ghost" type="button" onClick={() => share("No you didnt hahah", "Svaret är kopierat — skicka det till " + (gift.sender || "din vän") + ".")}>Svara “No you didnt hahah”</button>
          </div>
          {note && <p className="note">{note}</p>}
          <p className="quiet"><Link href="/create">Gör ett kort till någon du känner</Link></p>
        </div>
      )}
    </main>
  );
}
