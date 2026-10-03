import {NextResponse} from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Creates an embedded Stripe Checkout Session for the pack.
 * POST /api/checkout  {pack?: 'single'|'family', returnOrigin: string}
 * out: {clientSecret} — or 503 {error:'not-configured'} when STRIPE_SECRET_KEY is unset.
 *
 * Swish is requested first; if the account has not activated it, the session is retried card-only
 * and the response says so, rather than failing the purchase.
 */
const PACKS = {
  single: {amount: 9900, name: 'SoMeCard · 1 kort'},
  family: {amount: 24900, name: 'SoMeCard · Familjepacket, 5 kort'}
} as const;

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json(
      {error: 'not-configured', message: 'STRIPE_SECRET_KEY is not set on this deployment'},
      {status: 503}
    );
  }

  let body: {pack?: 'single' | 'family'; returnOrigin?: string};
  try { body = await request.json(); } catch { body = {}; }
  const pack = body.pack === 'family' ? 'family' : 'single';
  const price = PACKS[pack];
  const origin = body.returnOrigin?.replace(/\/$/, '') || 'https://leanpokemon.vercel.app';

  const base = () => {
    const p = new URLSearchParams();
    p.set('mode', 'payment');
    p.set('ui_mode', 'embedded');
    p.set('return_url', `${origin}/create?paid=1&pack=${pack}`);
    p.set('line_items[0][quantity]', '1');
    p.set('line_items[0][price_data][currency]', 'sek');
    p.set('line_items[0][price_data][unit_amount]', String(price.amount));
    p.set('line_items[0][price_data][product_data][name]', price.name);
    return p;
  };

  const create = async (methods: string[]) => {
    const p = base();
    methods.forEach((m, i) => p.set(`payment_method_types[${i}]`, m));
    return fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded'},
      body: p,
      signal: AbortSignal.timeout(20000)
    });
  };

  try {
    let swish = true;
    let res = await create(['swish', 'card']);
    if (!res.ok) {
      const first = await res.text();
      // Swish is invite-only on Stripe; a session without it is still a valid purchase.
      if (/swish/i.test(first)) {
        swish = false;
        res = await create(['card']);
        if (!res.ok) {
          return NextResponse.json({error: 'stripe_error', message: first.slice(0, 300)}, {status: 502});
        }
      } else {
        return NextResponse.json({error: 'stripe_error', message: first.slice(0, 300)}, {status: 502});
      }
    }
    const session = await res.json();
    if (!session.client_secret) {
      return NextResponse.json({error: 'stripe_error', message: 'no client_secret returned'}, {status: 502});
    }
    return NextResponse.json({clientSecret: session.client_secret, pack, swish});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'checkout failed';
    return NextResponse.json({error: 'checkout_failed', message}, {status: 502});
  }
}
