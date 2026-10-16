import type { Content, IsoDate } from '../lib/content-types.js';
import type { RoutePosition, RouteTable } from '../lib/coordinates.js';

/** Everything a page renderer needs. Built once per build. */
export interface BuildContext {
  readonly content: Content;
  readonly routes: RouteTable;
  readonly today: IsoDate;
  readonly packedRoutes: string;
  readonly assets: { readonly css: string; readonly js: string };
}

export interface PageMeta {
  readonly path: string;
  /** Route used for the building position when it differs from path (the 404 page). */
  readonly positionPath?: string;
  readonly title: string;
  readonly description: string;
  /** Room name shown in the minimap chip. */
  readonly room: string;
  readonly bodyClass?: string;
  /** Element id the browser should parse before first render (hall heroes). */
  readonly expect?: string;
}

export function positionOf(ctx: BuildContext, path: string): RoutePosition {
  const position = ctx.routes.get(path);
  if (!position) throw new Error(`No route position for ${path}`);
  return position;
}
