/**
 * Reveal state machine. Persisted on the card so a refresh (or a returning gift
 * recipient) resumes exactly where they left off instead of replaying from zero.
 */
export const REVEAL_STEPS=['pack','open','back','flip','interrupt','clues','legendary','teaser','paywall'] as const;
export type RevealStep=typeof REVEAL_STEPS[number];
export interface RevealProgress {step:RevealStep; cluesSeen:number; updatedAt:string;}

export function isRevealStep(value:unknown):value is RevealStep{
  return typeof value==='string'&&(REVEAL_STEPS as readonly string[]).includes(value);
}

export function nextStep(step:RevealStep):RevealStep{
  const index=REVEAL_STEPS.indexOf(step);
  return REVEAL_STEPS[Math.min(index+1,REVEAL_STEPS.length-1)];
}

/** How many mascot clues are visible at a given step. */
export function cluesVisibleAt(step:RevealStep,cluesSeen:number){
  return step==='clues'||step==='legendary'||step==='teaser'||step==='paywall'?Math.max(0,cluesSeen):0;
}

export interface RevealResume {step:RevealStep; cluesSeen:number; replayed:boolean;}
/**
 * Resume rules: everything before the flip is cheap to replay (the user has not seen
 * anything yet), so a half-finished booster starts over. Once the card has been
 * flipped we jump straight back to where they stopped.
 */
export function resumeReveal(progress:RevealProgress|null|undefined):RevealResume{
  if(!progress||!isRevealStep(progress.step))return {step:'pack',cluesSeen:0,replayed:false};
  const index=REVEAL_STEPS.indexOf(progress.step);
  const flip=REVEAL_STEPS.indexOf('flip');
  if(index<=flip)return {step:'pack',cluesSeen:0,replayed:false};
  const cluesSeen=Number.isFinite(progress.cluesSeen)?Math.max(0,Math.floor(progress.cluesSeen)):0;
  return {step:progress.step,cluesSeen,replayed:true};
}

export function progressFor(step:RevealStep,cluesSeen:number):RevealProgress{
  return {step,cluesSeen:Math.max(0,Math.floor(cluesSeen)),updatedAt:new Date().toISOString()};
}

/** SEK amount in öre -> whole-kronor string, e.g. 9900 -> "99 kr". */
export function formatPriceSEK(price:number):string{
  return `${Math.round((Number.isFinite(price)?price:0)/100)} kr`;
}
