"use client";

/**
 * /reveal/preview — watch the epic reveal without going through checkout.
 * /reveal/preview?audience=recipient (default) or ?audience=owner.
 * Pure presentation: the data is a fixture, nothing is fetched, nothing is charged.
 */
import {useEffect, useState} from "react";
import Link from "next/link";
import {EpicReveal, type EpicRevealData} from "@/components/epic-reveal";

const DATA: EpicRevealData = {
  name: "Anna",
  epithet: "Kaffeorkanen",
  roast: [
    "Planerar middagen under lunchen.",
    "Svarar på mejl klockan 23.47 med \"ska bara\".",
    "Kan namnet på varenda hund i kvarteret."
  ],
  clues: [
    "Har alltid ett paket kex i väskan",
    "Säger \"jag ska bara\" och menar tre timmar",
    "Lånar ut sin laddare och glömmer den aldrig"
  ],
  heroUrl: "/sample/basta_van.png",
  partialUrl: "/sample/basta_van-teaser.png",
  cardTitle: "Bästa vän. Känner halva stan.",
  paid: false,
  priceSEK: 99,
  senderName: "John",
  greeting: "Tänkte att du borde få ett eget kort.",
  senderLine: "John gjorde det här till dig."
};

export default function RevealPreview() {
  const [audience, setAudience] = useState<"recipient" | "owner">("recipient");
  const [paid, setPaid] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get("audience");
    if (a === "owner" || a === "recipient") setAudience(a);
  }, []);

  const pick = (a: "recipient" | "owner") => { setAudience(a); setPaid(false); setKey(k => k + 1); };

  return (
    <main className="flow">
      <header className="bar">
        <Link className="brand" href="/">So<em>Me</em>Card</Link>
        <span className="n">Förhandsvisning · reveal</span>
      </header>
      <div className="row">
        <button className={`btn${audience === "recipient" ? " big" : " ghost"}`} type="button" onClick={() => pick("recipient")}>Mottagaren</button>
        <button className={`btn${audience === "owner" ? " big" : " ghost"}`} type="button" onClick={() => pick("owner")}>Köparen</button>
        <button className="btn ghost" type="button" onClick={() => setKey(k => k + 1)}>Spela upp igen</button>
      </div>
      <EpicReveal
        key={`${audience}-${paid}-${key}`}
        data={{...DATA, paid}}
        audience={audience}
        consentRequired={false}
        onUnlock={() => setPaid(true)}
        onProgress={() => {}}
      />
    </main>
  );
}
