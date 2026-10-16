/** Per-build and per-page render context. Build-time only. */
import type { BookMap, PagePosition } from '../lib/book.ts';
import type { Content, Notice } from '../lib/content.ts';
import type { IsoDate } from '../lib/dates.ts';
import type { Route } from '../lib/routes.ts';

export interface SiteContext {
  readonly content: Content;
  readonly routes: readonly Route[];
  readonly book: BookMap;
  /** Build date in museum time; notices expire against it. */
  readonly today: IsoDate;
  /** Non-expired notices only. */
  readonly notices: readonly Notice[];
  readonly urgentNotice: Notice | null;
}

export interface PageContext extends SiteContext {
  readonly route: Route;
  readonly position: PagePosition;
  /** Art figure ids used on this page; the page sprite inlines exactly these. */
  readonly art: Set<string>;
}

export function pageContext(site: SiteContext, route: Route): PageContext {
  return { ...site, route, position: route.position, art: new Set<string>() };
}
