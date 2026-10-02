/**
 * The image path. Two prompts, one function each:
 *   1. the quiz answers become the card's text as JSON,
 *   2. that text plus the relation's blank template plus the customer's photo become the card.
 *
 * The template already carries the relation's colour and its symbol inside the orbs, so the model
 * is only ever asked to FILL a template - never to recolour it or draw a symbol.
 * Reference: reference/somecard-masterprompt.md.
 */
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';

export type RelationKey = 'mamma'|'pappa'|'partner'|'syskon'|'basta_van'|'van'|'kollega';

export const TEMPLATES: Record<RelationKey,{label:string;symbol:string;ink:string}> = {
  mamma:{label:'Mamma',symbol:'Heart',ink:'dark purple'},
  pappa:{label:'Pappa',symbol:'Crown',ink:'dark navy'},
  partner:{label:'Partner',symbol:'Two interlocked rings',ink:'dark burgundy'},
  syskon:{label:'Syskon',symbol:'Two boxing gloves',ink:'dark green'},
  basta_van:{label:'Bästa vän',symbol:'Star',ink:'dark brown'},
  van:{label:'Vän',symbol:'Thumbs-up',ink:'dark teal'},
  kollega:{label:'Kollega',symbol:'Coffee cup',ink:'dark charcoal'}
};

export function templateFor(relationship:string):RelationKey {
  const raw=relationship.trim().toLowerCase();
  const map:Record<string,RelationKey>={mamma:'mamma',pappa:'pappa',partner:'partner',syskon:'syskon',
    'bästa vän':'basta_van',basta_van:'basta_van',kompis:'van','vän':'van',van:'van',kollega:'kollega'};
  return map[raw] ?? 'van';
}

export interface Answers {name:string; relationship:string; interests:string[]; traits:string[]; strongestStat:string; privateFact:string;}
export interface CardText {name:string; level:number; top_line:string; caption:string; special_power_title:string;
  special_power_text:string; attack_1:{name:string;damage:number}; attack_2:{name:string;damage:number;description:string};
  weakness:string; resistance:string; strength:string; rarity:'Rare'|'Epic'|'Legendary'|'Ultra Rare';}

const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-4.1-mini';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini';
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium';
const CARD_WIDTH = 1744, CARD_HEIGHT = 2336;

const textPrompt = (a:Answers) => `You write the text for a personalised trading card that someone is giving to a person they love. It is an affectionate roast: it should make the recipient laugh and say "that is so me". Answer with JSON only.

name: ${a.name}
relation to buyer: ${a.relationship}
fires_up: ${a.interests[0] ?? 'Okänt'}
habit: ${a.traits[0] ?? 'Okänt'}
kryptonite: ${a.privateFact ?? 'Okänt'}
immune_to: ${a.strongestStat ?? 'Okänt'}
signature_power: ${a.traits[1] ?? a.traits[0] ?? 'Okänt'}

Write in Swedish with correct å, ä, ö. Warm, playful, specific. Tease habits and quirks, never the person's worth. Use only what the buyer told you - never invent jobs, places or other people. No comments on looks, body, age, health, religion, ethnicity, sexuality, politics or money. No profanity, nothing sexual. If an input is hateful or meant to hurt, answer {"needs_review":true,"reason":"<short>"} instead.

Return exactly:
{"needs_review":false,"name":"<exactly as given>","level":<40-99>,"top_line":"<max 45>","caption":"<max 40, format: Relation. Short title.>","special_power_title":"<max 45, three roles separated by commas>","special_power_text":"<max 170, two or three sentences>","attack_1":{"name":"<max 22>","damage":50},"attack_2":{"name":"<max 22>","damage":100,"description":"<max 90>"},"weakness":"<max 18>","resistance":"<max 14>","strength":"<max 45>","rarity":"<Rare|Epic|Legendary|Ultra Rare>"}`;

const imagePrompt = (t:CardText, k:RelationKey, hasPhoto:boolean) => `Create one finished trading card by filling in the blank card template (the first reference image) with the photo${hasPhoto?' (the second reference image)':''} and the text below.

LAYOUT
- Keep the template's layout, frame, colours, borders, textures and positions exactly as they are. Do not redesign, move or resize anything.
- Keep every orb exactly as in the template, same size and position, including the white ${TEMPLATES[k].symbol} symbol inside each orb. Do not enlarge, change, remove or replace them.
- Show the card flat and straight from the front, same framing and transparent background as the template. No hand, no table, no shadow outside the card.

THE PICTURE WINDOW
- ${hasPhoto?'Do not cut the person out. Place the whole photo inside the picture window edge to edge, keeping its real background. The main person must be the clear subject with their face fully visible. Keep their face, hair, expression and clothes exactly as in the photo - it must stay a real photograph. Over it add only a light holographic foil effect: a few small four-point stars and a faint shimmer near the edges, never covering the face. In the small portrait square inside the gold seal, place a tiny crop of the same face.':'No photo was provided. Leave the picture window and the small portrait square in the gold seal exactly as they are in the template: holographic background only, no person.'}

TEXT
Render every text below exactly as written, character for character, including å, ä, ö, in a bold rounded sans-serif in ${TEMPLATES[k].ink} that matches the labels already on the template.
- Top line, small italic, right-aligned at the very top: ${t.top_line}
- Name, large and bold, in the header row right of the gold seal: ${t.name}
- Level, bold, right of the name: LV. ${t.level}
- Caption on the gold banner under the picture window, small bold italic, centred: ${t.caption}
- Special power paragraph in the open area under the banner, left-aligned, starting in bold: Special power: ${t.special_power_title}. Then regular weight: ${t.special_power_text}
- First attack row: ${t.attack_1.name} centred in bold, 50 large and bold at the far right.
- Second attack row: ${t.attack_2.name} centred in bold, 100 large at the far right, and under it in small italic: ${t.attack_2.description}
- Bottom row: under weakness write ${t.weakness}; under resistance write ${t.resistance}; under strength write ${t.strength}.

DO NOT
- No text other than the above plus the three existing labels. No watermark or signature.
- No logos, symbols, characters or wording from any existing trading card game.
- Do not change the name or any number.`;

async function openai(path:string, body:unknown, timeoutMs=240000):Promise<any>{
  const response=await fetch(`https://api.openai.com/v1/${path}`,{method:'POST',
    headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY ?? ''}`,'Content-Type':'application/json'},
    body:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(`${path} failed (${response.status}): ${(data as any)?.error?.message ?? 'no detail'}`);
  return data;
}

/** Prompt 1. Throws if the model's JSON cannot be used; the caller decides what to show. */
export async function cardText(a:Answers):Promise<CardText>{
  const data=await openai('chat/completions',{model:TEXT_MODEL,response_format:{type:'json_object'},
    messages:[{role:'user',content:textPrompt(a)}],max_tokens:1200},60000);
  const parsed=JSON.parse(data.choices?.[0]?.message?.content ?? '{}');
  if(parsed.needs_review)throw new Error(`Card text flagged for review: ${parsed.reason ?? 'no reason'}`);
  if(parsed.name?.trim().toLowerCase()!==a.name.trim().toLowerCase())throw new Error('Card text changed the name');
  return parsed as CardText;
}

/** Prompt 2. Template first (the card being filled in), the customer's photo second. */
export async function cardImage(photo:Buffer|null, relationship:string, text:CardText):Promise<Buffer>{
  const key=templateFor(relationship);
  const form=new FormData();
  form.append('model',IMAGE_MODEL);
  form.append('quality',IMAGE_QUALITY);
  form.append('background','transparent');
  form.append('size','1024x1536');
  form.append('prompt',imagePrompt(text,key,Boolean(photo)));
  form.append('image[]',new Blob([new Uint8Array(await readFile(`public/templates/ref/${key}.png`))],{type:'image/png'}),`${key}.png`);
  if(photo)form.append('image[]',new Blob([new Uint8Array(photo)],{type:'image/jpeg'}),'photo.jpg');
  const response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',
    headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY ?? ''}`},body:form,signal:AbortSignal.timeout(280000)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(`images/edits failed (${response.status}): ${(data as any)?.error?.message ?? 'no detail'}`);
  const b64=(data as any).data?.[0]?.b64_json;
  if(!b64)throw new Error('The image model returned no image');
  // the API's sizes are its own: fit the result back onto the template's exact canvas
  return sharp(Buffer.from(b64,'base64')).resize({width:CARD_WIDTH,height:CARD_HEIGHT,fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
}

/** Cropped, watermarked top of the card for the pre-payment teaser. */
export async function cardTeaser(card:Buffer, share=0.46):Promise<Buffer>{
  const height=Math.round(CARD_HEIGHT*share);
  const watermark=Buffer.from(`<svg width="${CARD_WIDTH}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="86%" text-anchor="middle" font-family="sans-serif" font-size="88" font-weight="700"
      fill="rgba(255,255,255,0.32)">FÖRHANDSVISNING</text></svg>`);
  return sharp(card).extract({left:0,top:0,width:CARD_WIDTH,height}).composite([{input:watermark,top:0,left:0}]).png().toBuffer();
}
