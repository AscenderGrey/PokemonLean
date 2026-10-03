"use client";

/**
 * /gift/[token] — the recipient's entry. A fresh sealed pack, no spoilers, then the full reveal.
 * In the demo the token is a clearly labelled sample that works without any browser storage.
 */
import {useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import Unboxing from "@/components/Unboxing";
import {SAMPLE} from "@/lib/quiz-data";

export default function Gift() {
  const params = useParams<{token: string}>();
  const token = params?.token ?? "sample";
  const [settled, setSettled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const save = () => {
    const a = document.createElement("a");
    a.href = SAMPLE.image;
    a.download = "somecard.png";
    document.body.appendChild(a); a.click(); a.remove();
    setSaved(true);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(location.href); setCopied(true); } catch { /* ignore */ } };

  return (
    <main className="flow gift">
      <Link className="brand" href="/">So<em>Me</em>Card</Link>
      <Unboxing key={replayKey} mode="full" image={SAMPLE.image} name={SAMPLE.name}
        sub={`${SAMPLE.name}, det finns ett kort som bara kan vara du.`} cta="Öppna ditt pack."
        onSettled={() => setSettled(true)} />
      {settled && (
        <div className="settle">
          <h1>Det finns bara en som du.</h1>
          <div className="row">
            <button className="btn big" type="button" onClick={save}>Spara kortet</button>
            <button className="btn ghost" type="button" onClick={() => { setSettled(false); setReplayKey(k => k + 1); }}>Öppna igen</button>
          </div>
          {saved && <p className="note">Kortet laddades ner som somecard.png.</p>}
          <p className="quiet"><Link href="/create">Gör ett kort till någon du känner</Link></p>
          <p className="note">Exempelpack i demon ({token}). <button className="linklike" type="button" onClick={copy}>Kopiera länken</button>{copied ? " — kopierad." : ""}</p>
        </div>
      )}
    </main>
  );
}
