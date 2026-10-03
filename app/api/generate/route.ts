import {NextResponse} from 'next/server';
import {cardText, cardImage, cardTeaser} from '@/lib/image-gen';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * The whole image path in one call: answers (+ optional photo) in, the card's text and two PNGs out.
 * POST /api/generate
 * body: {answers:Answers, photoBase64?:string}
 * out:  {text:CardText, card:string, teaser:string}   // base64 PNGs
 */
export async function POST(request: Request) {
  try {
    const {answers, photoBase64} = await request.json();
    if (!answers?.name || !answers?.relationship) {
      return NextResponse.json({error: 'name and relationship are required'}, {status: 400});
    }
    const photo = photoBase64 ? Buffer.from(photoBase64, 'base64') : null;
    const text = await cardText(answers);
    const card = await cardImage(photo, answers.relationship, text);
    const teaser = await cardTeaser(card);
    return NextResponse.json({text, card: card.toString('base64'), teaser: teaser.toString('base64')});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'generation failed';
    console.error('generate_failed', message);
    return NextResponse.json({error: message}, {status: 500});
  }
}
