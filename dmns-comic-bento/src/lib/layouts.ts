/**
 * Named spread layouts. Content picks a layout; it never hand-places cells.
 * Area letters are assigned to panels in DOM order (a = first panel), and every
 * area map is authored so row-major first occurrence follows a, b, c… — the
 * reading-order guarantee (WCAG 1.3.2 / 2.4.3) is checked in tests.
 */

export type Span = 's' | 'm' | 'w' | 't' | 'xl' | 'splash';
export type LayoutName = 'cover' | 'trio' | 'mosaic' | 'stair' | 'strip';
export type ContainerSize = 'phone' | 'tablet' | 'desktop';

export const CONTAINER_SIZES: readonly ContainerSize[] = ['phone', 'tablet', 'desktop'];

export const COLUMNS: Readonly<Record<ContainerSize, number>> = {
  phone: 2,
  tablet: 6,
  desktop: 12,
};

/** Container min-widths (px) at which each size starts. */
export const BREAKPOINT: Readonly<Record<ContainerSize, number>> = {
  phone: 0,
  tablet: 600,
  desktop: 1000,
};

/** [columns, rows] each span token occupies at each container size. */
export const SPAN_SIZE: Readonly<Record<ContainerSize, Readonly<Record<Span, readonly [number, number]>>>> = {
  desktop: { s: [3, 1], m: [3, 2], w: [6, 2], t: [3, 4], xl: [6, 4], splash: [12, 4] },
  tablet: { s: [3, 1], m: [3, 2], w: [6, 2], t: [3, 3], xl: [6, 3], splash: [6, 3] },
  phone: { s: [2, 1], m: [2, 2], w: [2, 2], t: [2, 3], xl: [2, 3], splash: [2, 3] },
};

export interface AreaLayout {
  readonly kind: 'areas';
  readonly slots: readonly Span[];
  readonly areas: Readonly<Record<ContainerSize, readonly string[]>>;
}

export interface FlowLayout {
  readonly kind: 'flow';
  /** Stair offsets each step group one column further right on desktop. */
  readonly stepped: boolean;
}

export type Layout = AreaLayout | FlowLayout;

export const LAYOUTS: Readonly<Record<LayoutName, Layout>> = {
  cover: {
    kind: 'areas',
    slots: ['xl', 'm', 's', 's'],
    areas: {
      desktop: [
        'a a a a a a a a a b b b',
        'a a a a a a a a a b b b',
        'a a a a a a a a a c c c',
        'a a a a a a a a a d d d',
      ],
      tablet: ['a a a a a a', 'a a a a a a', 'a a a a a a', 'b b b c c c', 'b b b d d d'],
      phone: ['a a', 'a a', 'a a', 'b b', 'b b', 'c c', 'd d'],
    },
  },
  trio: {
    kind: 'areas',
    slots: ['t', 't', 't'],
    areas: {
      desktop: [
        'a a a a b b b b c c c c',
        'a a a a b b b b c c c c',
        'a a a a b b b b c c c c',
      ],
      tablet: ['a a a b b b', 'a a a b b b', 'c c c c c c'],
      phone: ['a a', 'a a', 'b b', 'b b', 'c c', 'c c'],
    },
  },
  mosaic: {
    kind: 'areas',
    slots: ['xl', 'm', 'm', 's', 's'],
    areas: {
      desktop: [
        'a a a a a a b b b c c c',
        'a a a a a a b b b c c c',
        'a a a a a a d d d d d d',
        'a a a a a a e e e e e e',
      ],
      tablet: ['a a a a a a', 'a a a a a a', 'a a a a a a', 'b b b c c c', 'b b b c c c', 'd d d e e e'],
      phone: ['a a', 'a a', 'a a', 'b b', 'b b', 'c c', 'c c', 'd d', 'e e'],
    },
  },
  stair: { kind: 'flow', stepped: true },
  strip: { kind: 'flow', stepped: false },
};

export const AREA_NAMES = 'abcdefgh';

/** Letters of an area map in row-major first-occurrence order (ignoring "."). */
export function readingOrderOfAreas(rows: readonly string[]): string[] {
  const seen: string[] = [];
  for (const row of rows) {
    for (const cell of row.trim().split(/\s+/)) {
      if (cell !== '.' && !seen.includes(cell)) seen.push(cell);
    }
  }
  return seen;
}

export interface LayoutProblem {
  readonly layout: LayoutName;
  readonly size: ContainerSize;
  readonly message: string;
}

/** Validate column counts, rectangular areas and reading order for every layout. */
export function validateLayouts(layouts: Readonly<Record<LayoutName, Layout>> = LAYOUTS): LayoutProblem[] {
  const problems: LayoutProblem[] = [];
  for (const [name, layout] of Object.entries(layouts) as [LayoutName, Layout][]) {
    if (layout.kind !== 'areas') continue;
    const expected = AREA_NAMES.slice(0, layout.slots.length).split('');
    for (const size of CONTAINER_SIZES) {
      const rows = layout.areas[size];
      for (const row of rows) {
        const n = row.trim().split(/\s+/).length;
        if (n !== COLUMNS[size]) {
          problems.push({ layout: name, size, message: `row "${row}" has ${n} columns, expected ${COLUMNS[size]}` });
        }
      }
      const order = readingOrderOfAreas(rows);
      if (order.join('') !== expected.join('')) {
        problems.push({ layout: name, size, message: `reading order ${order.join('')} ≠ ${expected.join('')}` });
      }
      for (const letter of expected) {
        if (!isRectangle(rows, letter)) {
          problems.push({ layout: name, size, message: `area ${letter} is not a rectangle` });
        }
      }
    }
  }
  return problems;
}

function isRectangle(rows: readonly string[], letter: string): boolean {
  const cells: [number, number][] = [];
  rows.forEach((row, r) => {
    row.trim().split(/\s+/).forEach((cell, c) => {
      if (cell === letter) cells.push([r, c]);
    });
  });
  if (cells.length === 0) return false;
  const rs = cells.map(([r]) => r);
  const cs = cells.map(([, c]) => c);
  const h = Math.max(...rs) - Math.min(...rs) + 1;
  const w = Math.max(...cs) - Math.min(...cs) + 1;
  return h * w === cells.length;
}

/** Number of panels a layout requires (null = any count). */
export function slotCount(name: LayoutName): number | null {
  const layout = LAYOUTS[name];
  return layout.kind === 'areas' ? layout.slots.length : null;
}

/** Span token a panel takes in an area layout; flow layouts keep the panel's own. */
export function spanForSlot(name: LayoutName, index: number, own: Span): Span {
  const layout = LAYOUTS[name];
  if (layout.kind !== 'areas') return own;
  return layout.slots[index] ?? own;
}

function containerRule(size: ContainerSize, body: string): string {
  if (size === 'phone') return body;
  return `@container page (min-width: ${BREAKPOINT[size]}px) {\n${body}}\n`;
}

/** Generate grid CSS from the typed maps. Written to dist at build time. */
export function generateLayoutCss(): string {
  let css = '/* Generated by scripts/build.ts from src/lib/layouts.ts. Do not edit. */\n';
  for (const size of CONTAINER_SIZES) {
    let body = `.spread__grid { grid-template-columns: repeat(${COLUMNS[size]}, minmax(0, 1fr)); }\n`;
    for (const [span, [cols, rows]] of Object.entries(SPAN_SIZE[size]) as [Span, readonly [number, number]][]) {
      body += `.spread__grid[data-flow] > [data-span="${span}"] { grid-column: span ${cols}; grid-row: span ${rows}; }\n`;
    }
    for (const [name, layout] of Object.entries(LAYOUTS) as [LayoutName, Layout][]) {
      if (layout.kind !== 'areas') continue;
      const rows = layout.areas[size].map((r) => `"${r}"`).join(' ');
      body += `.spread__grid[data-layout="${name}"]:not([data-lean]) { grid-template-areas: ${rows}; grid-template-rows: repeat(${layout.areas[size].length}, minmax(var(--row), auto)); }\n`;
      layout.slots.forEach((_, i) => {
        body += `.spread__grid[data-layout="${name}"]:not([data-lean]) > :nth-child(${i + 1}) { grid-area: ${AREA_NAMES[i]}; }\n`;
      });
    }
    if (size === 'desktop') {
      const [stepCols] = SPAN_SIZE[size].s;
      for (let step = 0; step < 4; step++) {
        body += `.spread__grid[data-layout="stair"] > [data-step-start="${step}"] { grid-column: ${step + 1} / span ${stepCols}; }\n`;
      }
    }
    const [leanCols] = SPAN_SIZE[size].s;
    body += `.spread__grid[data-lean] > * { grid-area: auto; grid-column: span ${leanCols}; grid-row: span 1; }\n`;
    body += `.spread__grid[data-lean] > [data-focused] { grid-column: 1 / -1; grid-row: span ${SPAN_SIZE[size].xl[1]}; }\n`;
    css += containerRule(size, body);
  }
  return css;
}
