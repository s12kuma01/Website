// One-off icon generator: turns the hand-drawn mascot into the site's icons.
//
// Source: src/assets/mascot-source.png (transparent line-art, ~487²).
// Outputs (public/):
//   favicon-16.png, favicon-32.png  — white tile so the black line-art stays
//                                      legible on dark browser tab strips.
//   apple-touch-icon.png (180²)     — opaque white (iOS masks/rounds it itself).
//   mascot.png (128², transparent)  — for the header brand badge; the badge's
//                                      light background is supplied by CSS.
//
// Not wired into the build — icons are static. Re-run manually after changing
// the source:  pnpm exec node scripts/gen-icons.mjs
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'src/assets/mascot-source.png');
const PUB = path.join(root, 'public');

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// Trim the transparent margin down to the character's bounding box so every
// icon frames the mascot consistently regardless of the source's whitespace.
let trimmed;
try {
  trimmed = await sharp(SRC).trim({ background: CLEAR }).toBuffer();
} catch {
  trimmed = await sharp(SRC).toBuffer();
}

async function build(size, padRatio, bg, outName) {
  const inner = Math.max(1, Math.round(size * (1 - padRatio * 2)));
  const mascot = await sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: CLEAR })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: mascot, gravity: 'center' }])
    .png()
    .toFile(path.join(PUB, outName));
  console.log('wrote', outName, `${size}x${size}`);
}

await build(16, 0.08, WHITE, 'favicon-16.png');
await build(32, 0.1, WHITE, 'favicon-32.png');
await build(180, 0.16, WHITE, 'apple-touch-icon.png');
await build(128, 0.06, CLEAR, 'mascot.png');
console.log('done');
