// Material touch ripple: an expanding circle from the pointer point that
// fades out — the state-layer interaction from the M3 connected-button-group.
// Attached to the pill-shaped selectable targets (nav tabs, settings segments,
// language pills) so selection feels like a tap-to-fill, not a sliding thumb.

const TARGETS = '.island__tab, .settings__mode, .settings__lang';

function spawnRipple(e: PointerEvent, el: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Radius reaches the farthest corner so the ripple always covers the pill.
  const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.left = `${x}px`;
  r.style.top = `${y}px`;
  r.style.width = r.style.height = `${radius * 2}px`;
  el.appendChild(r);

  const anim = r.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.2 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
    ],
    { duration: 500, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
  );
  anim.onfinish = () => r.remove();
}

document.addEventListener('pointerdown', (e) => {
  const el = (e.target as Element).closest?.<HTMLElement>(TARGETS);
  if (el) spawnRipple(e, el);
});

export {};
