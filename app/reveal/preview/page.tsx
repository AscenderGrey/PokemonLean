"use client";

/**
 * /reveal/preview — watch the epic reveal without going through checkout.
 * /reveal/preview?audience=recipient (default) or ?audience=owner.
 *
 * The reveal is a light-canvas experience: it is wrapped exactly as the production route wraps it
 * (.screen / .head / .sender from the reveal stylesheet) inside a light canvas, otherwise the whole
 * light-themed design renders on the app's dark background and looks wrong.
 */
import {useEffect, useState} from "react";
import {EpicReveal, type EpicRevealData} from "@/components/epic-reveal";
import styles from "@/components/gift-reveal.module.css";

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
  cardTitle: "Bästa vän. Känner hela stan.",
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
    <div className="reveal-canvas">
      <main className={styles.screen}>
        <div className={styles.head}><span>That’s So Me!</span><span>{DATA.name}</span></div>
        {audience === "recipient" && (
          <p className={styles.sender}>Från {DATA.senderName} — “{DATA.greeting}”</p>
        )}
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
    </div>
  );
}
