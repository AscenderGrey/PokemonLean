/**
 * Builds the stored sample card that /demo and /gift show: the real Bästa vän template with the
 * master prompt's Ludvig text drawn in code (the image model garbles Swedish text, so the text is
 * composited rather than generated), then derives the 46% teaser.
 *
 *   cd <repo> && node scripts/make-sample.mjs
 *
 * Output: public/sample/basta_van.png (1200×1608) and public/sample/basta_van-teaser.png (1200×740).
 */
import sharp from "sharp";
import {writeFile} from "node:fs/promises";

const W = 1744, H = 2336;            // the template's canvas; text is laid out at this size
const OUT_W = 1200;                  // shipped width (≈0.9 MB instead of 9.6 MB)
const INK = "#3f2a06", INK2 = "#5a3d0a";
const TEASER = 0.46;                 // the exposed share

const wrap = (s, n) => {
  const out = []; let line = "";
  for (const w of s.split(" ")) {
    if ((line + " " + w).trim().length > n) { out.push(line.trim()); line = w; } else line += " " + w;
  }
  if (line.trim()) out.push(line.trim());
  return out;
};
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = (x, y, s, size, {anchor = "start", weight = 700, italic = false, fill = INK} = {}) =>
  `<text x="${x}" y="${y}" font-family="DejaVu Sans, Verdana, sans-serif" font-size="${size}" font-weight="${weight}" ${italic ? 'font-style="italic"' : ""} fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;

const spBold = wrap("Special power: Bästa vän, småpratare, shoppingsällskap.", 40);
const spBody = wrap("Ludvig kan starta ett samtal i vilken kö som helst och går därifrån med tre nya kompisar. Full power is unleashed när kassören säger hej.", 58);
const desc = wrap("Står redan utanför när du vaknar. Motståndaren känner sig sen hela dagen.", 50);
const strength = wrap("Kan småprata sig ur en parkeringsbot", 22);

let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
svg += text(1555, 152, "“Har du ätit nåt?”", 52, {anchor: "end", italic: true});               // top line
svg += text(540, 320, "Ludvig", 122, {weight: 800});                                          // name
svg += text(1505, 316, "LV. 87", 110, {anchor: "end", weight: 800});                          // level
svg += text(872, 1385, "Bästa vän. Känner halva stan.", 62, {anchor: "middle", italic: true});// caption
let y = 1462;                                                                                 // special power
spBold.forEach(l => { svg += text(150, y, l, 46, {weight: 800}); y += 54; });
spBody.slice(0, 3).forEach(l => { svg += text(150, y, l, 38, {weight: 500, fill: INK2}); y += 46; });
svg += text(950, 1782, "Ska bara titta", 66, {anchor: "middle", weight: 800});                // attack 1
svg += text(1610, 1788, "50", 116, {anchor: "end", weight: 800});
svg += text(950, 1892, "Tio minuter före", 66, {anchor: "middle", weight: 800});              // attack 2
svg += text(1610, 1898, "100", 116, {anchor: "end", weight: 800});
desc.slice(0, 2).forEach((l, i) => { svg += text(1010, 1950 + i * 40, l, 34, {anchor: "middle", weight: 600, italic: true}); });
svg += text(300, 2215, "Rea-skyltar", 46, {anchor: "middle", weight: 800});                    // bottom row
svg += text(855, 2212, "Goda råd", 44, {anchor: "middle", weight: 800});
svg += text(1427, 2185, strength[0], 30, {anchor: "middle", weight: 700});
if (strength[1]) svg += text(1427, 2219, strength[1], 30, {anchor: "middle", weight: 700});
svg += `</svg>`;

// composite at the template's own size, then a separate resize pass (sharp runs resize before
// composite in one pipeline, which would reject the full-size overlay)
const full = await sharp("public/templates/basta_van.png")
  .composite([{input: Buffer.from(svg), top: 0, left: 0}]).png().toBuffer();
const card = await sharp(full)
  .resize({width: OUT_W})
  .png({compressionLevel: 9, palette: true, quality: 90})
  .toBuffer();
const outH = Math.round((H * OUT_W) / W);
const teaser = await sharp(card).extract({left: 0, top: 0, width: OUT_W, height: Math.round(outH * TEASER)})
  .png({compressionLevel: 9, palette: true, quality: 88}).toBuffer();

await writeFile("public/sample/basta_van.png", card);
await writeFile("public/sample/basta_van-teaser.png", teaser);
console.log(`card ${OUT_W}×${outH} ${(card.length / 1048576).toFixed(2)}MB; teaser ${(teaser.length / 1048576).toFixed(2)}MB`);
