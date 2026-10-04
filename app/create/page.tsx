"use client";

/**
 * /create — the funnel, ported from reference/SoMeCard_Quizprototyp.html: the live card column on
 * the left, one question at a time beside it, every answer landing in a slot on the card. Steps are
 * name → relation → photo → interest → the three quick rounds → signature power → quote → email,
 * then generation, the sealed pack, the paywall (Stripe embedded checkout with a Swish button) and
 * the buyer confirmation.
 */
import {useCallback, useEffect, useState, type FormEvent} from "react";
import Link from "next/link";
import Unboxing from "@/components/Unboxing";
import CardPreview, {type CardState} from "@/components/CardPreview";
import StripeCheckout from "@/components/StripeCheckout";
import {RELATIONS, relation, FIRE, PAIRS, WEAK, POWER, QUOTE_EXAMPLES, PRICE, FAMILY_PRICE, FAMILY_EXTRA} from "@/lib/quiz-data";

type PairResult = {name: string; desc?: string} | null;
type Option = {key: string; label: string; emoji: string};
type S = {
  name: string; rel: string; photo: string;
  fire: (typeof FIRE)[number] | null;
  pairs: [PairResult, PairResult, PairResult];
  power: (typeof POWER)[number] | null;
  quote: string; email: string; offer: 1 | 5;
};

const EMPTY: S = {name: "", rel: "", photo: "", fire: null, pairs: [null, null, null], power: null, quote: "", email: "", offer: 1};
const STEPS = ["name", "rel", "photo", "fire", "pairs", "power", "quote", "email"] as const;
type Step = (typeof STEPS)[number];

/** The build checklist, as in the prototype's loading step. */
const LOAD_STEPS = [
  "Gjuter ramen…", "Häller i färgen…", "Präglar namnet…", "Framkallar bilden…",
  "Skriver special power…", "Laddar attackerna…", "Räknar ut level…", "Lägger på holo-folie…", "Förseglar packet…"
];

const gen = (n: string) => (!n || /[sxz]$/i.test(n) ? n : n + "s");
const kr = (n: number) => `${n} kr`;

export default function Create() {
  const [phase, setPhase] = useState<"quiz" | "load" | "pack" | "mine">("quiz");
  const [qi, setQi] = useState(0);
  const [pairI, setPairI] = useState(0);
  const [s, setS] = useState<S>(EMPTY);
  const [img, setImg] = useState<{card: string; teaser: string} | null>(null);
  const [settled, setSettled] = useState(false);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");
  const [lv, setLv] = useState(0);
  const [started, setStarted] = useState(false);
  const [giftLink, setGiftLink] = useState("");
  const [to, setTo] = useState("");
  const [myName, setMyName] = useState("");
  const [sent, setSent] = useState("");
  const [sending, setSending] = useState(false);

  // Past payment, save the card so the recipient's link exists and can be reopened any time.
  useEffect(() => {
    if (phase !== "mine" || !img || giftLink) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/gift", {
          method: "POST", headers: {"content-type": "application/json"},
          body: JSON.stringify({op: "save", recipient: s.name.trim() || "personen", sender: myName.trim(), greeting: "",
            cardText: JSON.stringify({}), cardPng: img.card.split(",")[1] ?? ""})
        });
        const d = await r.json();
        if (!cancelled) setGiftLink(r.ok && d.url ? d.url : "");
        if (!cancelled && !r.ok) setSent(d.message || "Kunde inte spara kortet.");
      } catch { /* the buyer can still retry by reloading */ }
    })();
    return () => { cancelled = true; };
  }, [phase, img, giftLink, myName, s.name]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true); setSent("");
    try {
      const r = await fetch("/api/gift", {
        method: "POST", headers: {"content-type": "application/json"},
        body: JSON.stringify({op: "send", token: giftLink.split("/gift/").pop(), to: to.trim(),
          recipient: s.name, sender: myName.trim()})
      });
      const d = await r.json();
      setSent(r.ok ? `Klart. Länken är skickad till ${to.trim()}.` : (d.message || "Kunde inte skicka mejlet."));
    } catch { setSent("Kunde inte skicka mejlet."); }
    setSending(false);
  };

  const set = <K extends keyof S>(k: K, v: S[K]) => setS(p => ({...p, [k]: v}));
  const step: Step = STEPS[qi];
  const nm = s.name.trim() || "personen";
  const who = s.name.trim() || "personen";

  const generate = useCallback(async (state: S) => {
    setErr(""); setPhase("load"); setStatus("Skickar dina svar…"); setLv(0);
    // The checklist advances while we wait, but the last row is only ticked when the image is in.
    const tick = setInterval(() => setLv(n => Math.min(LOAD_STEPS.length - 1, n + 1)), 1500);
    const answers = {
      name: state.name.trim(),
      relationship: relation(state.rel)?.template ?? "van",
      interests: [state.fire?.name ?? "Okänt"],
      traits: [state.pairs[0]?.name ?? "Okänt", state.power?.label ?? "Okänt"],
      privateFact: state.pairs[1]?.name ?? "Okänt",
      strongestStat: state.pairs[2]?.name ?? "Okänt"
    };
    const photoBase64 = state.photo ? state.photo.split(",")[1] : undefined;
    try {
      setStatus("Skriver kortets text…");
      const r = await fetch("/api/generate", {
        method: "POST", headers: {"content-type": "application/json"},
        body: JSON.stringify({answers, photoBase64})
      });
      setStatus("Ritar kortet…");
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Kortet kunde inte skapas");
      setImg({card: `data:image/png;base64,${data.card}`, teaser: `data:image/png;base64,${data.teaser}`});
      setSettled(false);
      setPhase("pack");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Något gick fel");
    } finally {
      clearInterval(tick);
    }
  }, []);

  const advance = () => {
    if (step === "pairs" && pairI < 2) return setPairI(pairI + 1);
    if (qi < STEPS.length - 1) { setQi(qi + 1); setPairI(0); return; }
    generate(s);
  };
  const pick = () => setTimeout(advance, 160);
  const back = () => {
    if (step === "pairs" && pairI > 0) return setPairI(pairI - 1);
    if (qi > 0) { const p = qi - 1; setQi(p); setPairI(STEPS[p] === "pairs" ? 2 : 0); }
  };

  const card: CardState = {
    name: s.name, rel: s.rel, photo: s.photo, level: 0, levelSet: false, quote: s.quote,
    fire: s.fire, attack2: s.pairs[0] ? {name: s.pairs[0].name, desc: s.pairs[0].desc ?? ""} : null,
    weakness: s.pairs[1]?.name ?? "", resistance: s.pairs[2]?.name ?? "", power: s.power, active: []
  };
  const showCard = phase === "quiz" || phase === "load";

  return (
    <main className="flow">
      <header className="bar">
        <Link className="brand" href="/">So<em>Me</em>Card</Link>
        {phase === "quiz" && qi > 0 && <button className="back" type="button" onClick={back}>← Tillbaka</button>}
        {phase === "mine" && <button className="back" type="button" onClick={() => { setS(EMPTY); setQi(0); setPairI(0); setImg(null); setPhase("quiz"); }}>Börja om</button>}
      </header>

      {phase === "quiz" && (
        <div className="stage">
          <div className="cardcol">{showCard && <CardPreview s={card} />}</div>
          <section className="panel">
            <div className="prog">
              <div className="segs">{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <i key={i} className={i <= qi ? "on" : ""} />)}</div>
              <span className="n">{qi + 1} av 8</span>
            </div>
            <QuizStep s={s} set={set} step={step} pairI={pairI} advance={advance} pick={pick} nm={nm} />
          </section>
        </div>
      )}

      {phase === "load" && (
        <section className="panel">
          <h1>{gen(s.name)} kort byggs</h1>
          {err ? (
            <>
              <p className="sub">Kortet kunde inte skapas: {err}</p>
              <div className="row">
                <button className="btn" type="button" onClick={() => generate(s)}>Försök igen</button>
                <button className="btn ghost" type="button" onClick={() => { setPhase("quiz"); setQi(0); }}>Tillbaka till frågorna</button>
              </div>
            </>
          ) : (
            <div className="load">
              <div className="track"><i style={{width: `${Math.round(((lv + 1) / LOAD_STEPS.length) * 100)}%`}} /></div>
              <ul className="blog">
                {LOAD_STEPS.map((t, i) => (
                  <li key={t} className={i < lv ? "done" : i === lv ? "now" : ""}>{t}</li>
                ))}
              </ul>
              <p className="note">Kortet ritas nu. Låst text visas bara som streck, så den går inte att skärmdumpa.</p>
            </div>
          )}
        </section>
      )}

      {phase === "pack" && img && (
        <section className="reveal">
          <Unboxing key="reveal" mode="teaser" image={img.teaser} name={who}
            sub="Jag har gjort en grej till dig." cta="Tryck för att öppna." onSettled={() => setSettled(true)} />
          {settled && <Paywall s={s} set={set} who={who} started={started} onStart={() => setStarted(true)} onPaid={() => setPhase("mine")} />}
        </section>
      )}

      {phase === "mine" && (
        <section className="panel">
          <div className="fills">Efter köp · det här ser köparen</div>
          <h1>Klart. Nu är det {gen(s.name)} tur.</h1>
          <p className="sub">Packet är förseglat och väntar. Skicka länken till {s.name}.</p>
          {img && <div className="mini"><img src={img.teaser} alt="" /></div>}
          {!giftLink ? (
            <p className="note">Sparar kortet…</p>
          ) : (
            <>
              <form className="field" onSubmit={send}>
                <input type="text" placeholder="Ditt namn (frivilligt)" value={myName} onChange={e => setMyName(e.target.value)} />
                <input type="email" placeholder="mottagarens@mejl.se" value={to} onChange={e => setTo(e.target.value)} />
                <button className="btn big" type="submit" disabled={!to.trim() || sending}>
                  {sending ? "Skickar…" : `Skicka till ${s.name}`}
                </button>
              </form>
              {sent && <p className="note">{sent}</p>}
              <div className="row">
                <button className="btn ghost" type="button" onClick={async () => {
                  try { await navigator.clipboard.writeText(giftLink); setSent("Länken är kopierad."); } catch { /* ignore */ }
                }}>Kopiera länken</button>
                <Link className="btn ghost" href={giftLink.replace(/^https?:\/\/[^/]+/, "")}>Se {gen(s.name)} pack</Link>
              </div>
              <p className="note">{giftLink}</p>
            </>
          )}
        </section>
      )}
    </main>
  );
}

/** The paywall: teaser copy, what you get, the pack offers, then embedded Stripe Checkout. */
function Paywall({s, set, who, started, onStart, onPaid}: {
  s: S; set: <K extends keyof S>(k: K, v: S[K]) => void; who: string;
  started: boolean; onStart: () => void; onPaid: () => void;
}) {
  const price = s.offer === 5 ? FAMILY_PRICE : PRICE;
  return (
    <div className="paywall">
      <span className="rar">Sällsynthet: Ultra Rare</span>
      <h1>Lås upp {gen(s.name)} kort</h1>
      <p className="sub">Det du ser är bara toppen av kortet. Resten ligger kvar i packet.</p>

      <div className="sect">
        <h2>Så här blir det när du skickar det</h2>
        <div className="chat">
          <div className="who">{who}</div>
          <div className="bub me">Jag har gjort en grej till dig 👀</div>
          <div className="bub me link">📦 {gen(s.name)} pack <small>Tryck för att riva upp</small></div>
          <div className="bub them">VA 😂 det här är ju JAG</div>
        </div>
      </div>

      <div className="sect">
        <h2>Det här får du</h2>
        <div className="gets">
          <div className="get"><b>Hela kortet</b><span className="d">Du ser allt på kortet, inte bara toppen.</span></div>
          <div className="get"><b>Packet att riva upp</b><span className="d">{who} får en länk och river upp packet i mobilen.</span></div>
          <div className="get"><b>Skriv ut hemma</b><span className="d">Skriv ut, klipp ut, klart.</span></div>
          <div className="get"><b>Skicka i chatten</b><span className="d">En bild på kortet att skicka vidare.</span></div>
        </div>
      </div>

      <div className="sect">
        <h2>Välj pack</h2>
        <div className="offers2">
          <button type="button" className={`offer fam${s.offer === 5 ? " sel" : ""}`} onClick={() => set("offer", 5)}>
            <span className="tagb">Bäst värde</span>
            <b>Familjepacket · {kr(FAMILY_PRICE)}</b><span>5 kort, ca 50 kr styck</span>
          </button>
          <button type="button" className={`offer${s.offer === 1 ? " sel" : ""}`} onClick={() => set("offer", 1)}>
            <b>Bara {gen(s.name)} kort · {kr(PRICE)}</b><span>1 kort</span>
          </button>
        </div>
      </div>

      <p className="total"><span>Att betala</span><b>{kr(price)}</b></p>
      {!started ? (
        <button className="btn big" type="button" onClick={onStart}>Betala med Swish · {kr(price)}</button>
      ) : (
        <StripeCheckout pack={s.offer === 5 ? "family" : "single"} />
      )}
      <p className="note">Betalningen sker i Stripe. Swish visas för svenska köpare när det är aktiverat på kontot.</p>
      <div className="row">
        <button className="btn ghost" type="button" onClick={onPaid}>Visa efter köp: köparen (demo)</button>
      </div>
    </div>
  );
}

/** The shared grid of emoji + label choices. */
function Choices({items, selected, onPick}: {items: readonly Option[]; selected?: string; onPick: (k: string) => void}) {
  return (
    <div className="opts">{items.map(o => (
      <button key={o.key} className={`opt${selected === o.key ? " sel" : ""}`} type="button" onClick={() => onPick(o.key)}>
        <span className="e">{o.emoji}</span><span>{o.label}</span>
      </button>
    ))}</div>
  );
}

/** The own-text escape hatch the prototype offers next to every preset list. */
function OwnText({label, placeholder, max, onDone}: {label: string; placeholder: string; max: number; onDone: (v: string) => void}) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  return (
    <>
      <button className="opt own" type="button" onClick={() => setOpen(o => !o)}>✏️ {label}</button>
      {open && (
        <form className="field" onSubmit={e => { e.preventDefault(); if (v.trim()) onDone(v.trim()); }}>
          <input autoFocus maxLength={max} placeholder={placeholder} value={v} onChange={e => setV(e.target.value)} />
          <button className="btn" type="submit" disabled={!v.trim()}>Klar</button>
        </form>
      )}
    </>
  );
}

function QuizStep({s, set, step, pairI, advance, pick, nm}: {
  s: S; set: <K extends keyof S>(k: K, v: S[K]) => void; step: Step; pairI: number;
  advance: () => void; pick: () => void; nm: string;
}) {
  const g = gen(nm);

  if (step === "name") return (
    <>
      <h1>Vem ska få ett kort?</h1>
      <p className="sub">Skriv namnet så dyker det upp på kortet direkt.</p>
      <form className="field" onSubmit={e => { e.preventDefault(); if (s.name.trim()) advance(); }}>
        <input autoFocus maxLength={18} placeholder="T.ex. Anna" value={s.name} onChange={e => set("name", e.target.value)} />
        <button className="btn" type="submit" disabled={!s.name.trim()}>Nästa</button>
      </form>
      <ol className="steps3">
        <li><b>Steg 1</b><strong>Gör ett utkast</strong><span>Gratis</span></li>
        <li><b>Steg 2</b><strong>Kika på kortet</strong><span>Gratis</span></li>
        <li><b>Steg 3</b><strong>Lås upp och skicka</strong><span>{kr(PRICE)}</span></li>
      </ol>
    </>
  );

  if (step === "rel") return (
    <>
      <h1>Vem är {nm} för dig?</h1>
      <p className="sub">Svaret bestämmer kortets typ och färg.</p>
      <Choices items={RELATIONS.map(r => ({key: r.key, label: r.label, emoji: r.emoji}))} selected={s.rel}
        onPick={k => { set("rel", k); pick(); }} />
    </>
  );

  if (step === "photo") return (
    <>
      <h1>Har du en bild på {nm}?</h1>
      <p className="sub">Bilden hamnar i holo-ramen. Frivilligt — du kan lägga till den senare.</p>
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
      <Choices items={FIRE} selected={s.fire?.key} onPick={k => { set("fire", FIRE.find(o => o.key === k) ?? null); pick(); }} />
      <OwnText label="Skriv eget" placeholder="T.ex. Padel" max={22}
        onDone={v => { set("fire", {key: "_own", label: v, emoji: "✏️", name: v, r: "+50 " + v + ". Den känner alla igen."}); pick(); }} />
    </>
  );

  if (step === "pairs") {
    const P = PAIRS[pairI];
    const dynamic = pairI === 1 && s.fire && WEAK[s.fire.key];
    const options = dynamic
      ? WEAK[s.fire!.key].map(t => ({label: t, name: t}))
      : P.options;
    const q = P.q.replace("{n}", nm).replace("{g}", g);
    const setPair = (r: PairResult) => { const p: [PairResult, PairResult, PairResult] = [...s.pairs]; p[pairI] = r; set("pairs", p); pick(); };
    return (
      <>
        <h1>{q}</h1>
        <p className="sub">Snabbrunda {pairI + 1} av 3.{dynamic ? ` Förslagen bygger på ${s.fire!.name}.` : ""}</p>
        <div className="vs">{options.map((o, i) => (
          <button key={i} className={`opt${s.pairs[pairI]?.name === o.name ? " sel" : ""}`} type="button"
            onClick={() => setPair({name: o.name, desc: "name" in o && (o as any).desc})}>{o.label}</button>
        ))}</div>
        <OwnText label={P.ownLabel} placeholder={P.ownPlaceholder} max={P.ownMax}
          onDone={v => setPair({name: v, desc: pairI === 0 ? "Händer varje gång. Motståndaren hinner aldrig reagera." : undefined})} />
      </>
    );
  }

  if (step === "power") return (
    <>
      <h1>Vilken är {g} signaturkraft?</h1>
      <p className="sub">Den blir special power och strength.</p>
      <Choices items={POWER} selected={s.power?.key} onPick={k => { set("power", POWER.find(o => o.key === k) ?? null); pick(); }} />
      <OwnText label="Skriv egen kraft" placeholder="T.ex. Hittar alltid en parkeringsplats" max={60}
        onDone={v => { set("power", {key: "_own", label: v, emoji: "✏️", sp: v.replace(/[.!]+$/, "") + ". Ingen vet hur, men det händer varje gång.", st: "Oslagbar på hemmaplan"}); pick(); }} />
    </>
  );

  if (step === "quote") return (
    <>
      <h1>Vad säger {nm} alltid?</h1>
      <p className="sub">Frivilligt. En mening som bara ni känner igen.</p>
      <form className="field" onSubmit={e => { e.preventDefault(); advance(); }}>
        <input maxLength={40} placeholder="Skriv med egna ord" value={s.quote} onChange={e => set("quote", e.target.value)} />
        <button className="btn" type="submit">Lägg till</button>
      </form>
      <div className="sect"><h2>Eller tryck på ett exempel</h2>
        <div className="chips">{QUOTE_EXAMPLES.map(t => (
          <button key={t} className="chipb" type="button" onClick={() => set("quote", t)}>{t}</button>
        ))}</div>
      </div>
      <div className="row"><button className="btn ghost" type="button" onClick={() => { set("quote", ""); advance(); }}>Hoppa över</button></div>
    </>
  );

  return (
    <>
      <h1>Vart ska vi skicka {g} kort?</h1>
      <p className="sub">Vi mejlar länken så att du hittar tillbaka. Frivilligt.</p>
      <form className="field" onSubmit={e => { e.preventDefault(); advance(); }}>
        <input type="email" placeholder="din@mejl.se" value={s.email} onChange={e => set("email", e.target.value)} />
        <button className="btn" type="submit">Skapa kortet</button>
      </form>
      <div className="row"><button className="btn ghost" type="button" onClick={() => { set("email", ""); advance(); }}>Hoppa över</button></div>
      <p className="note">Förhandsvisningen är gratis. Hela kortet kostar {kr(PRICE)}, och du betalar först om du vill låsa upp det.</p>
    </>
  );
}
