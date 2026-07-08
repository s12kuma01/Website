// Theme boot — the ONLY render-blocking script on the site. Source of truth
// for src/styles/generated/boot.min.js (scripts/gen-boot.mjs minifies it,
// asserting < 600 bytes; Base.astro inlines the minified output via ?raw).
//
// Semantics (owner-confirmed):
// - Re-roll the palette ONLY on a hard reload or when this tab has no stored
//   theme yet (fresh visit / new tab). In-site navigation, back-from-external
//   and bfcache restores all KEEP the current palette. No referrer checks —
//   a stored sessionStorage value IS this tab's visit.
// - A reload also discards any slider-customized color (mdThemeCss/mdHue).
// - If a customized color exists, inject it and set the `live` sentinel so
//   no precomputed [data-theme="0..35"] block can match (cascade-proof).
// - Any storage failure (cookies disabled) falls back to theme 0.
(() => {
  var e = document.documentElement;
  try {
    var N = 36,
      s = sessionStorage,
      nav = performance.getEntriesByType('navigation')[0],
      t = s.getItem('mdTheme');
    if ((nav && nav.type === 'reload') || t == null) {
      t = String((Math.random() * N) | 0);
      s.setItem('mdTheme', t);
      s.removeItem('mdThemeCss');
      s.removeItem('mdHue');
    }
    var css = s.getItem('mdThemeCss');
    if (css) {
      var st = document.createElement('style');
      st.id = 'theme-live';
      st.textContent = css;
      document.head.appendChild(st);
      t = 'live';
    }
    e.dataset.theme = t;
    // Manual light/dark override persists across visits (localStorage);
    // absent = auto (follow the OS). Set before paint to avoid a flash.
    var m = localStorage.getItem('mdMode');
    if (m === 'light' || m === 'dark') e.dataset.mode = m;
  } catch (_) {
    e.dataset.theme = '0';
  }
})();
