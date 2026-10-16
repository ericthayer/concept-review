/**
 * Turns art figures into SVG <symbol>s: three jittered line frames (the boil)
 * plus one fill layer. Pages inline only the symbols they use.
 * Run directly to regenerate art/generated/*.svg reference sources.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashSeed, jitter, rng, toPath, type Figure, type LineKind } from '../art/lib.ts';
import { SCENES } from '../art/scenes.ts';
import { specimenFigure } from '../art/specimen.ts';
import { POSES } from '../src/lib/content.ts';

export const BOIL_FRAMES = 3;

const FIGURES: ReadonlyMap<string, Figure> = new Map(
  [...SCENES, ...POSES.map((p) => specimenFigure(p))].map((f) => [f.id, f]),
);

export function hasFigure(id: string): boolean {
  return FIGURES.has(id);
}

export function figure(id: string): Figure {
  const f = FIGURES.get(id);
  if (!f) throw new Error(`Unknown art figure: ${id}`);
  return f;
}

export function allFigureIds(): string[] {
  return [...FIGURES.keys()];
}

const LINE_CLASS: Readonly<Record<LineKind, string>> = {
  ink: 'ln',
  paper: 'ln ln--paper',
  pencil: 'ln ln--pencil',
  fine: 'ln ln--fine',
};

function viewBox(f: Figure): string {
  return f.viewBox.join(' ');
}

export function lineFrame(f: Figure, frame: number): string {
  const rand = rng(hashSeed(`${f.id}:${frame}`));
  const amp = f.id.startsWith('specimen') ? 0.9 : 1.2;
  return f.strokes
    .map((s) => {
      const pts = frame === 0 ? s.pts : jitter(s.pts, rand, amp);
      return `<path class="${LINE_CLASS[s.line ?? 'ink']}" pathLength="1" d="${toPath(pts, s.closed ?? false, s.smooth ?? true)}"/>`;
    })
    .join('');
}

export function fillLayer(f: Figure): string {
  return f.fills.map((fl) => `<path class="fl fl--${fl.tone}" d="${toPath(fl.pts, true, fl.smooth ?? true)}"/>`).join('');
}

export function symbolsFor(id: string): string {
  const f = figure(id);
  let out = `<symbol id="${id}-f" viewBox="${viewBox(f)}">${fillLayer(f)}</symbol>`;
  for (let k = 0; k < BOIL_FRAMES; k++) {
    out += `<symbol id="${id}-l${k}" viewBox="${viewBox(f)}">${lineFrame(f, k)}</symbol>`;
  }
  return out;
}

const PATTERNS =
  '<pattern id="halftone" width="7" height="7" patternUnits="userSpaceOnUse"><circle class="ht-dot" cx="3.5" cy="3.5" r="1.5"/></pattern>' +
  '<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path class="hatch" d="M0 8L8 0"/></pattern>';

/** The per-page sprite: patterns plus every used figure, once. */
export function sprite(ids: Iterable<string>): string {
  const unique = [...new Set(ids)].sort();
  if (unique.length === 0) return '';
  return `<svg class="sprite" aria-hidden="true" focusable="false"><defs>${PATTERNS}${unique.map(symbolsFor).join('')}</defs></svg>`;
}

/** Standalone reference SVG: frames as separate groups, for illustrators. */
export function referenceSvg(id: string): string {
  const f = figure(id);
  const frames = Array.from({ length: BOIL_FRAMES }, (_, k) => `<g id="frame-${k + 1}" fill="none" stroke="#0d0d0d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${k > 0 ? ' visibility="hidden"' : ''}>${lineFrame(f, k).replace(/ class="[^"]*"| pathLength="1"/g, '')}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox(f)}"><title>${id} (placeholder sketch)</title><g id="fills" fill="#cccccc" transform="translate(${(f.register ?? [0, 0]).join(' ')})">${fillLayer(f).replace(/ class="[^"]*"/g, '')}</g>${frames}</svg>\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = join(import.meta.dirname, '..', 'art', 'generated');
  mkdirSync(dir, { recursive: true });
  for (const id of allFigureIds()) writeFileSync(join(dir, `${id}.svg`), referenceSvg(id));
  console.log(`Wrote ${allFigureIds().length} reference SVGs to art/generated/`);
}
