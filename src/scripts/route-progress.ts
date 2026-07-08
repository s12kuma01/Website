// Top-of-viewport M3 linear progress indicator for page loads. Shown during
// the initial load and during same-origin navigations, but only if the wait
// exceeds a short delay — instant loads never flash it (M3 guidance: don't
// show a loader for sub-second waits). On a static MPA the leaving page's bar
// simply disappears when the browser swaps documents.

const DELAY = 120; // ms before the bar appears
let bar: HTMLElement | null = null;
let timer: number | undefined;

function ensureBar(): HTMLElement {
  if (bar) return bar;
  bar = document.createElement('div');
  bar.className = 'route-progress';
  bar.setAttribute('aria-hidden', 'true'); // browser conveys loading to AT natively
  const fill = document.createElement('span');
  fill.className = 'route-progress__bar';
  bar.appendChild(fill);
  document.body.appendChild(bar);
  return bar;
}

function show(): void {
  ensureBar().dataset.active = '';
}

function hide(): void {
  window.clearTimeout(timer);
  if (bar) delete bar.dataset.active;
}

function arm(): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(show, DELAY);
}

// Initial load: show if the document isn't done quickly (e.g. fonts/images).
if (document.readyState !== 'complete') {
  arm();
  window.addEventListener('load', hide, { once: true });
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return;
  }
  const a = (e.target as Element).closest('a');
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  // In-page hash jump — no document load.
  if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
  arm();
});

// Back/forward from bfcache restores an old page — clear any leftover bar.
window.addEventListener('pageshow', (e) => {
  if ((e as PageTransitionEvent).persisted) hide();
});

export {};
