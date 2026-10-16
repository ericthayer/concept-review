/**
 * Validating content loaders. Pure: callers hand in parsed JSON.
 * Every rendered fact must trace to content/*.json; missing copy is null and
 * renders as a visibly marked "TODO: confirm with DMNS" placeholder.
 */
import { isIsoDate, type IsoDate } from './dates.ts';
import {
  FLOORS,
  LAYOUT_NAMES,
  MOODS,
  POP_COLORS,
  POSES,
  PROGRAM_CATEGORIES,
  type Content,
  type EventItem,
  type Exhibition,
  type FloorId,
  type Hall,
  type Link,
  type MediaItem,
  type Notice,
  type Site,
  type SpreadScript,
  type Theater,
} from './content-types.ts';

export * from './content-types.ts';

/* ---------- validation helpers ---------- */

type Obj = Readonly<Record<string, unknown>>;

export class ContentError extends Error {}

function obj(v: unknown, where: string): Obj {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ContentError(`${where}: expected object`);
  return v as Obj;
}
function arr(v: unknown, where: string): readonly unknown[] {
  if (!Array.isArray(v)) throw new ContentError(`${where}: expected array`);
  return v;
}
function str(o: Obj, k: string, where: string): string {
  const v = o[k];
  if (typeof v !== 'string' || v.length === 0) throw new ContentError(`${where}.${k}: expected non-empty string`);
  return v;
}
function strOrNull(o: Obj, k: string, where: string): string | null {
  const v = o[k];
  if (v === null) return null;
  return str(o, k, where);
}
function bool(o: Obj, k: string, where: string): boolean {
  const v = o[k];
  if (typeof v !== 'boolean') throw new ContentError(`${where}.${k}: expected boolean`);
  return v;
}
function oneOf<T extends string>(o: Obj, k: string, allowed: readonly T[], where: string): T {
  const v = o[k];
  if (typeof v !== 'string' || !(allowed as readonly string[]).includes(v)) {
    throw new ContentError(`${where}.${k}: expected one of ${allowed.join(', ')}`);
  }
  return v as T;
}
function oneOfOrNull<T extends string>(o: Obj, k: string, allowed: readonly T[], where: string): T | null {
  return o[k] === null ? null : oneOf(o, k, allowed, where);
}
function date(o: Obj, k: string, where: string): IsoDate {
  const v = o[k];
  if (!isIsoDate(v)) throw new ContentError(`${where}.${k}: expected YYYY-MM-DD`);
  return v;
}
function dateOrNull(o: Obj, k: string, where: string): IsoDate | null {
  return o[k] === null ? null : date(o, k, where);
}
function links(v: unknown, where: string): Link[] {
  return arr(v, where).map((item, i) => {
    const o = obj(item, `${where}[${i}]`);
    return { label: str(o, 'label', where), url: str(o, 'url', where) };
  });
}
function uniqueSlugs<T extends { readonly slug: string }>(items: T[], where: string): T[] {
  const seen = new Set<string>();
  for (const item of items) {
    if (!/^[a-z0-9-]+$/.test(item.slug)) throw new ContentError(`${where}: bad slug ${item.slug}`);
    if (seen.has(item.slug)) throw new ContentError(`${where}: duplicate slug ${item.slug}`);
    seen.add(item.slug);
  }
  return items;
}

/* ---------- loaders ---------- */

export function parseHalls(raw: unknown): Hall[] {
  const halls = arr(raw, 'halls').map((item, i): Hall => {
    const w = `halls[${i}]`;
    const o = obj(item, w);
    const mood = oneOf(o, 'mood', MOODS, w);
    const pose = oneOfOrNull(o, 'pose', POSES, w);
    if (mood === 'documentary' && pose !== null) throw new ContentError(`${w}: documentary halls never carry Specimen`);
    return {
      slug: str(o, 'slug', w),
      name: str(o, 'name', w),
      floors: arr(o['floors'], `${w}.floors`).map((f) => {
        if (typeof f !== 'string' || !(FLOORS as readonly string[]).includes(f)) throw new ContentError(`${w}.floors: bad floor`);
        return f as FloorId;
      }),
      floorLabel: str(o, 'floorLabel', w),
      description: str(o, 'description', w),
      descriptionIsQuote: bool(o, 'descriptionIsQuote', w),
      mood,
      pop: oneOfOrNull(o, 'pop', POP_COLORS, w),
      pose,
      art: str(o, 'art', w),
    };
  });
  return uniqueSlugs(halls, 'halls');
}

export function parseExhibitions(raw: unknown): Exhibition[] {
  const items = arr(raw, 'exhibitions').map((item, i): Exhibition => {
    const w = `exhibitions[${i}]`;
    const o = obj(item, w);
    return {
      slug: str(o, 'slug', w),
      name: str(o, 'name', w),
      shortName: str(o, 'shortName', w),
      kind: oneOf(o, 'kind', ['exhibition', 'event'] as const, w),
      opens: dateOrNull(o, 'opens', w),
      closes: dateOrNull(o, 'closes', w),
      dateLabel: str(o, 'dateLabel', w),
      description: strOrNull(o, 'description', w),
      mood: oneOf(o, 'mood', MOODS, w),
      pop: oneOfOrNull(o, 'pop', POP_COLORS, w),
      art: str(o, 'art', w),
      liveUrl: str(o, 'liveUrl', w),
      ticketsUrl: strOrNull(o, 'ticketsUrl', w),
      noImagery: bool(o, 'noImagery', w),
    };
  });
  return uniqueSlugs(items, 'exhibitions');
}

export function parseTheaters(raw: unknown): Theater[] {
  const items = arr(raw, 'theaters').map((item, i): Theater => {
    const w = `theaters[${i}]`;
    const o = obj(item, w);
    return {
      slug: str(o, 'slug', w),
      name: str(o, 'name', w),
      description: strOrNull(o, 'description', w),
      ticketsUrl: str(o, 'ticketsUrl', w),
      pop: oneOf(o, 'pop', POP_COLORS, w),
      art: str(o, 'art', w),
    };
  });
  return uniqueSlugs(items, 'theaters');
}

export function parseEvents(raw: unknown): EventItem[] {
  return arr(raw, 'events').map((item, i): EventItem => {
    const w = `events[${i}]`;
    const o = obj(item, w);
    return {
      id: str(o, 'id', w),
      title: str(o, 'title', w),
      date: dateOrNull(o, 'date', w),
      category: oneOf(o, 'category', PROGRAM_CATEGORIES, w),
      url: strOrNull(o, 'url', w),
      todo: bool(o, 'todo', w),
    };
  });
}

export function parseNotices(raw: unknown): Notice[] {
  return arr(raw, 'notices').map((item, i): Notice => {
    const w = `notices[${i}]`;
    const o = obj(item, w);
    const start = date(o, 'start', w);
    const end = date(o, 'end', w);
    if (end < start) throw new ContentError(`${w}: end before start`);
    return {
      id: str(o, 'id', w),
      title: str(o, 'title', w),
      hall: strOrNull(o, 'hall', w),
      start,
      end,
      severity: oneOf(o, 'severity', ['closure', 'advisory'] as const, w),
    };
  });
}

export function parseMedia(raw: unknown): MediaItem[] {
  const o = obj(raw, 'media');
  return arr(o['items'], 'media.items').map((item, i): MediaItem => {
    const w = `media.items[${i}]`;
    const m = obj(item, w);
    return { src: str(m, 'src', w), alt: str(m, 'alt', w), credit: str(m, 'credit', w), placeholder: bool(m, 'placeholder', w) };
  });
}

export function parseSpreads(raw: unknown, where: string): SpreadScript[] {
  const o = obj(raw, where);
  return arr(o['spreads'], `${where}.spreads`).map((item, i): SpreadScript => {
    const w = `${where}.spreads[${i}]`;
    const s = obj(item, w);
    return { id: str(s, 'id', w), kicker: str(s, 'kicker', w), heading: str(s, 'heading', w), layout: oneOf(s, 'layout', LAYOUT_NAMES, w) };
  });
}

export function parseSite(raw: unknown): Site {
  const o = obj(raw, 'site');
  const address = obj(o['address'], 'site.address');
  const hours = obj(o['hours'], 'site.hours');
  const outbound = obj(o['outbound'], 'site.outbound');
  const sturm = obj(o['sturmWing'], 'site.sturmWing');
  const footer = obj(o['footer'], 'site.footer');
  const outboundKeys = ['tickets', 'membership', 'donate', 'login', 'search', 'catalyst', 'digitalCollections'] as const;
  return {
    name: str(o, 'name', 'site'),
    shortName: str(o, 'shortName', 'site'),
    liveOrigin: str(o, 'liveOrigin', 'site'),
    sourceDate: date(o, 'sourceDate', 'site'),
    address: {
      street: str(address, 'street', 'site.address'),
      city: str(address, 'city', 'site.address'),
      region: str(address, 'region', 'site.address'),
      postal: str(address, 'postal', 'site.address'),
    },
    hours: {
      open: str(hours, 'open', 'site.hours'),
      close: str(hours, 'close', 'site.hours'),
      fridayLateClose: str(hours, 'fridayLateClose', 'site.hours'),
      closedDates: arr(hours['closedDates'], 'site.hours.closedDates').map((d) => String(d)),
      timeZone: str(hours, 'timeZone', 'site.hours'),
      summary: str(hours, 'summary', 'site.hours'),
      fridaySummary: str(hours, 'fridaySummary', 'site.hours'),
      closedSummary: str(hours, 'closedSummary', 'site.hours'),
    },
    outbound: Object.fromEntries(outboundKeys.map((k) => [k, str(outbound, k, 'site.outbound')])) as Site['outbound'],
    visitLinks: links(o['visitLinks'], 'site.visitLinks'),
    sturmWing: {
      tagline: str(sturm, 'tagline', 'site.sturmWing'),
      spaces: arr(sturm['spaces'], 'site.sturmWing.spaces').map((s, i) => {
        const so = obj(s, `site.sturmWing.spaces[${i}]`);
        return { name: str(so, 'name', 'sturm'), detail: str(so, 'detail', 'sturm') };
      }),
    },
    programLinks: arr(o['programLinks'], 'site.programLinks').map((item, i) => {
      const p = obj(item, `site.programLinks[${i}]`);
      return { label: str(p, 'label', 'program'), url: str(p, 'url', 'program'), category: oneOf(p, 'category', PROGRAM_CATEGORIES, 'program') };
    }),
    learnLinks: links(o['learnLinks'], 'site.learnLinks'),
    scienceLinks: links(o['scienceLinks'], 'site.scienceLinks'),
    aboutLinks: links(o['aboutLinks'], 'site.aboutLinks'),
    supportLinks: links(o['supportLinks'], 'site.supportLinks'),
    footer: {
      landAcknowledgment: str(footer, 'landAcknowledgment', 'site.footer'),
      nonprofit: str(footer, 'nonprofit', 'site.footer'),
      credentials: links(footer['credentials'], 'site.footer.credentials'),
      social: links(footer['social'], 'site.footer.social'),
      links: links(footer['links'], 'site.footer.links'),
    },
  };
}

/** Cross-file integrity: notices point at real halls, etc. */
export function validateContent(c: Content): string[] {
  const problems: string[] = [];
  const hallSlugs = new Set(c.halls.map((h) => h.slug));
  for (const n of c.notices) {
    if (n.hall && !hallSlugs.has(n.hall)) problems.push(`notice ${n.id} references unknown hall ${n.hall}`);
  }
  for (const e of c.exhibitions) {
    if (e.noImagery && e.mood !== 'lively') problems.push(`exhibition ${e.slug}: noImagery must use lively chrome only`);
  }
  return problems;
}

