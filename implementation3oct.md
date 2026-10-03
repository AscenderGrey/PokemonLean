# SoMeCard: an elegant booster reveal and gift experience

Implementation plan — 3 October 2026.

## 1. Assessment and direction

**Build the experience around two reveals: curiosity before purchase, delight for the recipient.** Reuse the saved funnel and card designs. Concentrate the implementation effort on the physical unboxing and the handoff after payment.

The repository was inspected, the live site and local prototype were opened using Playwright with desktop Chrome, and Luna reviewed the screenshots.

Findings:

- [The HTML prototype](reference/SoMeCard_Quizprototyp.html) contains the quiz, sealed pack, teaser, checkout, buyer screen, and recipient screen. Payment and sharing are placeholders.
- The Next app currently exposes the landing page and generation endpoint. The funnel still needs to be ported.
- All seven templates are 1744 × 2336 PNGs. Their gold frames and relation colours should remain the visual centre.
- The current opening is a blue panel sliding down. It lacks a distinct tear, light escaping from the seam, and a card emerging from the wrapper.
- The recipient screen starts with the complete card visible. It spends the surprise before the recipient interacts.
- Checkout buries payment beneath chat examples, benefit tiles, and package explanations.
- [The generation code](lib/image-gen.ts) implements the two-prompt approach, but the endpoint returns the full card before payment. The master prompt's server-only storage and image-text verification are not implemented.

**Chosen direction:** midnight navy stage, deep cobalt foil, restrained gold details, warm light, and the existing richly coloured card. Keep Swedish copy short and friendly. Preserve SoMeCard's original identity and the repository's restrictions on existing card-game branding.

**Default scope:** a complete, polished visual demo first, using simulated payment and a sample recipient link. Real commerce and durable sharing are a separate launch step.

**Single-card price: 99 kr**, confirmed by the user. Use this price consistently across the quiz, checkout, demo, and confirmation. It supersedes the saved HTML prototype's price.

## 2. Product flow and visual specification

### Quiz → sealed pack

Port the prototype's questions, options, back navigation, optional photo, and optional quote. Preserve the three quick comparison questions within the existing flow; do not redesign the quiz or add questions.

Correct the relationship mapping during the port:

| Prototype key | Template key |
|---|---|
| `van` — Bästa vän | `basta_van` |
| `kompis` — Vän | `van` |
| Other relations | Same key |

Answers should advance promptly. Remove the prototype's fixed, elaborate generation performance. Show genuine preparation status when generation is running; never imply completion before the image is ready.

Once ready:

- Replace the quiz panel with a focused unboxing stage.
- Centre the sealed pack with the recipient's name.
- Display **“Jag har gjort en grej till dig.”**
- Use one clear instruction: **“Tryck för att öppna.”**
- Make the whole pack a keyboard-accessible button.

### First opening → teaser checkout

The pack tears, warm light escapes, and the card rises. **Only its upper 46% becomes visible**, matching the existing teaser crop.

Keep the torn lower wrapper around the concealed portion. It should feel like a card still inside its sleeve, rather than a blurred screenshot.

Checkout appears around the same stage without a page flash or restarting the animation.

Primary content:

- **“Det där är ju [namn].”**
- **“Lås upp hela kortet och skicka ett pack att öppna.”**
- **99 kr**
- One gold purchase button.

In the visual demo, label the button **“Testa köp · 99 kr”** and visibly identify simulated payment. Do not imply an actual Swish or Apple Pay transaction.

Move supporting explanations beneath the purchase action. Defer the family bundle, print kit, regeneration promises, and account workshop from this first implementation.

### After purchase → send the gift

Show a compact confirmation:

- **“Klart. Nu är det [namn]s tur.”**
- A small sealed-pack preview.
- Primary action: **“Skicka packet.”**
- Secondary action: **“Förhandsvisa mottagarens upplevelse.”**

Do not automatically run another full reveal for the buyer. Let the recipient own that moment.

Use native sharing when available, with a copy-link fallback. In the demo, share a clearly identified sample gift URL that works independently of browser storage.

### Recipient → full reveal

The recipient arrives at a fresh sealed pack. Show neither the full card nor a spoiler thumbnail.

Copy:

- **“[namn], det finns ett kort som bara kan vara du.”**
- **“Öppna ditt pack.”**

After the tap, reuse the same unboxing sequence, but release the entire card.

Once it settles:

- **“Det finns bara en som du.”**
- Actions: **“Spara kortet”** and **“Öppna igen.”**
- A quieter **“Gör ett kort till någon du känner”** link underneath.

Recipient links must reopen the pack locally without changing another viewer's experience.

### Layout rules

- Use the existing navy, cream, cobalt, and amber brand tokens.
- Instrument Sans for interface text; reserve the existing playful display face for a few short headlines.
- Preserve the card's **1744:2336** aspect ratio.
- At 390 × 844, fit the sealed pack, instruction, and opening control in the first viewport.
- Card width: approximately 280px on a typical phone, capped at 340px on desktop; reduce according to available viewport height on shorter screens.
- Keep 16–20px mobile gutters and controls at least 44px high.
- Desktop checkout: teaser left, concise purchase panel right. Mobile: teaser above purchase controls.
- Avoid overlays across the person's face, excessive decorative badges, and continuous sparkle effects.

## 3. Unboxing implementation and timing

Use one reusable `Unboxing` component with two modes: `teaser` and `full`.

Build the wrapper from CSS gradients and small inline SVG shapes. Animate with native CSS and the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API). No animation library, WebGL, physics engine, or generated video.

Layer order, back to front:

1. Static navy backdrop and soft amber halo.
2. Card image.
3. Foil back and torn front sleeve.
4. Separate tear strip and two small foil lips.
5. Seam light, highlight sweep, and at most eight sparks.

The wrapper needs recognisable material details: crimped seals, narrow side folds, directional foil reflection, and an irregular torn edge. Avoid the prototype's dominant vertical stripes and uniform scalloped edge.

### Timing table

Times begin when the pack is activated. Pack arrival runs separately for 450ms.

| Time | Layer | Motion or change | Easing |
|---|---|---|---|
| 0–120ms | Wrapper | Compress to 0.98 scale; tilt −1° | Ease-out |
| 120–350ms | Seam | A narrow amber opening appears left to right | Ease-in-out |
| 220–750ms | Tear strip | Pull right and upward; rotate 12°; fade only after separating | `cubic-bezier(.22,.8,.25,1)` |
| 350–950ms | Foil lips | Peel outward, exposing a persistent jagged opening | Same |
| 350–1300ms | Seam light | Expand into warm spill; peak, then soften | Ease-out |
| 650–1800ms | Card | Rise from inside the sleeve toward its final position; tilt −4° → 1° | `cubic-bezier(.16,1,.3,1)` |
| 650–1800ms | Front sleeve | Move down to expose 46% in teaser mode; move completely below the card in full mode | Same |
| 1800–2200ms | Card | Settle to 0° with a small vertical overshoot | Ease-out |
| 2000–2800ms | Highlight | One diagonal foil sweep across the exposed surface | Ease-in-out |
| 2200–3000ms | Sparks / halo | Sparks fade; halo becomes subtle and static | Ease-out |
| 2600–3100ms | Interface | Checkout or recipient actions fade in | Ease-out |

**Critical distinction:** the card must move relative to the torn wrapper. Animating only the covering panel repeats the existing problem.

For teaser mode, never animate an unpaid full image underneath an opaque cover. Render only the cropped teaser into the card's upper region; the lower region contains no hidden artwork or text.

Operational rules:

- Wait for image decoding before enabling the opening.
- Ignore repeated activation while opening.
- Tap again, press Escape, or scroll intentionally to skip to the correct final state.
- Reduced motion: reach the equivalent teaser/full state in at most 400ms, without rotation, shake, or particles.
- Animate transforms and opacity. Keep glow artwork static beneath an opacity animation; avoid large animated blur filters.
- Cancel animations and listeners on unmount.
- Release temporary `will-change` hints after settling.
- On slower devices, omit sparks and idle shimmer while retaining tear, light, and card emergence.
- Keep sound out of v1. The sequence must communicate clearly in silent ads.

## 4. Executor handoff and build order

Delegate implementation to **one executor**, with this specification and the bounded source files. The primary agent reviews both code and Chrome captures before accepting completion.

### Small implementation footprint

| Responsibility | Target line budget |
|---|---:|
| Existing landing, layout, and generation route | 68 existing lines |
| `/create`: quiz, preparation, checkout, buyer confirmation | 155 |
| Shared `Unboxing` component and animation control | 70 |
| `/gift/[token]`: recipient entry and settled actions | 25 |
| `/demo`: deterministic showcase entry | 5 |
| Global styles, including existing styles | 160 |
| Static quiz and demo data | Approximately 90, separately counted |

Target **under 500 app source lines**, plus static data and the unchanged image-generation library. Keep code readable; cut optional features instead of compressing code to satisfy the count.

### Execution sequence

1. **Prepare a reproducible sample.** Create one finished Bästa vän card using the existing template and [the master prompt's Ludvig example](reference/somecard-masterprompt.md). Use the built-in image-generation tool for the sample asset; inspect the template first, preserve its layout, and save the approved result into the repository. Derive the 46% teaser with `sharp`. No runtime generation is required for visual QA.
2. **Build the recipient reveal first.** Implement sealed → tearing → rising → settled using the sample card. Complete desktop, mobile, and reduced-motion review before connecting the quiz.
3. **Add teaser mode and concise checkout.** Reuse the component and timing. Verify that concealed content cannot flash during the animation or skip action.
4. **Port the existing quiz.** Extract its static choices and relationship mapping. Retain the existing generation functions behind a small adapter. The demo adapter returns the clearly labelled sample; it must not silently claim the sample reflects arbitrary answers.
5. **Complete the simulated purchase and gift handoff.** Add confirmation, share/copy fallback, recipient preview, replay, and PNG download.
6. **Provide ad capture mode.** `/demo?capture=1` removes surrounding navigation and exposes a replay control outside the recorded stage. Use the same component and animation, not a separate ad implementation. Capture a 1080 × 1920 portrait version with generous top and bottom space for editing.

The [frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) is a useful execution reference for intentional typography and material treatment. Playwright is already available for [screenshots](https://playwright.dev/python/docs/screenshots) and browser recording. No skill installation or new runtime dependency is needed.

### Separate launch integration

The visual demo does not establish payment security or durable delivery. Before a real launch:

- Store generated cards privately on the server.
- Return only `{cardId, teaser, status}` before payment.
- Verify payment server-side; a redirect or client `paid` flag cannot unlock a card.
- Issue a durable recipient token after verified payment.
- Serve the full card only through the paid entitlement or recipient token.
- Retain the current rendering pipeline; change its delivery boundary rather than rebuilding generation.
- Preserve optional quote and own/preset input metadata currently missing from the runtime prompt interface.
- Set the real single-card checkout price to **99 kr**, matching the visual flow.

Choosing and integrating the actual payment and storage providers belongs to that launch step.

## 5. Acceptance checks

1. `npm run typecheck` and `npm run build` pass; `/create`, `/demo`, and the recipient route exist.
2. The prototype's quiz choices, three comparison questions, back navigation, and optional inputs work.
3. All seven relations select the correct template.
4. Opening visibly contains **tear → warm light → card emergence → settle → single shine**.
5. Teaser mode exposes exactly the upper 46%; concealed content never appears during playback, skipping, or checkout.
6. The recipient initially sees a sealed pack and reveals the full card only after activation.
7. Double taps do not restart the sequence. Replay works after settling.
8. Reduced-motion playback finishes within 400ms. Slow preparation and image failure show honest, recoverable states.
9. Share cancellation leaves the page usable; copy-link fallback and PNG download work.
10. Chrome captures at **390 × 844**, **320 × 568**, and **1440 × 900** show no horizontal overflow or obstructed controls.
11. Capture sealed, mid-tear, rising, teaser checkout, buyer confirmation, and full recipient states. Luna reviews those images; the primary agent resolves any visual defects.
12. Record a complete opening under CPU throttling. Target smooth playback; report measured results rather than asserting 60fps without evidence.
13. The portrait ad capture uses the product's actual animation and clearly communicates the reveal without sound.
14. Report the line count and confirm that no animation library or additional runtime dependency was added.
15. Every single-card price in the implemented experience is **99 kr**; the demo purchase remains explicitly simulated.

**Completion means a coherent, visually reviewed demo of the whole emotional journey.** Real-payment readiness is reported separately and requires the launch integration above.
