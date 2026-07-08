// Types for the shared build/runtime color-emission module (plain .mjs).
declare module '*/scripts/lib/scheme-css.mjs' {
  export const SEED_CHROMA: number;
  export const SEED_TONE: number;
  export const SPEC_VERSION: string;
  export function schemeForHue(hue: number, isDark: boolean): unknown;
  export function schemeCssDecls(scheme: unknown): string;
  export function liveThemeCss(hue: number): string;
}
