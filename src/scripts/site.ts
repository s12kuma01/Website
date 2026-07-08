// Deferred site-wide module: keeps <meta name="theme-color"> in sync with the
// resolved --md-sys-color-surface. Handles the random palette, a live
// slider-customized palette (mdthemechange fired by theme-live.ts), and OS
// scheme flips — none of which a static meta value could.

function syncThemeColor(): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  // Read the RESOLVED surface color off the body — the --md-sys-color-*
  // tokens hold light-dark() functions, which getComputedStyle returns
  // verbatim on a custom property; only a real property (background-color)
  // resolves them to a concrete color for the current color-scheme.
  const surface = getComputedStyle(document.body).backgroundColor.trim();
  if (surface) meta.content = surface;
}

syncThemeColor();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeColor);
document.addEventListener('mdthemechange', syncThemeColor);

export {};
