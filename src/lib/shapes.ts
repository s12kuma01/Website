// M3 Expressive decorative shape library (subset), as 0–1 normalized SVG
// path data for `clipPath clipPathUnits="objectBoundingBox"` — scales to any
// box (40px chip or 160px avatar). Shapes are cosine-modulated rounded
// polygons approximating androidx MaterialShapes; every path is sampled with
// the SAME point count and command structure, so any two shapes can be
// SMIL/JS-morphed (LoadingGlyph relies on this).

const SAMPLES = 96;

interface Lobed {
  lobes: number;
  depth: number;
  /** >1 sharpens lobes toward points (burst/sunny), 1 = smooth scallop. */
  sharpness?: number;
  phaseDeg?: number;
}

function radius(theta: number, { lobes, depth, sharpness = 1 }: Lobed): number {
  if (lobes === 0) return 1;
  const wave = 0.5 + 0.5 * Math.cos(lobes * theta);
  return 1 - depth + depth * Math.pow(wave, sharpness);
}

/** Closed Catmull-Rom → cubic Bézier path through the sampled outline. */
function lobedPath(shape: Lobed): string {
  const pts: [number, number][] = [];
  const phase = ((shape.phaseDeg ?? 0) * Math.PI) / 180;
  for (let i = 0; i < SAMPLES; i++) {
    const theta = (i / SAMPLES) * Math.PI * 2;
    const r = radius(theta, shape) * 0.5;
    pts.push([0.5 + r * Math.cos(theta + phase), 0.5 + r * Math.sin(theta + phase)]);
  }
  const f = (n: number) => Number(n.toFixed(4));
  const at = (i: number) => pts[(i + SAMPLES) % SAMPLES];
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < SAMPLES; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

export const shapes = {
  circle: lobedPath({ lobes: 0, depth: 0 }),
  sunny: lobedPath({ lobes: 8, depth: 0.15, sharpness: 2 }),
  cookie4: lobedPath({ lobes: 4, depth: 0.12, phaseDeg: 45 }),
  cookie7: lobedPath({ lobes: 7, depth: 0.1 }),
  cookie9: lobedPath({ lobes: 9, depth: 0.09 }),
  cookie12: lobedPath({ lobes: 12, depth: 0.07 }),
  flower: lobedPath({ lobes: 8, depth: 0.22 }),
  softBurst: lobedPath({ lobes: 12, depth: 0.2, sharpness: 1.6 }),
} as const;

export type ShapeName = keyof typeof shapes;

/** Morph sequence for the loading indicator (compatible structures). */
export const loadingSequence: string[] = [
  shapes.softBurst,
  shapes.cookie9,
  shapes.sunny,
  shapes.circle,
  shapes.flower,
  shapes.cookie4,
  shapes.cookie12,
];
