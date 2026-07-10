// Post-build step: emits dist/_headers (Cloudflare static-assets header rules)
// with a strict Content-Security-Policy plus the standard hardening headers.
//
// The CSP's script-src is hash-based: every INLINE <script> the build emits
// (the render-blocking theme boot + Astro's hoisted module scripts) is hashed
// here from the actual dist HTML, so script-src needs no 'unsafe-inline' and
// the policy stays strict without any hand-maintained hash list. Runs after
// `astro build` (see package.json), reading the final HTML so the hashes can
// never drift from what ships.
//
// style-src keeps 'unsafe-inline' on purpose: the dynamic-color feature injects
// a runtime <style> (theme-boot.js / theme-live.ts) and components set style=""
// attributes (slider fill, shape-mask clip-path) — neither is hashable at build
// time, and a single style hash would make browsers ignore 'unsafe-inline' and
// break theming. CSS injection is low-impact and there is no injection sink, so
// this is an acceptable trade; script-src carries the real protection.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

/** All *.html files under dist/, recursively. */
function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

// Collect the exact source text of every inline, executable <script>. Skips
// external scripts (src=) and non-executed data blocks (application/ld+json),
// which CSP script-src does not govern. The captured text is hashed verbatim —
// no trimming — to match the digest the browser computes over the same bytes.
const SCRIPT = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
const hashes = new Set();

const pages = htmlFiles(DIST);
if (pages.length === 0) {
  console.error('[gen-headers] no HTML in dist/ — run after `astro build`. Refusing.');
  process.exit(1);
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const [, attrs, body] of html.matchAll(SCRIPT)) {
    if (/\bsrc\s*=/i.test(attrs)) continue; // external — covered by 'self'
    if (/type\s*=\s*["']?application\/(ld\+json|json)/i.test(attrs)) continue; // data, not executed
    if (body === '') continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
}

if (hashes.size === 0) {
  console.error('[gen-headers] found no inline scripts to hash — unexpected. Refusing.');
  process.exit(1);
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const permissions = [
  'accelerometer=()',
  'autoplay=()',
  'camera=()',
  'display-capture=()',
  'encrypted-media=()',
  'fullscreen=(self)',
  'geolocation=()',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'usb=()',
  'browsing-topics=()',
].join(', ');

// Cloudflare _headers: a path pattern, then indented "Name: value" lines.
const headers = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': permissions,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': csp,
};

const body =
  '/*\n' +
  Object.entries(headers)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n') +
  '\n';

writeFileSync(join(DIST, '_headers'), body);
console.log(`[gen-headers] wrote dist/_headers (${hashes.size} script hashes, ${pages.length} pages)`);
