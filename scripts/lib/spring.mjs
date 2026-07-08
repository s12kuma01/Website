// M3 Expressive spring physics — closed-form unit step response.
// Used by the motion-token generator (gen-motion-tokens.mjs) at build time.

/**
 * Spring progress x(t) for a unit step, mass = 1.
 * Underdamped (zeta < 1) and critically damped (zeta = 1) branches.
 */
export function springProgress(zeta, omega0, t) {
  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * omega0 * t) *
        (Math.cos(omegaD * t) + ((zeta * omega0) / omegaD) * Math.sin(omegaD * t))
    );
  }
  return 1 - Math.exp(-omega0 * t) * (1 + omega0 * t);
}

/**
 * Settle time: decay envelope reaches 0.1% (ln(1000) time constants).
 * Rounded up to 10 ms so token values stay tidy.
 */
export function settleTimeMs(zeta, omega0) {
  const t = Math.log(1000) / (zeta * omega0);
  return Math.ceil((t * 1000) / 10) * 10;
}

/**
 * CSS linear() easing for a spring. `samples` points distributed by
 * t_i = T * (i/(n-1))^1.5 — denser early, where stiff springs do most of
 * their travel. Percentages are required by linear() for non-uniform stops.
 */
export function springLinearEasing(zeta, stiffness, samples = 80) {
  const omega0 = Math.sqrt(stiffness);
  const durationMs = settleTimeMs(zeta, omega0);
  const T = durationMs / 1000;
  const stops = [];
  for (let i = 0; i < samples; i++) {
    const frac = Math.pow(i / (samples - 1), 1.5);
    const x = springProgress(zeta, omega0, frac * T);
    const value = Number(x.toFixed(4));
    const pct = Number((frac * 100).toFixed(2));
    stops.push(i === 0 ? `${value}` : `${value} ${pct}%`);
  }
  return { easing: `linear(${stops.join(', ')})`, durationMs };
}

/** M3 Expressive motion scheme tokens (androidx ExpressiveMotionTokens.kt). */
export const EXPRESSIVE_SPRINGS = {
  'fast-spatial': { zeta: 0.6, stiffness: 800 },
  'default-spatial': { zeta: 0.8, stiffness: 380 },
  'slow-spatial': { zeta: 0.8, stiffness: 200 },
  'fast-effects': { zeta: 1.0, stiffness: 3800 },
  'default-effects': { zeta: 1.0, stiffness: 1600 },
  'slow-effects': { zeta: 1.0, stiffness: 800 },
};
