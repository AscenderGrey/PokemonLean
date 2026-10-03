"use client";

/**
 * /demo — a deterministic showcase of the same reveal, using the stored sample card.
 * /demo?capture=1 strips the surrounding chrome for a clean 1080×1920 portrait ad capture.
 */
import {useEffect, useState} from "react";
import Link from "next/link";
import Unboxing from "@/components/Unboxing";
import {SAMPLE} from "@/lib/quiz-data";

export default function Demo() {
  const [capture, setCapture] = useState(false);
  const [key, setKey] = useState(0);
  useEffect(() => { setCapture(new URLSearchParams(location.search).get("capture") === "1"); }, []);

  return (
    <main className={`flow demo${capture ? " capture" : ""}`}>
      {!capture && (
        <header className="bar">
          <Link className="brand" href="/">So<em>Me</em>Card</Link>
          <span className="n">Demon · exempelkort</span>
        </header>
      )}
      <Unboxing key={key} mode="full" image={SAMPLE.image} name={SAMPLE.name}
        sub="Jag har gjort en grej till dig." cta="Tryck för att öppna." />
      <button className={`btn ghost${capture ? " replay" : ""}`} type="button" onClick={() => setKey(k => k + 1)}>Spela upp igen</button>
    </main>
  );
}
