# leanpokemon

A deliberately small repo: the SoMeCard flow, the seven card templates, the working image path, and
the reference material — nothing else. The point is that a single model can hold the whole thing in
context and build the funnel in one pass.

```
reference/SoMeCard_Quizprototyp.html   the flow and the card, as designed (source of truth)
reference/somecard-masterprompt.md     the two generation prompts + the template table
reference/landing-live.html            the existing landing page, live, with brand styling
reference/production-landing.tsx       the same landing as a component
public/templates/<relation>.png        the seven finished cards to fill in (1744x2336, transparent)
public/templates/ref/<relation>.png    scaled copies, given to the image model as reference 1
lib/image-gen.ts                       the image path: prompt 1 (text) + prompt 2 (fill the template)
app/api/generate/route.ts              POST answers (+ photo) -> text, card PNG, watermarked teaser
app/page.tsx                           the landing page
PROMPT.md                              the two-run build prompt: plan with the smart model, execute cheap
```

## Run it

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY
npm run dev                  # http://localhost:3000
```

Generate one card without any UI:

```bash
curl -s localhost:3000/api/generate -H 'content-type: application/json' \
  -d '{"answers":{"name":"Ludvig","relationship":"Bästa vän","interests":["Shopping"],"traits":["Alltid tidig","Pratar med alla"],"strongestStat":"Goda råd","privateFact":"Rea-skyltar"}}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);require('fs').writeFileSync('/tmp/card.png',Buffer.from(j.card,'base64'));console.log(j.text)})"
```

## Routes
- `/create` — the buyer journey: quiz → generation → sealed pack → teaser checkout (99 kr, simulated) → buyer confirmation
- `/gift/[token]` — the recipient: a sealed pack, the full reveal, save / replay (demo token: `/gift/sample`)
- `/demo` — the deterministic sample showcase; `/demo?capture=1` is the chrome-free 1080×1920 ad capture
- `/api/generate` — `POST {answers, photoBase64?}` → `{text, card, teaser}` (base64 PNGs)

## Deploy

Vercel project `leanpokemon` (team `erpa-utopilot`), linked to this repo, branch `main` —
production: https://leanpokemon.vercel.app.

Required environment variables (production + preview):

| Name | Why |
|---|---|
| `OPENAI_API_KEY` | `lib/image-gen.ts` calls the OpenAI text and image models |
| `STRIPE_SECRET_KEY` | server-only; creates the embedded Checkout Session in `app/api/checkout` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser-safe; Stripe.js mounts the embedded checkout |

Swish is requested first in the session; if the account has not activated it, the session is retried
card-only. Without the Stripe keys the checkout reports *not configured* and never fakes a payment.

Two constraints to keep in mind:

- The plan is Hobby, so the generation route's `maxDuration` must stay ≤ 60 s.
- `lib/image-gen.ts` reads `public/templates/ref/<relation>.png` from disk at runtime with a
  dynamic path, so the bundler cannot trace it. `next.config.ts` ships those files with the
  function via `outputFileTracingIncludes`; without that the route fails with `ENOENT` on Vercel.
  `.vercelignore` drops the unused full-size templates from the upload.

## Reproducing the sample card

`/demo` and `/gift` show a stored sample rather than generating one per visit. Regenerate it with:

```bash
node scripts/make-sample.mjs   # public/sample/basta_van.png + -teaser.png
```

The text is composited in code, not generated: the image model reliably garbles Swedish text.

## Rules that keep it lean
- One page, ≤ 500 lines of app code. Over budget means cut a feature, not add a file.
- No CSS framework, no animation library. Transforms, opacity, keyframes, `requestAnimationFrame`.
- The quiz advances instantly; generation runs while the customer looks at the pack.
- Inspired-by card-game styling only — no Pokémon names, logos or characters.
