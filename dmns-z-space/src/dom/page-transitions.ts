/**
 * Cross-document z-space wiring (§3.1). The outgoing page resolves the move from building
 * coordinates in `pageswap`; the incoming page replays it in `pagereveal`. Dynamic
 * view-transition-names exist only for the duration of one transition.
 */
import { morphKeyFor, normalizePath, positionFor, unpackRouteTable, type RouteTable, type TransitionType } from '../lib/coordinates.js';
import { readStillness } from '../lib/motion.js';
import { resolveTransition } from '../lib/resolve-transition.js';
import { safeStorage, sessionStore } from './storage.js';

const STORE_PREFIX = 'dmns:vt:';
const CLICK_TTL_MS = 4000;

/** What the outgoing page hands to the incoming one, keyed by destination path. */
export interface StoredTransition {
  readonly type: TransitionType;
  readonly extra: readonly string[];
  readonly originX: number | null;
  readonly originY: number | null;
  readonly morph: string | null;
}

type WindowWithNavigation = Window & { readonly navigation?: { readonly activation: NavigationActivation | null } };

interface Activation {
  readonly x: number;
  readonly y: number;
  readonly at: number;
}

let lastActivation: Activation | null = null;
let running: ViewTransition | null = null;
const named = new Set<HTMLElement>();

export function readRouteTable(doc: Document = document): RouteTable {
  const json = doc.getElementById('dmns-routes')?.textContent;
  return json ? unpackRouteTable(json) : new Map();
}

/** Theatrical motion is off under reduced motion or Stillness; only a calm crossfade runs. */
export function isCalm(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || readStillness(safeStorage());
}

function rememberActivation(event: Event): void {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link) return;
  const rect = link.getBoundingClientRect();
  lastActivation = { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2), at: performance.now() };
  // A second navigation mid-transition skips the running one rather than queueing behind it.
  running?.skipTransition();
}

function setOrigin(x: number | null, y: number | null): void {
  const style = document.documentElement.style;
  if (x === null || y === null) return;
  style.setProperty('--vt-origin-x', `${x}px`);
  style.setProperty('--vt-origin-y', `${y}px`);
}

function clearOrigin(): void {
  document.documentElement.style.removeProperty('--vt-origin-x');
  document.documentElement.style.removeProperty('--vt-origin-y');
}

/** Name the shared image + title for this key, if both live on this page and are rendered. */
export function nameMorph(key: string): boolean {
  const image = document.querySelector<HTMLElement>(`[data-morph="${CSS.escape(key)}"]`);
  const title = document.querySelector<HTMLElement>(`[data-morph-title="${CSS.escape(key)}"]`);
  if (!image || image.getClientRects().length === 0) return false;
  image.style.setProperty('view-transition-name', key);
  image.style.setProperty('view-transition-class', 'hall-door');
  named.add(image);
  if (title && title.getClientRects().length > 0) {
    title.style.setProperty('view-transition-name', `${key}-title`);
    title.style.setProperty('view-transition-class', 'hall-door-title');
    named.add(title);
  }
  return true;
}

export function clearNames(): void {
  for (const el of named) {
    el.style.removeProperty('view-transition-name');
    el.style.removeProperty('view-transition-class');
  }
  named.clear();
}

/** Morphs only accompany a depth change: entering takes the destination's key, exiting the source's. */
function morphKeyForMove(type: TransitionType, from: string, to: string): string | null {
  if (type === 'enter') return morphKeyFor(to);
  if (type === 'exit') return morphKeyFor(from);
  return null;
}

function extraTypes(table: RouteTable, to: string, type: TransitionType): string[] {
  return type === 'enter' && positionFor(table, to)?.wing === 'sealed' ? ['sealed'] : [];
}

function finish(transition: ViewTransition): void {
  running = transition;
  transition.finished
    .finally(() => {
      if (running === transition) running = null;
      clearNames();
      clearOrigin();
    })
    .catch(() => undefined);
}

function onPageSwap(table: RouteTable, event: PageSwapEvent): void {
  const transition = event.viewTransition;
  const entry = event.activation?.entry;
  if (!transition || !entry?.url) return;
  const destination = new URL(entry.url);
  if (destination.origin !== location.origin) return;
  const from = normalizePath(location.pathname);
  const to = normalizePath(destination.pathname);
  const fromPos = positionFor(table, from);
  const toPos = positionFor(table, to);
  if (!fromPos || !toPos) return;

  const type = resolveTransition(fromPos, toPos);
  if (type === 'reload') {
    transition.skipTransition();
    return;
  }
  const extra = extraTypes(table, to, type);
  const fresh = lastActivation && performance.now() - lastActivation.at < CLICK_TTL_MS && event.activation?.navigationType !== 'traverse';
  const origin = fresh && lastActivation ? lastActivation : null;
  const calm = isCalm();
  const morph = calm ? null : morphKeyForMove(type, from, to);
  const morphed = morph ? nameMorph(morph) : false;

  for (const t of [type, ...extra]) transition.types.add(t);
  setOrigin(origin?.x ?? null, origin?.y ?? null);
  const stored: StoredTransition = { type, extra, originX: origin?.x ?? null, originY: origin?.y ?? null, morph: morphed ? morph : null };
  try {
    sessionStore()?.setItem(STORE_PREFIX + to, JSON.stringify(stored));
  } catch {
    // Storage blocked: the incoming page recomputes the type from navigation.activation.
  }
  lastActivation = null;
  finish(transition);
}

function readStored(path: string): StoredTransition | null {
  try {
    const store = sessionStore();
    const raw = store?.getItem(STORE_PREFIX + path);
    store?.removeItem(STORE_PREFIX + path);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredTransition>;
    return typeof parsed.type === 'string' ? (parsed as StoredTransition) : null;
  } catch {
    return null;
  }
}

function onPageReveal(table: RouteTable, event: PageRevealEvent): void {
  const transition = event.viewTransition;
  if (!transition) return;
  const to = normalizePath(location.pathname);
  let stored = readStored(to);
  if (!stored) {
    const fromUrl = (window as WindowWithNavigation).navigation?.activation?.from?.url;
    const fromPos = fromUrl ? positionFor(table, fromUrl) : undefined;
    const toPos = positionFor(table, to);
    if (!fromUrl || !fromPos || !toPos) return;
    const type = resolveTransition(fromPos, toPos);
    stored = { type, extra: extraTypes(table, to, type), originX: null, originY: null, morph: isCalm() ? null : morphKeyForMove(type, normalizePath(fromUrl), to) };
  }
  if (stored.type === 'reload') {
    transition.skipTransition();
    return;
  }
  for (const t of [stored.type, ...stored.extra]) transition.types.add(t);
  setOrigin(stored.originX, stored.originY);
  if (stored.morph && !isCalm()) nameMorph(stored.morph);
  finish(transition);
}

export function wireCrossDocument(table: RouteTable = readRouteTable()): void {
  if (!('onpagereveal' in window)) return;
  document.addEventListener('click', rememberActivation, { capture: true });
  window.addEventListener('pageswap', (event) => onPageSwap(table, event));
  window.addEventListener('pagereveal', (event) => onPageReveal(table, event));
  // Back/forward cache restores the old page as it was at swap time: drop any leftover names.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      clearNames();
      clearOrigin();
    }
  });
}
