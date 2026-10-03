"use client";

/**
 * /create — the whole buyer journey in one page: quiz → preparation → the pack → teaser checkout →
 * buyer confirmation. Generation is a single call to POST /api/generate; the pack shows a real
 * status while it runs. Payment is simulated and always labelled as such.
 */
import {useCallback, useState} from "react";
import Link from "next/link";
import Unboxing from "@/components/Unboxing";
import {RELATIONS, TEMPLATE_KEY, FIRE, PAIRS, POWER, PRICE} from "@/lib/quiz-data";

type Pair = {name: string} | null;
type Option = {key: string; label: string; emoji: string};
type State = {
  name: string;
  rel: string;
  photo: string;
  fire: Option & {name?: string} | null;
  pairs: [Pair, Pair, Pair];
  power: Option | null;
  quote: string;
};
const EMPTY: State = {name: "", rel: "", photo: "", fire: null, pairs: [null, null, null], power: null, quote: ""};
const QSTEPS = ["name", "rel", "photo", "fire", "pairs", "power", "quote"] as const;
const kr = (n: number) => `${n} kr`;
const gen = (n: string) => (!n || /[sxz]$/i.test(n) ? n : n + "s");

export default function Create() {
  const [phase, setPhase] = useState<"quiz" | "prep" | "pack" | "buyer">("quiz");
  const [qi, setQi] = useState(0);
  const [pairI, setPairI] = useState(0);
  const [s, setS] = useState<State>(EMPTY);
  const [img, setImg] = useState<{card: string; teaser: string} | null>(null);
  const [settled, setSettled] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS(p => ({...p, [k]: v}));
  const step = QSTEPS[qi];
  const giftUrl = `${typeof location === "undefined" ? "" : location.origin}/gift/sample`;
  const who = s.name || "personen";

  const generate = useCallback(async (state: State) => {
    setErr("");
    setPhase("prep");
    const answers = {
      name: state.name.trim(),
      relationship: TEMPLATE_KEY[state.rel],
      interests: [state.fire?.name ?? "Okänt"],
      traits: [state.pairs[0]?.name ?? "Okänt", state.power?.label ?? "Okänt"],
      privateFact: state.pairs[1]?.name ?? "Okänt",
      strongestStat: state.pairs[2]?.name ?? "Okänt"
    };
    const photoBase64 = state.photo ? state.photo.split(",")[1] : undefined;
    try {
      const r = await fetch("/api/generate", {
        method: "POST", headers: {"content-type": "application/json"},
        body: JSON.stringify({answers, photoBase64})
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Kortet kunde inte skapas");
      setImg({card: `data:image/png;base64,${data.card}`, teaser: `data:image/png;base64,${data.teaser}`});
      setSettled(false);
      setPhase("pack");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Något gick fel");
    }
  }, []);

  const advance = () => {
    if (step === "pairs" && pairI < 2) return setPairI(pairI + 1);
    if (qi < QSTEPS.length - 1) { setQi(qi + 1); setPairI(0); return; }
    generate(s);
  };
  const pick = () => setTimeout(advance, 180); // let the picked option show its selected state
  const back = () => {
    if (step === "pairs" && pairI > 0) return setPairI(pairI - 1);
    if (qi > 0) { const p = qi - 1; setQi(p); setPairI(QSTEPS[p] === "pairs" ? 2 : 0); }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({title: "Ett pack till dig", text: `Ett pack till ${s.name}.`, url: giftUrl});
      else { await navigator.clipboard.writeText(giftUrl); setCopied(true); }
    } catch { /* user cancelled — the page stays usable */ }
  };

  return (
    <main className="flow">
      <header className="bar">
        <Link className="brand" href="/">So<em>Me</em>Card</Link>
        {phase === "quiz" && qi > 0 && <button className="back" type="button" onClick={back}>← Tillbaka</button>}
      </header>

      {phase === "quiz" && (
        <section className="panel">
          <div className="prog">
            <div className="segs">{[0, 1, 2, 3, 4, 5, 6].map(i => <i key={i} className={i <= qi ? "on" : ""} />)}</div>
            <span className="n">{qi + 1} av 7</span>
          </div>
          <QuizStep s={s} set={set} step={step} pairI={pairI} advance={advance} pick={pick} />
        </section>
      )}

      {phase === "prep" && (
        <section className="panel">
          <h1>{gen(s.name)} kort görs</h1>
          {err ? (
            <>
              <p className="sub">Kortet kunde inte skapas: {err}</p>
              <div className="row">
                <button className="btn" type="button" onClick={() => generate(s)}>Försök igen</button>
                <button className="btn ghost" type="button" onClick={() => { setPhase("quiz"); setQi(0); }}>Tillbaka till frågorna</button>
              </div>
            </>
          ) : (
            <div className="load"><div className="track"><i /></div>
              <p className="sub">Vi skriver kortets text och ritar kortet. Det tar oftast under en minut.</p></div>
          )}
        </section>
      )}

      {phase === "pack" && img && (
        <section className="reveal">
          <Unboxing key="reveal" mode="teaser" image={img.teaser} name={who}
            sub="Jag har gjort en grej till dig." cta="Tryck för att öppna." onSettled={() => setSettled(true)} />
          {settled && (
            <div className="checkout">
              <h1>Det där är ju {s.name}.</h1>
              <p className="sub">Lås upp hela kortet och skicka ett pack att öppna.</p>
              <p className="price">{kr(PRICE)}</p>
              <button className="btn big" type="button" onClick={() => setPhase("buyer")}>Testa köp · {kr(PRICE)}</button>
              <p className="note">Simulerat köp i demon. Ingen riktig Swish- eller Apple Pay-betalning sker.</p>
            </div>
          )}
        </section>
      )}

      {phase === "buyer" && (
        <section className="panel">
          <h1>Klart. Nu är det {gen(s.name)} tur.</h1>
          <p className="sub">Packet är förseglat och väntar. Skicka det när du vill.</p>
          {img && <div className="mini"><img src={img.teaser} alt="" /></div>}
          <div className="row">
            <button className="btn big" type="button" onClick={share}>Skicka packet</button>
            <Link className="btn ghost" href="/gift/sample">Förhandsvisa mottagarens upplevelse</Link>
          </div>
          {copied && <p className="note">Länken är kopierad. Klistra in den där du vill skicka den.</p>}
          <p className="note">Delas som en exempellänk i demon: {giftUrl}</p>
        </section>
      )}
    </main>
  );
}

/** The shared grid of emoji + label choices used by the relation, interest and power steps. */
function Choices({items, selected, onPick}: {items: readonly Option[]; selected?: string; onPick: (k: string) => void}) {
  return (
    <div className="opts">{items.map(o => (
      <button key={o.key} className={`opt${selected === o.key ? " sel" : ""}`} type="button" onClick={() => onPick(o.key)}>
        <span className="e">{o.emoji}</span><span>{o.label}</span>
      </button>
    ))}</div>
  );
}

/** One quiz step. Each answer advances promptly; nothing over-animated. */
function QuizStep({s, set, step, pairI, advance, pick}: {
  s: State;
  set: <K extends keyof State>(k: K, v: State[K]) => void;
  step: (typeof QSTEPS)[number];
  pairI: number;
  advance: () => void;
  pick: () => void;
}) {
  const nm = s.name || "personen";
  if (step === "name") return (
    <>
      <h1>Vem ska få ett kort?</h1>
      <p className="sub">Skriv namnet så dyker det upp på packet.</p>
      <form className="field" onSubmit={e => { e.preventDefault(); if (s.name.trim()) advance(); }}>
        <input autoFocus maxLength={18} placeholder="T.ex. Anna" value={s.name} onChange={e => set("name", e.target.value)} />
        <button className="btn" type="submit" disabled={!s.name.trim()}>Nästa</button>
      </form>
    </>
  );
  if (step === "rel") return (
    <>
      <h1>Vem är {nm} för dig?</h1>
      <p className="sub">Svaret bestämmer kortets typ och färg.</p>
      <Choices items={RELATIONS} selected={s.rel} onPick={k => { set("rel", k); pick(); }} />
    </>
  );
  if (step === "photo") return (
    <>
      <h1>Har du en bild på {nm}?</h1>
      <p className="sub">Bilden hamnar i holo-ramen. Frivilligt.</p>
      <div className="upload"><input type="file" accept="image/*" onChange={e => {
        const f = e.target.files?.[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = () => { set("photo", String(rd.result)); pick(); };
        rd.readAsDataURL(f);
      }} /></div>
      <div className="row"><button className="btn ghost" type="button" onClick={advance}>Hoppa över så länge</button></div>
    </>
  );
  if (step === "fire") return (
    <>
      <h1>Vad går {nm} igång på?</h1>
      <p className="sub">Det blir första attacken.</p>
      <Choices items={FIRE} selected={s.fire?.key}
        onPick={k => { set("fire", FIRE.find(o => o.key === k) ?? null); pick(); }} />
    </>
  );
  if (step === "pairs") {
    const P = PAIRS[pairI];
    const q = P.q.replace("{n}", nm).replace("{g}", gen(nm));
    return (
      <>
        <h1>{q}</h1>
        <p className="sub">Snabbrunda {pairI + 1} av 3.</p>
        <div className="vs">{P.options.map((o, i) => (
          <button key={i} className={`opt${s.pairs[pairI]?.name === o.name ? " sel" : ""}`} type="button"
            onClick={() => { const p: [Pair, Pair, Pair] = [...s.pairs]; p[pairI] = {name: o.name}; set("pairs", p); pick(); }}>{o.label}</button>
        ))}</div>
      </>
    );
  }
  if (step === "power") return (
    <>
      <h1>Vilken är {gen(s.name)} signaturkraft?</h1>
      <p className="sub">Den blir special power och strength.</p>
      <Choices items={POWER} selected={s.power?.key}
        onPick={k => { set("power", POWER.find(o => o.key === k) ?? null); pick(); }} />
    </>
  );
  return (
    <>
      <h1>Vad säger {s.name} alltid?</h1>
      <p className="sub">Frivilligt. En mening som bara ni känner igen.</p>
      <form className="field" onSubmit={e => { e.preventDefault(); advance(); }}>
        <input maxLength={40} placeholder="Skriv med egna ord" value={s.quote} onChange={e => set("quote", e.target.value)} />
        <button className="btn" type="submit">Skapa {gen(s.name)} kort</button>
      </form>
      <div className="row"><button className="btn ghost" type="button" onClick={() => { set("quote", ""); advance(); }}>Hoppa över</button></div>
    </>
  );
}
