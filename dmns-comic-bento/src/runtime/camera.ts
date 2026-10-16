/**
 * Cross-document camera (step 5). The build inlines these two functions into
 * <head> as a classic script (Function#toString after type stripping), so the
 * pagereveal listener exists before the first render and the camera works even
 * if site modules fail to load.
 *
 * Both functions must stay self-contained: no imports and no module-scope
 * references except cameraMoveFromWire, which is inlined alongside.
 * tests/unit/camera.test.ts holds cameraMoveFromWire to resolveCameraMove.
 */

/** One book-map row: [path, issueIndex, depth, order] (see encodeBook). */
export type WireRow = readonly [string, number, number, number];

export function cameraMoveFromWire(from: WireRow, to: WireRow): string {
  if (from[0] === to[0]) return 'none';
  if (from[2] === to[2]) {
    if (from[1] !== to[1]) return 'new-issue';
    if (to[3] > from[3]) return 'turn-next';
    if (to[3] < from[3]) return 'turn-prev';
    return 'none';
  }
  return to[2] > from[2] ? 'zoom-in' : 'zoom-out';
}

export function installCamera(): void {
  const root = document.documentElement;
  const named: HTMLElement[] = [];
  let active: ViewTransition | null = null;
  /* Navigation API: typed locally, lib.dom does not declare window.navigation yet. */
  type Nav = EventTarget & { readonly activation: { readonly from: { readonly url: string | null } | null } | null };
  const nav = (window as Window & { navigation?: Nav }).navigation ?? null;

  const pathOf = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const u = new URL(url, location.href);
      if (u.origin !== location.origin) return null;
      const p = u.pathname.replace(/index\.html$/, '');
      return p.endsWith('/') ? p : `${p}/`;
    } catch {
      return null;
    }
  };

  const rowFor = (path: string | null): WireRow | null => {
    if (!path) return null;
    let rows: unknown = null;
    try {
      rows = JSON.parse(document.getElementById('book-map')?.textContent ?? 'null');
    } catch {
      return null;
    }
    if (!Array.isArray(rows)) return null;
    for (const r of rows) if (Array.isArray(r) && r[0] === path) return r as unknown as WireRow;
    return null;
  };

  const moveFor = (fromPath: string | null, toPath: string | null): string => {
    const a = rowFor(fromPath);
    const b = rowFor(toPath);
    return a && b ? cameraMoveFromWire(a, b) : 'none';
  };

  const calm = (): boolean => root.hasAttribute('data-still') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  const name = (el: Element | null | undefined, n: string): void => {
    if (!(el instanceof HTMLElement)) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.bottom <= 0 || r.top >= innerHeight) return;
    el.style.viewTransitionName = n;
    named.push(el);
  };

  const clear = (): void => {
    for (const el of named.splice(0)) el.style.viewTransitionName = '';
  };

  /** Zoom pairs a panel on the shallow page with the splash on the deep page. */
  const nameHero = (move: string, outgoing: boolean, otherPath: string): void => {
    if ((move === 'zoom-in') === outgoing) {
      for (const a of document.querySelectorAll<HTMLAnchorElement>('a.panel__link')) {
        if (pathOf(a.href) !== otherPath) continue;
        const panel = a.closest('dmns-panel');
        name(panel, 'hero-panel');
        name(panel?.querySelector('h2, h3'), 'hero-title');
        return;
      }
    } else {
      name(document.querySelector('#splash .splash__panel'), 'hero-panel');
      name(document.querySelector('#splash h1'), 'hero-title');
    }
  };

  const isZoom = (move: string): boolean => move === 'zoom-in' || move === 'zoom-out';

  /** Step 7: the on-screen Specimen hops between pages. Never on documentary pages. */
  const nameSpecimen = (): void => {
    if (document.querySelector('[data-documentary]')) return;
    for (const el of document.querySelectorAll('dmns-specimen')) {
      const before = named.length;
      name(el, 'specimen');
      if (named.length > before) return;
    }
  };

  /** Names on both sides of a move (hero pair, traveler). */
  const nameFor = (kind: string, outgoing: boolean, otherPath: string): void => {
    if (kind === 'calm') return;
    if (isZoom(kind)) nameHero(kind, outgoing, otherPath);
    nameSpecimen();
  };

  addEventListener('pageswap', (event: PageSwapEvent) => {
    const vt = event.viewTransition;
    const dest = pathOf(event.activation?.entry?.url);
    if (!vt || !dest) return;
    const move = moveFor(pathOf(location.href), dest);
    if (move === 'none') return;
    const kind = calm() ? 'calm' : move;
    vt.types.add(kind);
    nameFor(kind, true, dest);
  });

  addEventListener('pageshow', clear);

  addEventListener('pagereveal', (event: PageRevealEvent) => {
    clear();
    const vt = event.viewTransition;
    if (!vt) return;
    const from = pathOf(nav?.activation?.from?.url);
    const move = moveFor(from, pathOf(location.href));
    if (move === 'none' || !from) return;
    const kind = calm() ? 'calm' : move;
    vt.types.add(kind);
    root.dataset['camera'] = kind;
    nameFor(kind, false, from);
    root.dataset['cameraNames'] = named.map((el) => el.style.viewTransitionName).join(' ');
    active = vt;
    vt.finished.finally(() => {
      clear();
      active = null;
    });
  });

  /* A new navigation mid-move finishes the current one at once. */
  nav?.addEventListener('navigate', () => active?.skipTransition());
}

/** Classic-script source for <head>. Types are already stripped at build time. */
export function cameraScript(): string {
  return `(function(){${String(cameraMoveFromWire)}(${String(installCamera)})();})();`.replace(/\n\s*/g, '\n');
}
