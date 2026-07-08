// One-shot OG image generation (1200×630 PNG per locale) — run manually with
// `pnpm exec node scripts/gen-og.mjs`; outputs are committed static assets, NOT
// part of the build chain. Colors are a fixed M3 baseline violet scheme (OG
// images cannot follow the per-visit dynamic color).
//
// Layout: text on the left, the hand-drawn mascot on the right sitting on a
// light cookie disk (the black line-art needs a light backing on the dark bg).

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

let trimmed;
try {
  trimmed = await sharp(join(root, 'src/assets/mascot-source.png'))
    .trim({ background: CLEAR })
    .toBuffer();
} catch {
  trimmed = await sharp(join(root, 'src/assets/mascot-source.png')).toBuffer();
}
const MASCOT = await sharp(trimmed)
  .resize(300, 300, { fit: 'contain', background: CLEAR })
  .png()
  .toBuffer();
const MASCOT_LEFT = 765;
const MASCOT_TOP = 150;

// cookie7 blob (100-unit box) — same shape as the header badge / favicon.
const BLOB =
  'M 100 50 C 100 52.1, 99.4 54.4, 98.6 56.4 C 97.8 58.4, 96.4 60.3, 95.3 62.1 C 94.1 63.9, 92.7 65.5, 91.8 67.3 C 90.8 69.1, 90 70.8, 89.3 72.7 C 88.5 74.6, 88.2 76.7, 87.4 78.7 C 86.7 80.7, 86 83, 84.8 84.8 C 83.7 86.7, 82.2 88.4, 80.4 89.7 C 78.7 90.9, 76.5 91.7, 74.4 92.2 C 72.3 92.8, 69.9 92.8, 67.8 93 C 65.7 93.2, 63.6 93.2, 61.7 93.5 C 59.7 93.9, 57.9 94.5, 55.9 95.1 C 54 95.8, 52.1 96.8, 50 97.5 C 47.9 98.2, 45.7 98.9, 43.5 99.1 C 41.4 99.2, 39.1 98.9, 37.1 98.2 C 35.1 97.5, 33.2 96.1, 31.5 94.8 C 29.8 93.4, 28.4 91.6, 26.9 90.1 C 25.4 88.5, 24.1 87, 22.6 85.7 C 21.1 84.4, 19.4 83.4, 17.7 82.3 C 15.9 81.2, 13.8 80.4, 12.1 79.1 C 10.3 77.9, 8.3 76.5, 7 74.8 C 5.6 73.2, 4.6 71.1, 4 69.1 C 3.4 67, 3.4 64.6, 3.5 62.5 C 3.6 60.3, 4.2 58.1, 4.4 56 C 4.7 53.9, 5 52, 5 50 C 5 48, 4.7 46.1, 4.4 44 C 4.2 41.9, 3.6 39.7, 3.5 37.5 C 3.4 35.4, 3.4 33, 4 30.9 C 4.6 28.9, 5.6 26.8, 7 25.2 C 8.3 23.5, 10.3 22.1, 12.1 20.9 C 13.8 19.6, 15.9 18.8, 17.7 17.7 C 19.4 16.6, 21.1 15.6, 22.6 14.3 C 24.1 13, 25.4 11.5, 26.9 9.9 C 28.4 8.4, 29.8 6.6, 31.5 5.2 C 33.2 3.9, 35.1 2.5, 37.1 1.8 C 39.1 1.1, 41.4 0.8, 43.5 0.9 C 45.7 1.1, 47.9 1.8, 50 2.5 C 52.1 3.2, 54 4.2, 55.9 4.9 C 57.9 5.5, 59.7 6.1, 61.7 6.5 C 63.6 6.8, 65.7 6.8, 67.8 7 C 69.9 7.2, 72.3 7.2, 74.4 7.8 C 76.5 8.3, 78.7 9.1, 80.4 10.3 C 82.2 11.6, 83.7 13.3, 84.8 15.2 C 86 17, 86.7 19.3, 87.4 21.3 C 88.2 23.3, 88.5 25.4, 89.3 27.3 C 90 29.2, 90.8 30.9, 91.8 32.7 C 92.7 34.5, 94.1 36.1, 95.3 37.9 C 96.4 39.7, 97.8 41.6, 98.6 43.6 C 99.4 45.6, 100 47.9, 100 50 Z';

const locales = ['ja', 'en', 'th'];

for (const locale of locales) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c1149"/>
      <stop offset="1" stop-color="#33254f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(-170 380) scale(3.0)" opacity="0.26">
    <path d="${BLOB}" fill="#e8b9d5"/>
  </g>
  <g transform="translate(725 110) scale(3.8)">
    <path d="${BLOB}" fill="#efe7ff"/>
  </g>
  <text x="96" y="330" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="92" font-weight="700">s12kuma01</text>
  <text x="96" y="560" fill="#9a82db" font-family="Segoe UI, sans-serif" font-size="28">s12kuma01.com</text>
</svg>`;
  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const png = await sharp(base)
    .composite([{ input: MASCOT, left: MASCOT_LEFT, top: MASCOT_TOP }])
    .png()
    .toBuffer();
  writeFileSync(join(outDir, `${locale}.png`), png);
  console.log(`[gen-og] wrote og/${locale}.png (${Math.round(png.length / 1024)} KB)`);
}
