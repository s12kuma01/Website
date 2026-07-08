// Lazy MCU chunk — loaded the first time the theme popover opens. Drives the
// continuous hue slider: regenerates all 49 color roles through the
// SAME emission module the build-time generator uses (scheme-css.mjs), so
// runtime output can never drift from the precomputed palettes.
import { liveThemeCss } from '../../scripts/lib/scheme-css.mjs';

const THEME_COUNT = 36;

function applyHue(hue: number, persist: boolean): void {
  const css = liveThemeCss(hue);
  let style = document.getElementById('theme-live') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'theme-live';
    document.head.appendChild(style);
  }
  style.textContent = css;
  document.documentElement.dataset.theme = 'live';
  if (persist) {
    try {
      sessionStorage.setItem('mdThemeCss', css);
      sessionStorage.setItem('mdHue', String(hue));
    } catch {
      /* storage unavailable — theme still applies for this page */
    }
  }
  document.dispatchEvent(new Event('mdthemechange'));
}

function currentHue(): number {
  try {
    const stored = sessionStorage.getItem('mdHue');
    const hue = stored === null ? NaN : Number(stored);
    if (Number.isFinite(hue)) return ((hue % 360) + 360) % 360;
    const idx = Number(sessionStorage.getItem('mdTheme') ?? '0');
    return Number.isFinite(idx) ? (idx * 360) / THEME_COUNT : 0;
  } catch {
    return 0;
  }
}

export function init(): void {
  const slider = document.getElementById('theme-hue') as HTMLInputElement | null;
  const reroll = document.getElementById('theme-reroll');
  if (!slider) return;

  const sync = (hue: number) => {
    slider.value = String(Math.round(hue) % 360);
    slider.dispatchEvent(new Event('input', { bubbles: true })); // repaint track/output
  };
  sync(currentHue());

  slider.addEventListener('input', () => applyHue(slider.valueAsNumber, false));
  slider.addEventListener('change', () => applyHue(slider.valueAsNumber, true));

  reroll?.addEventListener('click', () => {
    const hue = Math.floor(Math.random() * 360);
    sync(hue);
    applyHue(hue, true);
  });
}
