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

## Rules that keep it lean
- One page, ≤ 500 lines of app code. Over budget means cut a feature, not add a file.
- No CSS framework, no animation library. Transforms, opacity, keyframes, `requestAnimationFrame`.
- The quiz advances instantly; generation runs while the customer looks at the pack.
- Inspired-by card-game styling only — no Pokémon names, logos or characters.
