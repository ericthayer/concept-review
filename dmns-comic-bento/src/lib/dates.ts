/**
 * Date logic for notices, exhibition labels and the open/closed state.
 * All functions are pure: "now" is always passed in.
 */

/** ISO calendar date, YYYY-MM-DD */
export type IsoDate = string;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

/** Calendar date of an instant in a time zone, as YYYY-MM-DD. */
export function dateInZone(instant: Date, timeZone: string): IsoDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export type NoticeSeverity = 'closure' | 'advisory';

export interface DatedNotice {
  readonly id: string;
  readonly start: IsoDate;
  readonly end: IsoDate;
  readonly severity: NoticeSeverity;
}

/** A notice is expired once its end date is strictly before today. */
export function isExpired(notice: DatedNotice, today: IsoDate): boolean {
  return notice.end < today;
}

export function isInEffect(notice: DatedNotice, today: IsoDate): boolean {
  return notice.start <= today && today <= notice.end;
}

/** Drop expired notices. Used at build time so they never reach dist. */
export function liveNotices<T extends DatedNotice>(notices: readonly T[], today: IsoDate): T[] {
  return notices.filter((n) => !isExpired(n, today));
}

const SEVERITY_RANK: Readonly<Record<NoticeSeverity, number>> = { closure: 0, advisory: 1 };

/**
 * Most urgent notice: in-effect before upcoming, closures before advisories,
 * then soonest start. Expired notices are never returned.
 */
export function mostUrgentNotice<T extends DatedNotice>(notices: readonly T[], today: IsoDate): T | null {
  const live = liveNotices(notices, today);
  live.sort((a, b) => {
    const ea = isInEffect(a, today) ? 0 : 1;
    const eb = isInEffect(b, today) ? 0 : 1;
    if (ea !== eb) return ea - eb;
    const sa = SEVERITY_RANK[a.severity];
    const sb = SEVERITY_RANK[b.severity];
    if (sa !== sb) return sa - sb;
    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
  });
  return live[0] ?? null;
}

const MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

/** AP-style date label, e.g. "Oct. 16, 2026". */
export function formatApDate(date: IsoDate): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}

export type ExhibitionPhase = 'upcoming' | 'open' | 'closed';

export function exhibitionPhase(opens: IsoDate | null, closes: IsoDate | null, today: IsoDate): ExhibitionPhase {
  if (opens && today < opens) return 'upcoming';
  if (closes && today > closes) return 'closed';
  return 'open';
}

export interface Hours {
  /** 24h "HH:MM" */
  readonly open: string;
  readonly close: string;
  /** Late close that applies on most Fridays (not all), so it is never asserted. */
  readonly fridayLateClose: string | null;
  /** "MM-DD" dates the museum is closed every year */
  readonly closedDates: readonly string[];
  readonly timeZone: string;
}

export type OpenState =
  | { readonly kind: 'open'; readonly until: string }
  | { readonly kind: 'friday-late'; readonly until: string }
  | { readonly kind: 'before-open'; readonly opens: string }
  | { readonly kind: 'closed-day' }
  | { readonly kind: 'after-close' };

function zonedParts(instant: Date, timeZone: string): { mmdd: string; minutes: number; weekday: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '';
  return {
    mmdd: `${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    weekday: get('weekday'),
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function openState(hours: Hours, now: Date): OpenState {
  const { mmdd, minutes, weekday } = zonedParts(now, hours.timeZone);
  if (hours.closedDates.includes(mmdd)) return { kind: 'closed-day' };
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  if (minutes < open) return { kind: 'before-open', opens: hours.open };
  if (minutes < close) return { kind: 'open', until: hours.close };
  if (weekday === 'Fri' && hours.fridayLateClose && minutes < toMinutes(hours.fridayLateClose)) {
    return { kind: 'friday-late', until: hours.fridayLateClose };
  }
  return { kind: 'after-close' };
}

/** "17:00" → "5 p.m." */
export function formatClock(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'p.m.' : 'a.m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function describeOpenState(state: OpenState): string {
  switch (state.kind) {
    case 'open':
      return `Open now until ${formatClock(state.until)}`;
    case 'friday-late':
      return `Most Fridays open until ${formatClock(state.until)}. Check today’s schedule.`;
    case 'before-open':
      return `Opens today at ${formatClock(state.opens)}`;
    case 'closed-day':
      return 'Closed today';
    case 'after-close':
      return 'Closed now';
  }
}
