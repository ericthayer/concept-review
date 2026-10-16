import type { Exhibition, IsoDate, Notice } from './content-types.js';

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string') return false;
  const match = ISO.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Calendar date in America/Denver, the museum's local day. */
export function museumToday(now: Date = new Date()): IsoDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  if (!isIsoDate(parts)) throw new Error(`Could not compute museum date from ${parts}`);
  return parts;
}

/** ISO dates compare correctly as strings. */
export function compareIso(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isNoticeExpired(notice: Notice, today: IsoDate): boolean {
  return compareIso(notice.end, today) < 0;
}

export function isNoticeActive(notice: Notice, today: IsoDate): boolean {
  return compareIso(notice.start, today) <= 0 && !isNoticeExpired(notice, today);
}

export function activeNotices(notices: readonly Notice[], today: IsoDate): Notice[] {
  return notices.filter((notice) => isNoticeActive(notice, today));
}

export type ExhibitionPhase = 'now' | 'coming' | 'closed';

export function exhibitionPhase(exhibition: Pick<Exhibition, 'opens' | 'closes'>, today: IsoDate): ExhibitionPhase {
  if (exhibition.closes && compareIso(exhibition.closes, today) < 0) return 'closed';
  if (exhibition.opens && compareIso(exhibition.opens, today) > 0) return 'coming';
  return 'now';
}
