/**
 * The route table: one entry per prerendered page, each with its book position.
 */
import { ISSUE_INDEX_PATH, ISSUE_ORDER, type IssueId, type PagePosition } from './book.ts';
import { hallsInBookOrder, type Content } from './content.ts';

export type RouteKind =
  | { readonly kind: 'cover' }
  | { readonly kind: 'index'; readonly issue: Exclude<IssueId, 'cover'> }
  | { readonly kind: 'hall'; readonly slug: string }
  | { readonly kind: 'exhibition'; readonly slug: string }
  | { readonly kind: 'theater'; readonly slug: string };

export interface Route {
  readonly position: PagePosition;
  readonly page: RouteKind;
  /** Number of siblings at this depth within the issue (for the page counter). */
  readonly siblings: number;
}

export function buildRoutes(content: Content): Route[] {
  const routes: Route[] = [{ position: { path: '/', issue: 'cover', depth: 0, order: 0 }, page: { kind: 'cover' }, siblings: 1 }];
  const indexIssues = ISSUE_ORDER.filter((i): i is Exclude<IssueId, 'cover'> => i !== 'cover');
  indexIssues.forEach((issue, order) => {
    routes.push({ position: { path: ISSUE_INDEX_PATH[issue], issue, depth: 1, order }, page: { kind: 'index', issue }, siblings: indexIssues.length });
  });
  const halls = hallsInBookOrder(content.halls);
  halls.forEach((h, order) => {
    routes.push({ position: { path: `/halls/${h.slug}/`, issue: 'halls', depth: 2, order }, page: { kind: 'hall', slug: h.slug }, siblings: halls.length });
  });
  content.exhibitions.forEach((e, order) => {
    routes.push({
      position: { path: `/special-exhibitions/${e.slug}/`, issue: 'special', depth: 2, order },
      page: { kind: 'exhibition', slug: e.slug },
      siblings: content.exhibitions.length,
    });
  });
  content.theaters.forEach((t, order) => {
    routes.push({
      position: { path: `/theaters/${t.slug}/`, issue: 'theaters', depth: 2, order },
      page: { kind: 'theater', slug: t.slug },
      siblings: content.theaters.length,
    });
  });
  return routes;
}

/** Live dmns.org paths → new routes, for public/_redirects. */
export const LIVE_REDIRECTS: ReadonlyArray<readonly [string, string]> = [
  ['/exhibitions/permanent-exhibitions/', '/halls/'],
  ['/exhibitions/temporary-exhibitions/', '/special-exhibitions/'],
  ['/exhibitions/temporary-exhibitions/magical/', '/special-exhibitions/magical-winter-nights/'],
  ['/exhibitions/temporary-exhibitions/changing-landscapes-inside-venice-mesa-verde-and-rapa-nui/', '/special-exhibitions/changing-landscapes/'],
  ['/exhibitions/', '/halls/'],
  ['/films-and-shows/', '/theaters/'],
  ['/programs-and-events/', '/programs/'],
];
