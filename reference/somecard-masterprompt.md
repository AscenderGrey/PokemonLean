# SoMeCard master prompt and templates

Version 2026-10-02, after the first test runs. Two prompts run in sequence. Prompt 1 turns the quiz answers into the card's text. Prompt 2 renders the final card from that text, the blank template for the chosen relation, and the customer's photo.

## Decisions

- The picture on the card is the customer's own photo, placed whole in the picture window with its real background. No cutout.
- Each relation has its own stored template with its colour and its symbol already in the orbs. The image model never recolours or draws the symbol at runtime.
- The orb at the top right is small, about the size of the attack-row orbs.
- Image model settings used in the tests: GPT Image 2.5, Sunburst, quality high, 2k, aspect 3:4, transparent background. Output 1744 × 2336 px.
- The card is SoMeCard's own design. No names, logos or symbols from existing card games.

## Templates

Download each PNG once and store it with the app. Pass the right one as reference image 1.

| Relation | Colour | Symbol | Text colour | Template |
|---|---|---|---|---|
| Mamma | Lilac | Heart | dark purple | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095200_93cd290b-9385-4de3-8c79-d8be4c37aec7.png |
| Pappa | Sky blue | Crown | dark navy | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095200_74f347cb-b858-4745-b06d-892ceb578d09.png |
| Partner | Rose pink | Two interlocked rings | dark burgundy | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095200_48f2c80b-aae4-4022-bba4-ead953b2c1ce.png |
| Syskon | Leaf green | Two boxing gloves | dark green | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095200_7af80da5-e431-49d9-951f-07a2b8aeda2f.png |
| Bästa vän | Peach-orange | Star | dark brown | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095200_71430307-8d90-4d21-a61a-3bd2002ebb71.png |
| Vän | Turquoise | Thumbs-up | dark teal | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095200_58156b5a-bc1e-4f20-b780-48b7153acdb3.png |
| Kollega | Silver-grey | Coffee cup | dark charcoal | https://d8j0ntlcm91z4.cloudfront.net/user_32zzUEZmQHBk8eTS9liksdyXMFd/hf_20261002_095201_e86d4af4-b698-4c9a-a09e-6fb1104c2f42.png |

Higgsfield job ids, same order: 93cd290b-9385-4de3-8c79-d8be4c37aec7, 74f347cb-b858-4745-b06d-892ceb578d09, 48f2c80b-aae4-4022-bba4-ead953b2c1ce, 7af80da5-e431-49d9-951f-07a2b8aeda2f, 71430307-8d90-4d21-a61a-3bd2002ebb71, 58156b5a-bc1e-4f20-b780-48b7153acdb3, e86d4af4-b698-4c9a-a09e-6fb1104c2f42.

## Quiz fields going in

| Field | Source | Notes |
|---|---|---|
| name | text | max 18 chars |
| relation | choice | mamma, pappa, partner, syskon, bästa vän, vän, kollega |
| photo | upload | may be missing |
| fires_up | choice or own text | becomes Attack 1 |
| habit | choice or own text | becomes Attack 2 |
| kryptonite | choice or own text | becomes weakness |
| immune_to | choice or own text | becomes resistance |
| signature_power | choice or own text | becomes special power + strength |
| quote | optional own text | top line |

Mark each field as "preset" or "own" when you pass it in. The full option lists are in the project doc quiz-options.

## Prompt 1: card text (any text model, JSON out)

```
You write the text for a personalised trading card that someone is giving to a person they love. The card is an affectionate roast: it should make the recipient laugh and say "that is so me". You get the buyer's quiz answers and return the card's text as JSON.

INPUT
name: {{name}}
relation to buyer: {{relation}}
fires_up ({{fires_up_source}}): {{fires_up}}
habit ({{habit_source}}): {{habit}}
kryptonite ({{kryptonite_source}}): {{kryptonite}}
immune_to ({{immune_to_source}}): {{immune_to}}
signature_power ({{signature_power_source}}): {{signature_power}}
quote (optional, own): {{quote}}

LANGUAGE AND TONE
- Write in Swedish with correct å, ä, ö. A few short English gaming phrases are welcome ("Full power is unleashed when..."), the way a Swedish friend would mix them in.
- Warm, playful, specific. Tease habits and quirks, never the person's worth.
- Use only what the buyer told you. Do not invent jobs, places, other people, or events.

THE BUYER'S OWN WORDS
- Any field marked "own" was typed by the buyer. Keep its meaning and its key words. You may fix spelling, trim it to fit, and shape it into a punchy name. Never replace it with your own idea.
- Fields marked "preset" are yours to make funnier and more specific to this person.

NEVER
- No comments on looks, body, weight, age, health, disability, religion, ethnicity, sexuality, politics or money.
- No profanity, nothing sexual, nothing that would embarrass the recipient in front of family.
- If any input is hateful, sexual, or clearly meant to hurt the recipient, do not write the card. Return {"needs_review": true, "reason": "<short reason>"} and nothing else.

OUTPUT
Return only this JSON. Respect every character limit, counting spaces. If a line is too long, rewrite it shorter. Never cut a word in half.

{
  "needs_review": false,
  "name": "<the name exactly as given>",
  "level": <integer 40-99: higher the more intense the answers feel>,
  "top_line": "<max 45. If a quote was given: the quote in quotation marks. Otherwise a one-line tagline for this person>",
  "caption": "<max 40. Format: 'Relation. Short title.' Example: 'Mamma. Familjens VD.'>",
  "special_power_title": "<max 45. Three roles separated by commas. Example: 'Mamma, chaufför, krishanterare'>",
  "special_power_text": "<max 170. Two or three sentences built on signature_power. End with one line about what happens when the power is unleashed>",
  "attack_1": {"name": "<max 22, from fires_up>", "damage": 50},
  "attack_2": {"name": "<max 22, from habit>", "damage": 100, "description": "<max 90. One sentence on what the attack does to the opponent>"},
  "weakness": "<max 18, from kryptonite>",
  "resistance": "<max 14, from immune_to>",
  "strength": "<max 45. One line that follows from signature_power>",
  "rarity": "<one of: Rare, Epic, Legendary, Ultra Rare>"
}
```

Check in code after the call: valid JSON, every limit respected, name unchanged. Retry once on failure.

## Prompt 2: final card image (GPT Image 2.5, two reference images)

Reference image 1: the stored template for the chosen relation. Reference image 2: the customer's photo. Fill `{{symbol}}` and `{{text_colour}}` from the template table.

```
Create one finished trading card by filling in the blank card template (the first reference image) with the photo (the second reference image) and the text below.

LAYOUT
- Keep the template's layout, frame, colours, borders, textures and positions exactly as they are. Do not redesign, move or resize anything.
- Keep every orb exactly as in the template, same size and same position, including the white {{symbol}} symbol inside each orb: the small orb at the top right of the header, the single orb in the first attack row and the four orbs in the second attack row. Do not enlarge, change, remove or replace them.
- Show the card flat and straight from the front, same framing and transparent background as the template. No hand, no table, no shadow outside the card.

THE PICTURE WINDOW
- Do not cut the person out. Place the whole photo inside the picture window so it fills the window edge to edge, keeping the real background of the photo. Crop it so the main person is the clear subject with their face fully visible and well centred; other people at the edges may be cropped out.
- Keep the person's face, hair, expression and clothes exactly as in the photo. Do not redraw, beautify, age, slim or restyle them, and do not change the scenery. It must stay a real photograph.
- Over the photo, add only a light holographic foil effect: a few small four-point stars and a faint shimmer near the corners and edges, never covering the face.
- In the small portrait square inside the gold seal, place a tiny crop of the same person's face from the photo.

TEXT
Render every text below exactly as written, character for character, including the Swedish letters å, ä, ö and all punctuation. Do not translate, correct, shorten or add any text. Use a bold, rounded, friendly sans-serif typeface in {{text_colour}} that matches the three labels already on the template, crisp and perfectly legible.

- Top line, small italic, right-aligned in the thin space at the very top: {{top_line}}
- Name, large and bold, in the header row to the right of the gold seal: {{name}}
- Level, bold, to the right of the name and left of the small orb: LV. {{level}}
- Caption on the gold banner strip under the picture window, small bold italic, centred: {{caption}}
- Special power paragraph in the open area under the banner, small text, left-aligned. Start in bold with: Special power: {{special_power_title}}. Then continue in regular weight: {{special_power_text}}
- First attack row (the row with one orb): the name in bold in the centre: {{attack_1_name}}   and the number large and bold at the far right: 50
- Second attack row (the row with four orbs): the name in bold in the centre: {{attack_2_name}}   and the number large and bold at the far right: 100   Under the name, in small italic: {{attack_2_description}}
- Bottom row: under the existing label weakness write: {{weakness}}   Under the existing label resistance write, on a small white rounded pill: {{resistance}}   Under the existing label strength write: {{strength}}

DO NOT
- No text other than what is listed above plus the three existing labels. No watermark, signature or sample text.
- No logos, symbols, characters or wording from any existing trading card game.
- Do not change the name or any number.
```

Variants:
- **Several people in the photo:** name the main one in THE PICTURE WINDOW ("the person on the right in the blue jacket"), or let the customer crop at upload.
- **No photo:** replace THE PICTURE WINDOW with: "No photo was provided. Leave the picture window and the small portrait square in the gold seal exactly as they are in the template: holographic background only, no person."

## Test run (2026-10-02)

Answers: Ludvig, Bästa vän, Shopping, Alltid tidig, Rea-skyltar, Goda råd, Pratar med alla, quote "Har du ätit nåt?".

Card text used:

| Field | Text |
|---|---|
| Top line | "Har du ätit nåt?" |
| Name, level | Ludvig, LV. 87 |
| Caption | Bästa vän. Känner halva stan. |
| Special power | Bästa vän, småpratare, shoppingsällskap. Ludvig kan starta ett samtal i vilken kö som helst och går därifrån med tre nya kompisar. Full power is unleashed när kassören säger hej. |
| Attack 1 (50) | Ska bara titta |
| Attack 2 (100) | Tio minuter före. Står redan utanför när du vaknar. Motståndaren känner sig sen hela dagen. |
| Weakness | Rea-skyltar |
| Resistance | Goda råd |
| Strength | Kan småprata sig ur en parkeringsbot |

Renders made: text only, cut-out person on holo, whole photo, whole photo with symbol template, whole photo with small-symbol template. The whole-photo version was preferred.

## Pipeline around the prompts

1. Quiz answers → Prompt 1 → validated JSON.
2. JSON + template + photo → Prompt 2 → full card, stored on the server only.
3. A vision check reads the text off the finished card and compares it with the JSON. On a mismatch, regenerate once, then fall back to drawing the text in code over a text-free render.
4. The browser gets only the cropped top of the card with a watermark until payment.

## Not verified yet

- Text accuracy across many cards, especially å, ä, ö in the small text.
- Long inputs: an 18-character name, a 22-character attack name, a full-length special power.
- The other six colours with a photo. Only Bästa vän has been run end to end.
- That the seven templates have exactly the same layout after recolouring and the two symbol edits.
- Real cost per card (read the token usage from 20 test cards).
- How long customer photos are kept. Buyers upload photos of other people, so say it on the upload step.
