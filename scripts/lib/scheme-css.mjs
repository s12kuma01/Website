// Shared color-role CSS emission — the ONLY place that turns a DynamicScheme
// into CSS declarations. Used by scripts/gen-color-tokens.mjs (build) and
// src/scripts/theme-live.ts (lazy runtime chunk), so generator and client
// output cannot drift.

import {
  Hct,
  TonalPalette,
  DynamicScheme,
  Variant,
  SchemeVibrant,
  MaterialDynamicColors,
  hexFromArgb,
} from '@material/material-color-utilities';

export const SEED_CHROMA = 84;
export const SEED_TONE = 48;
export const SPEC_VERSION = '2025';
// Chroma of the neutral (surface/background/outline) palette. Kept very low
// so the base stays essentially monochrome — like the Material 3 website —
// with only a whisper of the accent hue for cohesion. Bump toward 0 for a
// pure grey base, or higher to tint surfaces more.
export const NEUTRAL_CHROMA = 4;

// Dark mode only: raise the tone (≈ L*) of the surface family by this much so
// the dark base is a bit lighter than MCU's very dark default. Text/accents
// are untouched, so contrast stays well within spec. 0 disables the lift.
export const DARK_SURFACE_LIFT = 5;

// Surface-family roles that get the dark lift (neutral backgrounds/fills only
// — not text, outlines, inverse, accents, scrim/shadow/tint).
const DARK_LIFT_ROLES = new Set([
  'background',
  'surface',
  'surface_dim',
  'surface_bright',
  'surface_container_lowest',
  'surface_container_low',
  'surface_container',
  'surface_container_high',
  'surface_container_highest',
  'surface_variant',
]);

function liftTone(argb, delta) {
  const hct = Hct.fromInt(argb);
  hct.tone = Math.min(100, hct.tone + delta);
  return hct.toInt();
}

const mdc = new MaterialDynamicColors();

// The classic 49-role set: allColors minus the 2025 watch-oriented plain
// `*_dim` accent roles, plus four roles that 0.4.0's allColors omits but
// still exposes as methods (surface-variant, surface-tint, shadow, scrim).
const EXCLUDED = new Set(['primary_dim', 'secondary_dim', 'tertiary_dim', 'error_dim']);
const ROLES = [
  ...mdc.allColors.filter(
    (c) => c && !c.name.endsWith('_palette_key_color') && !EXCLUDED.has(c.name),
  ),
  mdc.surfaceVariant(),
  mdc.surfaceTint(),
  mdc.shadow(),
  mdc.scrim(),
];

if (ROLES.length !== 49) {
  throw new Error(
    `MCU role set drifted: expected 49 roles, got ${ROLES.length} — ` +
      `check @material/material-color-utilities version pin (0.4.0).`,
  );
}

export function schemeForHue(hue, isDark) {
  const source = Hct.from(hue, SEED_CHROMA, SEED_TONE);
  // Accents (primary/secondary/tertiary/error) come from the vibrant scheme…
  const vivid = new SchemeVibrant(source, isDark, 0, SPEC_VERSION);
  // …while the neutral palettes are near-greyscale, so surfaces, backgrounds
  // and outlines stay monochrome and the palette only shows on accents.
  const neutral = TonalPalette.fromHueAndChroma(hue, NEUTRAL_CHROMA);
  return new DynamicScheme({
    sourceColorHct: source,
    variant: Variant.VIBRANT,
    contrastLevel: 0,
    isDark,
    specVersion: SPEC_VERSION,
    primaryPalette: vivid.primaryPalette,
    secondaryPalette: vivid.secondaryPalette,
    tertiaryPalette: vivid.tertiaryPalette,
    neutralPalette: neutral,
    neutralVariantPalette: neutral,
    errorPalette: vivid.errorPalette,
  });
}

/**
 * All 49 `--md-sys-color-*` declarations for one hue, each as a
 * `light-dark(<light>, <dark>)` pair. The active mode is chosen by the
 * `color-scheme` property (set from `data-mode` in base.css), so a single
 * block serves auto / forced-light / forced-dark — no media query, and a
 * manual mode toggle re-resolves instantly.
 */
export function schemeCssDecls(hue) {
  const light = schemeForHue(hue, false);
  const dark = schemeForHue(hue, true);
  const out = [];
  for (const color of ROLES) {
    const name = color.name.replaceAll('_', '-');
    const l = hexFromArgb(color.getArgb(light));
    let darkArgb = color.getArgb(dark);
    if (DARK_SURFACE_LIFT && DARK_LIFT_ROLES.has(color.name)) {
      darkArgb = liftTone(darkArgb, DARK_SURFACE_LIFT);
    }
    out.push(`--md-sys-color-${name}:light-dark(${l},${hexFromArgb(darkArgb)})`);
  }
  return out.join(';') + ';';
}

/**
 * Self-sufficient CSS for a runtime-customized hue, targeting the
 * `data-theme="live"` sentinel (matches no precomputed block, so it is the
 * sole source of color once set). `html[...]` (0,1,1) outranks every
 * precomputed selector regardless of stylesheet order.
 */
export function liveThemeCss(hue) {
  return `html[data-theme="live"]{${schemeCssDecls(hue)}}`;
}
