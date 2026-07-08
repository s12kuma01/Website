// Island header behavior: scroll condense/hide states, with the initial
// state computed synchronously so an MPA navigation that lands mid-page
// renders condensed with no jump. (The active-tab pill needs no JS — it is
// static per page and glides between pages via view transitions.)

const island = document.querySelector<HTMLElement>('.island');

if (island) {
  const CONDENSE_AT = 64;
  const HIDE_MIN_Y = 200;
  const HIDE_VELOCITY = 0.5; // px/ms downward

  let lastY = window.scrollY;
  let lastT = performance.now();

  function headerBusy(): boolean {
    return (
      island!.querySelector(':popover-open') !== null ||
      island!.contains(document.activeElement)
    );
  }

  function setState(state: 'expanded' | 'condensed' | 'hidden'): void {
    if (island!.dataset.state !== state) island!.dataset.state = state;
  }

  // Initial state — synchronous, before first interaction paint.
  setState(window.scrollY > CONDENSE_AT ? 'condensed' : 'expanded');

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      const t = performance.now();
      const v = (y - lastY) / Math.max(1, t - lastT);
      lastY = y;
      lastT = t;

      if (y <= CONDENSE_AT) {
        setState('expanded');
        return;
      }
      if (v < 0) {
        setState('condensed');
        return;
      }
      if (v > HIDE_VELOCITY && y > HIDE_MIN_Y && !headerBusy()) {
        setState('hidden');
        return;
      }
      if (island!.dataset.state !== 'hidden') setState('condensed');
    },
    { passive: true },
  );
}

export {};
