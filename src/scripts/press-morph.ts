// Global press-state owner. One delegated listener set per page powers:
// - [data-pressed] on .m3-btn / .m3-iconbtn (drives the border-radius shape
//   morph in CSS) — pointer AND keyboard (Space on buttons, Enter on links)
// - the button-group "squish": the pressed child grows to 1.15× its measured
//   width while siblings compress, springs back on release.

const PRESSABLE = '.m3-btn, .m3-iconbtn';

function press(el: HTMLElement): void {
  el.setAttribute('data-pressed', '');
  squishStart(el);
}

function release(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-pressed]')) {
    el.removeAttribute('data-pressed');
  }
  squishEnd();
}

document.addEventListener('pointerdown', (e) => {
  const el = (e.target as Element).closest<HTMLElement>(PRESSABLE);
  if (el) press(el);
});
window.addEventListener('pointerup', release);
window.addEventListener('pointercancel', release);
window.addEventListener('blur', release);

// Keyboard parity: Space activates buttons on keyup, Enter activates links on
// keydown — mirror the native activation model so the morph matches.
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const el = (e.target as Element).closest?.<HTMLElement>(PRESSABLE);
  if (!el) return;
  const isLink = el.tagName === 'A';
  if ((!isLink && e.key === ' ') || (isLink && e.key === 'Enter')) press(el);
});
document.addEventListener('keyup', release);

let squished: HTMLElement[] = [];

function squishStart(el: HTMLElement): void {
  const group = el.closest<HTMLElement>('.m3-group');
  if (!group || group.dataset.connected !== undefined) return;
  const children = [...group.children].filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.matches(PRESSABLE),
  );
  if (children.length < 2) return;
  const widths = children.map((c) => c.offsetWidth);
  const grow = Math.round(widths[children.indexOf(el)] * 0.15);
  const shed = Math.ceil(grow / (children.length - 1));
  children.forEach((c, i) => {
    // Lock measured widths so the transition has concrete endpoints.
    c.style.width = `${widths[i]}px`;
    c.dataset.restWidth = String(widths[i]);
  });
  // Commit the locked widths synchronously, then retarget — the forced
  // reflow guarantees the width transition starts from the rest value.
  void group.offsetWidth;
  children.forEach((c, i) => {
    const w = widths[i] + (c === el ? grow : -shed);
    c.style.width = `${w}px`;
  });
  squished = children;
}

function squishEnd(): void {
  if (!squished.length) return;
  const children = squished;
  squished = [];
  for (const c of children) {
    c.style.width = `${c.dataset.restWidth}px`;
    const cleanup = (e: TransitionEvent) => {
      if (e.propertyName !== 'width') return;
      c.style.removeProperty('width');
      delete c.dataset.restWidth;
      c.removeEventListener('transitionend', cleanup);
    };
    c.addEventListener('transitionend', cleanup);
  }
}

export {};
