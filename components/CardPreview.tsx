"use client";

/**
 * The live card column, as in the prototype: the provided relation template with the answers
 * filling its slots. Positions are percentages of the template's 1744×2336 canvas.
 */
import {relation} from "@/lib/quiz-data";

export interface CardState {
  name: string;
  rel: string;
  photo: string;
  level: number;
  levelSet: boolean;
  quote: string;
  fire: {name: string} | null;
  attack2: {name: string; desc: string} | null;
  weakness: string;
  resistance: string;
  power: {sp: string; st: string} | null;
  active: string[];
}

/** One text slot. `key` re-mounts the span so a new answer replays the pop animation. */
function Slot({value, className, active, placeholder = "???"}: {
  value: string; className: string; active: boolean; placeholder?: string;
}) {
  const filled = Boolean(value);
  return (
    <div className={`p-slot ${className}${filled ? "" : " empty"}${active ? " active" : ""}`}>
      {filled ? <span key={value} className="pop">{value}</span> : placeholder}
    </div>
  );
}

export default function CardPreview({s}: {s: CardState}) {
  const rel = relation(s.rel);
  const template = rel?.template ?? "basta_van";
  const sp = s.power?.sp ?? "";
  return (
    <div className="p-card" data-template={template} aria-hidden="true">
      <img className="p-base" src={`/templates/preview/${template}.webp`} alt="" draggable={false} />
      {s.photo && <img className="p-photo" src={s.photo} alt="" />}
      <Slot className="p-top" active={s.active.includes("top")} placeholder="" value={s.quote ? `”${s.quote}”` : (rel?.top ?? "")} />
      <Slot className="p-name" active={s.active.includes("name")} value={s.name} />
      <Slot className="p-lv" active={s.active.includes("lv")} placeholder="LV. ?" value={s.levelSet ? `LV. ${s.level}` : ""} />
      <Slot className="p-cap" active={s.active.includes("cap")} placeholder="" value={rel?.cap ?? ""} />
      <div className={`p-slot p-sp${sp ? "" : " empty"}${s.active.includes("sp") ? " active" : ""}`}>
        <b>Special power: {rel?.sp ?? "Legend"}.</b> {sp || "???"}
      </div>
      <Slot className="p-a1n" active={s.active.includes("a1")} placeholder="Attack 1" value={s.fire?.name ?? ""} />
      <div className={`p-slot p-a1d${s.fire ? "" : " empty"}`}>{s.fire ? "50" : "?"}</div>
      <div className={`p-slot p-a2n${s.attack2 ? "" : " empty"}${s.active.includes("a2") ? " active" : ""}`}>
        {s.attack2 ? <><span key={s.attack2.name} className="pop">{s.attack2.name}</span>
          <i>{s.attack2.desc}</i></> : "Attack 2"}
      </div>
      <div className={`p-slot p-a2d${s.attack2 ? "" : " empty"}`}>{s.attack2 ? "100" : "?"}</div>
      <Slot className="p-weak" active={s.active.includes("weak")} value={s.weakness} />
      <Slot className="p-res" active={s.active.includes("res")} value={s.resistance} />
      <Slot className="p-str" active={s.active.includes("str")} value={s.power?.st ?? ""} />
    </div>
  );
}
