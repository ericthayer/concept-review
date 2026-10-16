/**
 * The book model: every route has a position, and the camera move between two
 * routes is computed from the delta between positions, never hand-wired.
 */

export type IssueId =
  | 'cover'
  | 'halls'
  | 'special'
  | 'theaters'
  | 'visit'
  | 'programs'
  | 'learn'
  | 'science'
  | 'about'
  | 'support';

/** 0 = Cover, 1 = Issue index page, 2 = Detail page */
export type Depth = 0 | 1 | 2;

export interface PagePosition {
  readonly path: string;
  readonly issue: IssueId;
  readonly depth: Depth;
  /** sibling order within an issue */
  readonly order: number;
}

export type CameraMove =
  | 'zoom-in'
  | 'zoom-out'
  | 'turn-next'
  | 'turn-prev'
  | 'new-issue'
  | 'none';

export const CAMERA_MOVES: readonly CameraMove[] = [
  'zoom-in',
  'zoom-out',
  'turn-next',
  'turn-prev',
  'new-issue',
  'none',
];

/** Issue order doubles as the "Issue n of N" counter and depth-1 sibling order. */
export const ISSUE_ORDER: readonly IssueId[] = [
  'cover',
  'halls',
  'special',
  'theaters',
  'visit',
  'programs',
  'learn',
  'science',
  'about',
  'support',
];

export const ISSUE_INDEX_PATH: Readonly<Record<IssueId, string>> = {
  cover: '/',
  halls: '/halls/',
  special: '/special-exhibitions/',
  theaters: '/theaters/',
  visit: '/visit/',
  programs: '/programs/',
  learn: '/learn/',
  science: '/science/',
  about: '/about/',
  support: '/support/',
};

/** Literal museum names for wayfinding (nav, <title>, page counter). */
export const ISSUE_LABEL: Readonly<Record<IssueId, string>> = {
  cover: 'Home',
  halls: 'Halls',
  special: 'Special Exhibitions',
  theaters: 'Theaters',
  visit: 'Visit',
  programs: 'Programs',
  learn: 'School Programs',
  science: 'Science',
  about: 'About',
  support: 'Support',
};

/**
 * Resolve the camera move between two positions.
 * Rules: same path → none. Issue change wins when depth is equal (new-issue);
 * otherwise depth wins (zoom). Same issue and depth turns the page by order.
 */
export function resolveCameraMove(from: PagePosition, to: PagePosition): CameraMove {
  if (from.path === to.path) return 'none';
  if (from.depth === to.depth) {
    if (from.issue !== to.issue) return 'new-issue';
    if (to.order > from.order) return 'turn-next';
    if (to.order < from.order) return 'turn-prev';
    return 'none';
  }
  return to.depth > from.depth ? 'zoom-in' : 'zoom-out';
}

/** Normalise a pathname to the trailing-slash route form used as book keys. */
export function normalisePath(pathname: string): string {
  let p = pathname.replace(/index\.html$/, '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

export type BookMap = ReadonlyMap<string, PagePosition>;

export function createBookMap(positions: readonly PagePosition[]): BookMap {
  const map = new Map<string, PagePosition>();
  for (const pos of positions) {
    const key = normalisePath(pos.path);
    if (map.has(key)) throw new Error(`Duplicate book path: ${key}`);
    map.set(key, pos);
  }
  return map;
}

/** Look up two paths and resolve; unknown paths yield 'none'. */
export function moveBetween(book: BookMap, fromPath: string, toPath: string): CameraMove {
  const from = book.get(normalisePath(fromPath));
  const to = book.get(normalisePath(toPath));
  if (!from || !to) return 'none';
  return resolveCameraMove(from, to);
}

/** Compact wire format inlined into each page: [path, issueIndex, depth, order][] */
export type BookWire = ReadonlyArray<readonly [string, number, Depth, number]>;

export function encodeBook(positions: readonly PagePosition[]): BookWire {
  return positions.map((p) => [p.path, ISSUE_ORDER.indexOf(p.issue), p.depth, p.order] as const);
}

export function decodeBook(wire: unknown): PagePosition[] {
  if (!Array.isArray(wire)) return [];
  const out: PagePosition[] = [];
  for (const row of wire) {
    if (!Array.isArray(row) || row.length !== 4) continue;
    const [path, issueIndex, depth, order] = row as unknown[];
    const issue = typeof issueIndex === 'number' ? ISSUE_ORDER[issueIndex] : undefined;
    if (typeof path !== 'string' || !issue || typeof order !== 'number') continue;
    if (depth !== 0 && depth !== 1 && depth !== 2) continue;
    out.push({ path, issue, depth, order });
  }
  return out;
}

/** "Halls · Page 2 of 4" style counter text. */
export function pageCounter(pos: PagePosition, siblings: number): string {
  if (pos.depth === 0) return 'The Cover';
  const label = ISSUE_LABEL[pos.issue];
  if (pos.depth === 1) {
    const n = ISSUE_ORDER.indexOf(pos.issue);
    return `${label} · Issue ${n} of ${ISSUE_ORDER.length - 1}`;
  }
  return `${label} · Page ${pos.order + 1} of ${siblings}`;
}
