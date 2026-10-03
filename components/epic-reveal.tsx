"use client";

import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {ArrowRight, Check, LockKeyhole, Share2, Sparkles, Star} from "@/components/icons";
import {cluesVisibleAt, formatPriceSEK, nextStep, type RevealStep} from "@/lib/reveal";
import {Mascot, type MascotMood} from "@/components/mascot";
// The reveal shares one stylesheet with the server-driven entry point (that module owns
// the visual language for both).
import styles from "./gift-reveal.module.css";

export interface EpicRevealData {
  name:string; epithet:string; roast:string[]; clues:string[];
  heroUrl:string|null; partialUrl:string|null; cardTitle:string|null;
  paid:boolean; priceSEK:number;
  senderName?:string|null; greeting?:string|null; senderLine?:string|null;
}

export interface EpicRevealProps {
  data:EpicRevealData;
  audience?:"owner"|"recipient"|"local";
  initialStep?:RevealStep;
  initialClues?:number;
  busy?:boolean;
  notice?:string|null;
  /** Called on every stage change so the caller can persist progress. */
  onProgress?:(step:RevealStep,cluesSeen:number)=>void;
  /** Starts the purchase (or the local preview unlock). */
  onUnlock?:()=>void;
  unlockLabel?:string;
  consentRequired?:boolean;
  /** Slot rendered next to the paywall actions (share buttons, gift link, …). */
  actions?:ReactNode;
}

const STEP_COPY:{[key in RevealStep]:{kicker:string;title:string;body:string}} = {
  pack:{kicker:"That's So Me! · försegling",title:"Dra fingret över förpackningen",body:"Kortet öppnas bara av den som vågar dra."},
  open:{kicker:"Förseglingen är bruten",title:"Baksidan glider ut",body:"Den där baksidan som ingen annan får se."},
  back:{kicker:"Baksidan",title:"Nu vänder vi på det",body:"Tryck eller svep för att vända kortet."},
  flip:{kicker:"Kortet vänds",title:"…",body:""},
  interrupt:{kicker:"Vänta…",title:"Det här brukar inte hända",body:"Kortet reagerar på något."},
  clues:{kicker:"Maskoten hittade något",title:"Känner du igen det här?",body:"Ledtrådar som bara stämmer på en person."},
  legendary:{kicker:"Nu händer det",title:"Det här är …",body:""},
  teaser:{kicker:"Bara en glimt",title:"Resten är låst",body:"Vi visar en liten del. Resten får du själv."},
  paywall:{kicker:"Lås upp",title:"Lås upp hela kortet",body:"Delningen är gratis. Kortet är för alltid."},
};
const MOODS:{[key in RevealStep]:MascotMood} = {
  pack:"idle",open:"happy",back:"idle",flip:"happy",interrupt:"sus",clues:"sus",legendary:"epic",teaser:"epic",paywall:"epic",
};
const DRAG_THRESHOLD=52;
const CONFETTI=Array.from({length:14},(_,index)=>index);

function haptic(pattern:number|number[]){try{navigator.vibrate?.(pattern);}catch{/* unsupported: ignore */}}

/**
 * The reveal itself: booster swipe, holo shine, card back, flip, the pattern interrupt,
 * the mascot clues, the legendary burst and the partial card. It is pure presentation —
 * it never fetches anything — so the same animation runs for a real card served by the
 * API and for the offline preview that keeps the site usable when the database is down.
 */
export function EpicReveal({data,audience="owner",initialStep="pack",initialClues=0,busy=false,notice=null,onProgress,onUnlock,unlockLabel,consentRequired=true,actions}:EpicRevealProps){
  const [step,setStep]=useState<RevealStep>(initialStep==="paywall"&&!data.paid?"paywall":initialStep);
  const [cluesSeen,setCluesSeen]=useState(initialClues);
  const [drag,setDrag]=useState(0);
  const [interruptStage,setInterruptStage]=useState(0);
  const [consent,setConsent]=useState(!consentRequired);
  const [localNotice,setLocalNotice]=useState("");
  const dragStart=useRef<{x:number;y:number}|null>(null);
  const partial=data.partialUrl||data.heroUrl;
  // The cinematic opening only greets a recipient arriving at the very start of the reveal.
  // It is deliberately not a reveal step, so persisted progress is untouched.
  const [showIntro,setShowIntro]=useState(audience==="recipient"&&initialStep==="pack");

  useEffect(()=>{if(step!=="interrupt")return;setInterruptStage(0);const timer=setTimeout(()=>{setInterruptStage(1);haptic([18,40,26]);},900);return()=>clearTimeout(timer)},[step]);
  useEffect(()=>{if(step!=="legendary")return;haptic([26,50,60]);const timer=setTimeout(()=>setStep("teaser"),1500);return()=>clearTimeout(timer)},[step]);

  const goTo=useCallback((next:RevealStep,clues=cluesSeen)=>{setStep(next);setCluesSeen(clues);onProgress?.(next,clues);},[cluesSeen,onProgress]);

  const copy=step==='paywall'?{...STEP_COPY[step],title:`${STEP_COPY.paywall.title} för ${formatPriceSEK(data.priceSEK)}`}:STEP_COPY[step];
  const visibleClues=cluesVisibleAt(step,cluesSeen);
  const nextAction=()=>goTo(nextStep(step),cluesSeen);
  const revealClue=()=>{const next=Math.min(data.clues.length,cluesSeen+1);haptic(12);if(next>=data.clues.length)void goTo("legendary",next);else void goTo("clues",next)};
  const onPointerDown=(event:React.PointerEvent<HTMLDivElement>)=>{dragStart.current={x:event.clientX,y:event.clientY};(event.target as HTMLElement).setPointerCapture?.(event.pointerId)};
  const onPointerMove=(event:React.PointerEvent<HTMLDivElement>)=>{if(!dragStart.current)return;const dx=event.clientX-dragStart.current.x,dy=event.clientY-dragStart.current.y;const travelled=Math.hypot(dx,dy);setDrag(Math.min(1,travelled/(DRAG_THRESHOLD*2)));if(travelled>=DRAG_THRESHOLD){dragStart.current=null;haptic(16);void goTo("open")}};
  const onPointerUp=()=>{dragStart.current=null;setDrag(0)};
  const unlock=()=>{if(consentRequired&&!consent){setLocalNotice("Bekräfta att du vill få ditt kort direkt.");return}setLocalNotice("");onUnlock?.()};

  if(showIntro)return <section className={styles.cinema}>
    <p className={styles.cinemaKicker}>Ett kort till dig</p>
    <h2 className={styles.cinemaTitle}>{data.senderName?<>{data.senderName} har gjort<br/>ett kort till dig.</>:<>Någon har gjort<br/>ett kort till dig.</>}</h2>
    <p className={styles.cinemaBody}>{data.greeting?`“${data.greeting}”`:"Tio sekunder. Sedan är det din tur."}</p>
    <button className="button" onClick={()=>setShowIntro(false)}>Öppna packet <ArrowRight size={18}/></button>
  </section>;

  return <section className={styles.stage} data-step={step}>
    <p className={styles.kicker}>{copy.kicker}</p>
    <h1 className={styles.title}>{step==="clues"&&data.senderLine?data.senderLine:copy.title}</h1>
    {copy.body&&<p className={styles.body}>{copy.body}</p>}

    {step==="pack"&&<div className={styles.pack} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} role="button" tabIndex={0} aria-label="Dra över förpackningen för att öppna" onKeyDown={event=>{if(event.key==="Enter"||event.key===" ")void goTo("open")}}>
      <img className={styles.packArt} src="/reveal/foil-booster.png" alt="" aria-hidden="true"/>
      {data.heroUrl&&<span className={styles.packPeek} style={{opacity:.35+drag*.6,backgroundImage:`url(${data.heroUrl})`}} aria-hidden="true"/>}
      <div className={styles.packShine} style={{opacity:.25+drag*.75}}/>
      <div className={styles.packProgress}><i style={{width:`${Math.round(drag*100)}%`}}/></div>
    </div>}

    {step==="open"&&<div className={styles.slide}><div className={styles.backFace}><CardBackDesign epithet={data.epithet} instruction="DET FÖRSEGLADE KORTET"/></div></div>}

    {(step==="back"||step==="flip")&&<button type="button" className={styles.backFace} onClick={()=>{haptic(14);void goTo("interrupt")}}>
      <CardBackDesign epithet={data.epithet} instruction="Tryck eller svep för att vända"/>
    </button>}

    {step==="interrupt"&&<div className={styles.interrupt}>
      <Mascot mood="sus" line={interruptStage===0?"Vänta…":"Det här brukar inte hända."}/>
      {interruptStage===1&&<button className="button" onClick={()=>void goTo("clues",0)}>Fortsätt <ArrowRight size={18}/></button>}
    </div>}

    {step==="clues"&&<div className={styles.clues}>
      <Mascot mood="sus" line={`Hanterade ledtrådar: ${visibleClues}/${data.clues.length}`}/>
      <ul>{data.clues.slice(0,visibleClues).map(clue=><li key={clue}>{clue}</li>)}</ul>
      <button className="button" onClick={revealClue}>{cluesSeen>=data.clues.length?"Se kortet":visibleClues===0?"Visa första ledtråden":"Nästa ledtråd"} <Sparkles size={18}/></button>
    </div>}

    {step==="legendary"&&<div className={styles.burst}>
      {CONFETTI.map(index=><span key={index} className={styles.spark} style={{"--angle":`${index*(360/CONFETTI.length)}deg`,"--delay":`${index*22}ms`} as React.CSSProperties}/>)}
      <b>Det är du!</b>
    </div>}

    {(step==="teaser"||step==="paywall")&&<div className={styles.revealWrap}>
      <div className={styles.partial}>
        {partial?<img src={partial} alt={`En del av kortet ${data.name}`}/>:<div className={styles.partialFallback}><LockKeyhole size={26}/><span>Kortet är fortfarande förseglat</span></div>}
        <div className={styles.partialMask}/>
        {data.paid&&<span className={styles.holoSweep} aria-hidden="true"/>}
        <p className={styles.partialNote}><LockKeyhole size={14}/> {data.paid?"Kortet är upplåst":"Bara en glimt — resten är låst"}</p>
      </div>
      <ul className={styles.roast}>{data.roast.slice(0,3).map(line=><li key={line}>{line}</li>)}</ul>
    </div>}

    <div className={styles.actions}>
      {step!=="pack"&&step!=="legendary"&&step!=="paywall"&&step!=="teaser"&&<button className={styles.skip} onClick={()=>void nextAction()}>Hoppa över</button>}
      {step==="teaser"&&<button className="button" onClick={()=>void goTo("paywall")}><LockKeyhole size={18}/> Lås upp hela kortet</button>}
    </div>
  </section>;

  function CardBackDesign({epithet,instruction}:{epithet:string;instruction:string}){
    return <>
      <div className={styles.backDecor} aria-hidden="true"><i className={styles.curveTop}/><i className={styles.curveBottom}/><span className={styles.starOne}>✦</span><span className={styles.starTwo}>✦</span><span className={styles.starThree}>✦</span><span className={styles.starFour}>✦</span><b className={styles.meBadge}>ME!</b></div>
      <div className={styles.backCopy}><span>That’s So Me!</span><b>{epithet}</b><small>{instruction}</small></div>
    </>;
  }
}

/** The unlock/offer card shown once the visitor has seen the partial card. */
export function EpicPaywall({data,busy=false,notice=null,onUnlock,unlockLabel,consentRequired=true,actions}:EpicRevealProps){
  const [consent,setConsent]=useState(!consentRequired);
  const [localNotice,setLocalNotice]=useState("");
  const label=unlockLabel||`Lås upp för ${formatPriceSEK(data.priceSEK)}`;
  return <section className={styles.paywall}>
    <h2>{data.paid?"Kortet är upplåst":`Lås upp hela kortet för ${formatPriceSEK(data.priceSEK)}`}</h2>
    <p className={styles.body}>{data.cardTitle?`“${data.cardTitle}” — `:""}hela kortet, alla skämt och nedladdningsbara bilder. Delningen är alltid gratis.</p>
    {data.paid?<p className={styles.body}><Star size={16}/> Allt är öppet. Dela det med familjen.</p>:<div className={styles.paywallActions}>
      {consentRequired&&<label className={styles.consent}><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/> Jag godkänner leverans av min digitala produkt och förstår att den skapas personligt.</label>}
      <button className="button" disabled={busy} onClick={()=>{if(consentRequired&&!consent){setLocalNotice("Bekräfta att du vill få ditt kort direkt.");return}onUnlock?.()}}>{busy?"Öppnar…":label} <LockKeyhole size={18}/></button>
    </div>}
    {actions}
    {(notice||localNotice)&&<p className={styles.notice} role="alert">{notice||localNotice}</p>}
  </section>;
}

export function EpicShareButton({url,onShare}:{url?:string;onShare?:()=>void}){
  return <button type="button" className="button quiet" onClick={onShare}><Share2 size={17}/> Dela med familjen{url?" ✓":""}</button>;
}

export function EpicDone({children}:{children:ReactNode}){
  return <p className={styles.body}><Check size={16}/> {children}</p>;
}
