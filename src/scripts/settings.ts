// Settings FAB behavior. The appearance-mode segmented control needs no MCU
// (it just flips color-scheme via data-mode); the MCU color chunk is lazily
// imported when the panel first opens so the hue slider + re-roll are ready.
// The panel opens via the native Popover API, with a JS fallback (below) for
// engines without it so language + appearance stay reachable everywhere.

const html = document.documentElement;

const modeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.settings__mode'),
);

function readMode(): string {
  try {
    return localStorage.getItem('mdMode') || 'auto';
  } catch {
    return 'auto';
  }
}

function applyMode(mode: string, persist: boolean): void {
  if (mode === 'auto') delete html.dataset.mode;
  else html.dataset.mode = mode;
  if (persist) {
    try {
      localStorage.setItem('mdMode', mode);
    } catch {
      /* storage unavailable — mode still applies for this page */
    }
  }
  // Single-select segmented control = ARIA radio group: check the active
  // segment and give it the group's only tab stop (roving tabindex).
  for (const btn of modeButtons) {
    const on = btn.dataset.modeValue === mode;
    btn.setAttribute('aria-checked', String(on));
    btn.tabIndex = on ? 0 : -1;
  }
  // color-scheme changed → the resolved surface color changed too.
  if (persist) document.dispatchEvent(new Event('mdthemechange'));
}

// Sync the segmented control to the mode the boot script already applied.
applyMode(readMode(), false);

for (const btn of modeButtons) {
  btn.addEventListener('click', () => applyMode(btn.dataset.modeValue ?? 'auto', true));
}

// Radio-group keyboard model: arrows / Home / End move focus and select.
document.querySelector('.settings__modes')?.addEventListener('keydown', (e) => {
  const ev = e as KeyboardEvent;
  const idx = modeButtons.indexOf(document.activeElement as HTMLButtonElement);
  if (idx < 0) return;
  const last = modeButtons.length - 1;
  let next = -1;
  if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = idx === last ? 0 : idx + 1;
  else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') next = idx === 0 ? last : idx - 1;
  else if (ev.key === 'Home') next = 0;
  else if (ev.key === 'End') next = last;
  if (next < 0) return;
  ev.preventDefault();
  const btn = modeButtons[next];
  btn.focus();
  applyMode(btn.dataset.modeValue ?? 'auto', true);
});

const pop = document.getElementById('settings-pop');
// Toggle the icon-morph flag on the FAB button (a real box) rather than the
// display:contents .settings wrapper, whose lack of a box stops descendant
// style rules from applying.
const fab = document.querySelector<HTMLElement>('.settings__fab');
let mcuLoaded = false;

async function onOpen(): Promise<void> {
  fab?.toggleAttribute('data-open', true);
  if (mcuLoaded) return;
  // Lazy MCU: mode + language work without it; only the palette slider needs it.
  mcuLoaded = true;
  const mod = await import('@/scripts/theme-live');
  mod.init();
}

const supportsPopover =
  typeof HTMLElement !== 'undefined' &&
  Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover');

if (supportsPopover) {
  pop?.addEventListener('toggle', (e) => {
    const open = (e as ToggleEvent).newState === 'open';
    if (open) void onOpen();
    else fab?.removeAttribute('data-open');
  });
} else if (pop && fab) {
  // No Popover API (older engines): drive the panel manually so language and
  // appearance controls stay reachable. `.settings-pop.is-open` mirrors the
  // :popover-open styles in the component CSS.
  const setOpen = (open: boolean): void => {
    pop.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) void onOpen();
    else fab.removeAttribute('data-open');
  };
  fab.setAttribute('aria-expanded', 'false');
  fab.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(!pop.classList.contains('is-open'));
  });
  document.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape' && pop.classList.contains('is-open')) setOpen(false);
  });
  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    if (pop.classList.contains('is-open') && !pop.contains(target) && !fab.contains(target)) {
      setOpen(false);
    }
  });
}

export {};
