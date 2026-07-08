// Minifies src/scripts/theme-boot.js -> src/styles/generated/boot.min.js.
// The boot script is inlined into every page's <head>; the byte budget is a
// hard build gate so it can never quietly grow.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const BUDGET = 600; // bytes, minified

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', 'src', 'scripts', 'theme-boot.js');
const OUT = join(here, '..', 'src', 'styles', 'generated', 'boot.min.js');

const source = readFileSync(SRC, 'utf8');
const hash = createHash('sha256').update(source).digest('hex').slice(0, 16);
const header = `/* gen:${hash} */`;

if (existsSync(OUT) && readFileSync(OUT, 'utf8').startsWith(header)) {
  console.log('[gen-boot] up to date, skipped');
  process.exit(0);
}

const { code } = await transform(source, { minify: true, target: 'es2018' });
const bytes = Buffer.byteLength(code, 'utf8');
if (bytes >= BUDGET) {
  console.error(`[gen-boot] boot script is ${bytes} B — budget is < ${BUDGET} B. Refusing.`);
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${header}${code.trim()}`);
console.log(`[gen-boot] wrote boot.min.js (${bytes} B / ${BUDGET} B budget)`);
