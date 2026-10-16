/**
 * The museum as a coordinate system. Every route has a position in the building;
 * transitions are computed from the delta between two positions (see resolve-transition.ts).
 * Pure module: no DOM, no Node APIs.
 */
import type { Hall, WingId } from './content-types.js';

export type Floor = 0 | 1 | 2 | 3; // 0 = Plaza / outside, 1–3 = real museum floors
export type Depth = 0 | 1 | 2 | 3; // 0 = Atrium, 1 = Corridor/index, 2 = Hall, 3 = Object/detail
export type { WingId };

export interface RoutePosition {
  readonly path: string;
  readonly floor: Floor;
  readonly depth: Depth;
  /** Ordinal position along the corridor, for lateral moves. */
  readonly x: number;
  /** Drives accent color + minimap highlight. */
  readonly wing: WingId;
  /**
   * Floors this room opens onto besides its own. The Directory is one room that shows
   * floors 1–3, so walking from it into any hall is a step forward, not a stair ride.
   */
  readonly spans?: readonly Floor[];
}

export type TransitionType =
  | 'enter' // depth increases  → dolly forward through a doorway
  | 'exit' // depth decreases  → dolly backward, the room recedes
  | 'lateral-l' // same depth, x decreases → walk left along the corridor
  | 'lateral-r' // same depth, x increases → walk right
  | 'ascend' // floor increases  → vertical rise with parallax stair rails
  | 'descend' // floor decreases
  | 'reload'; // same path → no transition

export const TRANSITION_TYPES: readonly TransitionType[] = [
  'enter',
  'exit',
  'lateral-l',
  'lateral-r',
  'ascend',
  'descend',
  'reload',
];

export type RouteTable = ReadonlyMap<string, RoutePosition>;

export interface RouteSource {
  readonly halls: readonly Pick<Hall, 'slug' | 'floor' | 'wing'>[];
  readonly exhibitions: readonly { readonly slug: string }[];
  readonly theaters: readonly { readonly slug: string }[];
}

/** Floor used for transition math when DMNS has not confirmed a hall's floor. */
export const UNCONFIRMED_FLOOR: Floor = 1;

const DIRECTORY_SPAN: readonly Floor[] = [1, 2, 3];

/** Corridor order of the depth-1 rooms, per floor. */
const CORRIDOR: readonly (readonly [path: string, floor: Floor, wing: WingId])[] = [
  ['/halls/', 1, 'atrium'],
  ['/special-exhibitions/', 1, 'special'],
  ['/theaters/', 1, 'theaters'],
  ['/programs/', 1, 'editorial'],
  ['/learn/', 1, 'editorial'],
  ['/about/', 1, 'editorial'],
  ['/support/', 1, 'editorial'],
  ['/sturm-family-wing/', 0, 'plaza'],
  ['/visit/', 0, 'plaza'],
  ['/science/', 0, 'science'],
];

export function buildRouteTable(source: RouteSource): RouteTable {
  const table = new Map<string, RoutePosition>();
  const add = (position: RoutePosition): void => {
    if (table.has(position.path)) throw new Error(`Duplicate route ${position.path}`);
    table.set(position.path, position);
  };

  add({ path: '/', floor: 1, depth: 0, x: 0, wing: 'atrium' });

  const corridorX = new Map<Floor, number>();
  for (const [path, floor, wing] of CORRIDOR) {
    const x = corridorX.get(floor) ?? 0;
    corridorX.set(floor, x + 1);
    add(path === '/halls/' ? { path, floor, depth: 1, x, wing, spans: DIRECTORY_SPAN } : { path, floor, depth: 1, x, wing });
  }

  const hallX = new Map<Floor, number>();
  for (const hall of source.halls) {
    const floor = hall.floor ?? UNCONFIRMED_FLOOR;
    const x = hallX.get(floor) ?? 0;
    hallX.set(floor, x + 1);
    add({ path: `/halls/${hall.slug}/`, floor, depth: 2, x, wing: hall.wing });
  }

  source.exhibitions.forEach((exhibition, x) => {
    add({ path: `/special-exhibitions/${exhibition.slug}/`, floor: 1, depth: 2, x, wing: 'special' });
  });

  source.theaters.forEach((theater, x) => {
    add({ path: `/theaters/${theater.slug}/`, floor: 1, depth: 2, x, wing: 'theaters' });
  });

  return table;
}

/** Normalize a URL or pathname to a route-table key: leading and trailing slash, no query/hash. */
export function normalizePath(input: string): string {
  let path = input;
  const schemeIndex = path.indexOf('://');
  if (schemeIndex !== -1) {
    const slash = path.indexOf('/', schemeIndex + 3);
    path = slash === -1 ? '/' : path.slice(slash);
  }
  path = path.split('#')[0]?.split('?')[0] ?? '/';
  path = path.replace(/index\.html$/, '');
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.endsWith('/')) path = `${path}/`;
  return path.replace(/\/{2,}/g, '/');
}

export function positionFor(table: RouteTable, pathOrUrl: string): RoutePosition | undefined {
  return table.get(normalizePath(pathOrUrl));
}

/**
 * Shared-element key for a route: the `view-transition-name` stem the hero on that
 * page and its card on an index page both use. `hall-<slug>` / `exhibition-<slug>`.
 */
export function morphKeyFor(pathOrUrl: string): string | null {
  const match = /^\/(halls|special-exhibitions)\/([a-z0-9-]+)\/$/.exec(normalizePath(pathOrUrl));
  if (!match) return null;
  const [, section, slug] = match;
  return `${section === 'halls' ? 'hall' : 'exhibition'}-${slug}`;
}

type PackedPosition = readonly [floor: Floor, depth: Depth, x: number, wing: WingId, spans?: readonly Floor[]];

/** Compact JSON form embedded in each page for pageswap lookups. */
export function packRouteTable(table: RouteTable): string {
  const packed: Record<string, PackedPosition> = {};
  for (const [path, p] of table) packed[path] = p.spans ? [p.floor, p.depth, p.x, p.wing, p.spans] : [p.floor, p.depth, p.x, p.wing];
  return JSON.stringify(packed);
}

export function unpackRouteTable(json: string): RouteTable {
  const parsed: unknown = JSON.parse(json);
  const table = new Map<string, RoutePosition>();
  if (typeof parsed !== 'object' || parsed === null) return table;
  for (const [path, value] of Object.entries(parsed)) {
    if (!Array.isArray(value) || value.length < 4 || value.length > 5) continue;
    const [floor, depth, x, wing, spans] = value as unknown[];
    if (!isFloor(floor) || !isDepth(depth) || typeof x !== 'number' || typeof wing !== 'string') continue;
    if (Array.isArray(spans) && spans.every(isFloor)) {
      table.set(path, { path, floor, depth, x, wing: wing as WingId, spans });
    } else {
      table.set(path, { path, floor, depth, x, wing: wing as WingId });
    }
  }
  return table;
}

export function isFloor(value: unknown): value is Floor {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

export function isDepth(value: unknown): value is Depth {
  return value === 0 || value === 1 || value === 2 || value === 3;
}
