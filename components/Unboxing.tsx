"use client";

/**
 * The reveal. One component, two modes:
 *   teaser — the pack opens and only the card's upper 46% is released (pre-payment)
 *   full   — the whole card is released (the recipient)
 * Native CSS keyframes for the sequence, a small state machine for control. No animation library.
 *
 * Layer order, back to front: foil back → card → wrapper sleeve → seal/seam/tear/lips → light,
 * shine, sparks. The card moves relative to the torn wrapper; the wrapper never just fades.
 */
import {useCallback, useEffect, useRef, useState} from "react";

const OPEN_MS = 3100;

export default function Unboxing({image, mode, name, sub, cta, onSettled}: {
  image: string;
  mode: "teaser" | "full";
  name: string;
  sub: string;
  cta: string;
  onSettled?: () => void;
}) {
  const [state, setState] = useState<"sealed" | "opening" | "settled">("sealed");
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  const open = useCallback(() => setState(s => (s === "sealed" ? "opening" : s)), []);
  const skip = useCallback(() => setState(s => (s === "opening" ? "settled" : s)), []);

  useEffect(() => {
    if (state !== "opening") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setState("settled"), reduced ? 300 : OPEN_MS);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") skip(); };
    const onWheel = () => skip();
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, {passive: true});
    return () => { window.clearTimeout(t); window.removeEventListener("keydown", onKey); window.removeEventListener("wheel", onWheel); };
  }, [state, skip]);

  useEffect(() => { if (state === "settled") settledRef.current?.(); }, [state]);

  return (
    <div className="ub" data-mode={mode} data-state={state}>
      <div className="ub-halo" aria-hidden="true" />
      <div className="ub-stage">
        <div className="ub-foil" aria-hidden="true" />
        <div className="ub-card"><img src={image} alt="" draggable={false} /></div>
        <div className="ub-sleeve" aria-hidden="true" />
        <div className="ub-seal" aria-hidden="true" />
        <div className="ub-seam" aria-hidden="true" />
        <div className="ub-lip l" aria-hidden="true" />
        <div className="ub-lip r" aria-hidden="true" />
        <div className="ub-tear" aria-hidden="true" />
        <div className="ub-copy">
          <span className="ub-brand">So<em>Me</em>Card</span>
          <span className="ub-name">{name}</span>
          <span className="ub-sub">{sub}</span>
          <span className="ub-cta">{cta}</span>
        </div>
        <div className="ub-light" aria-hidden="true" />
        <div className="ub-shine" aria-hidden="true" />
        <div className="ub-sparks" aria-hidden="true">{"✦".repeat(8)}</div>
      </div>
      {state === "sealed" && <button className="ub-hit" type="button" onClick={open} aria-label={cta} />}
      {state === "opening" && <button className="ub-skip" type="button" onClick={skip}>Hoppa framåt</button>}
    </div>
  );
}
