# PROMPT — build the lean SoMeCard funnel and the golden reveal

This repo is deliberately tiny: it holds only what the build needs to know. Everything that mattered
was too big, split over too many agents, and drowning in context. Build the whole thing here in two
runs: **plan with the smart model, execute with a cheap one.**

## What is in this repo (all the context there is)
- `reference/SoMeCard_Quizprototyp.html` — the flow and the card, exactly as designed. **This is the
  source of truth** for the quiz steps, the card layout, the booster pack and the paywall.
- `reference/somecard-masterprompt.md` — the two prompts and the template table (colour, symbol, ink
  per relation). The generation side is already implemented from it.
- `reference/landing-live.html`, `reference/production-landing.tsx` — the existing landing page, for
  brand colour, copy and tone.
- `public/templates/<relation>.png` — the seven finished cards to fill in (1744×2336, transparent);
  `ref/` holds the scaled copies the image model is given.
- `app/api/generate/route.ts` + `lib/image-gen.ts` — **the working image path.** Answers (+ photo) go
  in, the card's text and two PNGs come out. Do not rewrite it; call it.

## Step 1 — plan (smart model, xhigh reasoning, empty context)
Ask for a single markdown spec: file list with line budgets, the data tables, the API calls used,
**a reveal timing table** (ms / layer / from → to / easing) and numbered acceptance checks.
The reveal is the deliverable. Exactly these beats, in this order:
1. the sealed booster pack lands, foil shimmer, a small impatient shake
2. the tear strip opens, a jagged edge, warm light leaking out
3. **a golden card rises up out of the pack**, catching the light as it clears the sleeve
4. it settles flat, one shine pass sweeps the gold and the foil, sparks fade
5. the lower third locks (curtain/blur) and the paywall arrives in the same viewport
Also require: the reduced-motion fallback, behaviour on a slow phone, and that the whole sequence is
interruptible (tap or scroll skips ahead).

## Step 2 — execute (cheap model, spec-only context)
Rules for the executor:
- Read only the spec. Do not explore the repo. Import nothing from a legacy funnel — none is here.
- Target **≤ 500 lines** of app code plus one static data file (~90 lines). Over budget → delete a
  feature, do not add a file.
- No new dependencies, no CSS framework, no animation library: transforms, opacity, keyframes and
  `requestAnimationFrame` only. 60fps on a mid-range phone.
- One page for the quiz + reveal + paywall. The quiz advances instantly; the card is generated while
  the customer looks at the pack (`POST /api/generate`).
- Swedish copy, short lines, same tone as the landing.
- Inspired-by styling only: **no Pokémon names, logos, characters or tradedress.**
- Finish with `npx tsc --noEmit`, `npm run build`, and the acceptance checks. Report only what those
  three say.

## Acceptance checks (mechanical, no opinions)
1. `npm run build` exits 0 and `/create` is in the route list.
2. The page contains all eight quiz steps and the paywall string `Swish`.
3. `POST /api/generate` with a photo returns `{text, card, teaser}` and the card is 1744×2336.
4. The reveal timing table's total is under 6 s, and with `prefers-reduced-motion` it is under 1 s.
5. Total app lines ≤ 500 (count them).
