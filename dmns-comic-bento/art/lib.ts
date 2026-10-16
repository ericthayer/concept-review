/**
 * Tiny drawing DSL for placeholder line art. Shapes are point lists; the sprite
 * builder jitters points per frame to get hand-drawn "boil" without JS redraws.
 */

export type Point = readonly [number, number];

export type Tone =
  | 'ink'
  | 'paper'
  | 'green'
  | 'blue'
  | 'orange'
  | 'magenta'
  | 'red'
  | 'sepia'
  | 'halftone'
  | 'pencil-fill';

export type LineKind = 'ink' | 'paper' | 'pencil' | 'fine';

export interface Stroke {
  readonly pts: readonly Point[];
  readonly closed?: boolean;
  /** Catmull-Rom smoothing (default true). Straight polylines for false. */
  readonly smooth?: boolean;
  readonly line?: LineKind;
}

export interface Fill {
  readonly pts: readonly Point[];
  readonly tone: Tone;
  readonly smooth?: boolean;
}

export interface Figure {
  readonly id: string;
  readonly viewBox: readonly [number, number, number, number];
  readonly fills: readonly Fill[];
  readonly strokes: readonly Stroke[];
  /** Fill layer offset, the misprint off-register (2–4px). */
  readonly register?: Point;
}

/* ---------- seeded randomness ---------- */

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/* ---------- primitives ---------- */

export function ellipse(cx: number, cy: number, rx: number, ry: number, n = 16, rot = 0): Point[] {
  const out: Point[] = [];
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return out;
}

export function circle(cx: number, cy: number, r: number, n = 14): Point[] {
  return ellipse(cx, cy, r, r, n);
}

/** Lumpy closed blob, for ink blots, canopies and rocks. */
export function blob(cx: number, cy: number, r: number, seed: string, n = 14, lump = 0.14): Point[] {
  const rand = rng(hashSeed(seed));
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + (rand() - 0.5) * 2 * lump);
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

export function rect(x: number, y: number, w: number, h: number): Point[] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

export function arc(cx: number, cy: number, r: number, from: number, to: number, n = 10): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

export function wave(x0: number, x1: number, y: number, amp: number, periods: number, phase = 0, n = 24): Point[] {
  const out: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push([x0 + (x1 - x0) * t, y + Math.sin(t * periods * Math.PI * 2 + phase) * amp]);
  }
  return out;
}

export function star(cx: number, cy: number, r: number): Stroke[] {
  return [
    { pts: [[cx - r, cy], [cx + r, cy]], smooth: false },
    { pts: [[cx, cy - r], [cx, cy + r]], smooth: false },
  ];
}

export function translate(pts: readonly Point[], dx: number, dy: number): Point[] {
  return pts.map(([x, y]) => [x + dx, y + dy] as const);
}

export function rotate(pts: readonly Point[], deg: number, cx: number, cy: number): Point[] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as const);
}

export function line(...pts: Point[]): Stroke {
  return { pts, smooth: false };
}

export function curve(...pts: Point[]): Stroke {
  return { pts, smooth: true };
}

export function closed(pts: readonly Point[], smooth = true, lineKind: LineKind = 'ink'): Stroke {
  return { pts, closed: true, smooth, line: lineKind };
}

export function shape(pts: readonly Point[], tone: Tone, smooth = true): { fill: Fill; stroke: Stroke } {
  return { fill: { pts, tone, smooth }, stroke: { pts, closed: true, smooth } };
}

/* ---------- path output ---------- */

const r1 = (n: number): string => (Math.round(n * 10) / 10).toString();

export function toPath(pts: readonly Point[], isClosed: boolean, smooth: boolean): string {
  if (pts.length === 0) return '';
  const first = pts[0];
  if (!first) return '';
  if (!smooth || pts.length < 3) {
    return `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L')}${isClosed ? 'Z' : ''}`;
  }
  const p = (i: number): Point => {
    const n = pts.length;
    if (isClosed) return pts[((i % n) + n) % n] ?? first;
    return pts[Math.max(0, Math.min(n - 1, i))] ?? first;
  };
  let d = `M${r1(first[0])} ${r1(first[1])}`;
  const segs = isClosed ? pts.length : pts.length - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return isClosed ? `${d}Z` : d;
}

export function jitter(pts: readonly Point[], rand: () => number, amp: number): Point[] {
  return pts.map(([x, y]) => [x + (rand() - 0.5) * 2 * amp, y + (rand() - 0.5) * 2 * amp] as const);
}
