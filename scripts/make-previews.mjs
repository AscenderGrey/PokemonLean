// Funnel previews: small webp versions of the seven provided templates, for the live card column.
// The full-size PNGs stay in public/templates for the image path.
import sharp from "sharp";
import {mkdir} from "node:fs/promises";

const KEYS = ["mamma", "pappa", "partner", "syskon", "basta_van", "van", "kollega"];
await mkdir("public/templates/preview", {recursive: true});
for (const k of KEYS) {
  const out = `public/templates/preview/${k}.webp`;
  const info = await sharp(`public/templates/${k}.png`)
    .resize({width: 560})
    .webp({quality: 82})
    .toFile(out);
  console.log(k.padEnd(10), `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)}KB`);
}
