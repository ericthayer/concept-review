import type { RoutePosition, TransitionType } from './coordinates.js';

/** True when either room opens onto the other's floor (see RoutePosition.spans). */
export function sharesFloor(a: RoutePosition, b: RoutePosition): boolean {
  return a.floor === b.floor || (a.spans?.includes(b.floor) ?? false) || (b.spans?.includes(a.floor) ?? false);
}

/**
 * Pure: the transition between two positions in the building.
 * Precedence: same path → reload; floor change → ascend/descend;
 * depth change → enter/exit; otherwise lateral by corridor ordinal.
 */
export function resolveTransition(from: RoutePosition, to: RoutePosition): TransitionType {
  if (from.path === to.path) return 'reload';
  if (!sharesFloor(from, to)) return to.floor > from.floor ? 'ascend' : 'descend';
  if (to.depth !== from.depth) return to.depth > from.depth ? 'enter' : 'exit';
  return to.x < from.x ? 'lateral-l' : 'lateral-r';
}
