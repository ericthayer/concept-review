/**
 * Typed loaders for content/*.json. Build-time only (Node). Every loader validates the
 * shape it returns so a malformed edit fails the build instead of rendering nonsense.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Content,
  Exhibition,
  Hall,
  HallsFile,
  Media,
  MuseumEvent,
  Notice,
  Site,
  Theater,
  WingId,
} from './content-types.js';
import { isIsoDate } from './dates.js';

type Json = Record<string, unknown>;

export class ContentError extends Error {
  override name = 'ContentError';
}

function fail(file: string, path: string, expected: string): never {
  throw new ContentError(`${file}: ${path} must be ${expected}`);
}

function obj(value: unknown, file: string, path: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(file, path, 'an object');
  return value as Json;
}

function arr(value: unknown, file: string, path: string): unknown[] {
  if (!Array.isArray(value)) fail(file, path, 'an array');
  return value;
}

function str(value: unknown, file: string, path: string): string {
  if (typeof value !== 'string' || value.length === 0) fail(file, path, 'a non-empty string');
  return value;
}

function optStr(value: unknown, file: string, path: string): string | undefined {
  return value === undefined ? undefined : str(value, file, path);
}

function dateOrNull(value: unknown, file: string, path: string): Exhibition['opens'] {
  if (value === null) return null;
  if (!isIsoDate(value)) fail(file, path, 'an ISO date (YYYY-MM-DD) or null');
  return value;
}

function slug(value: unknown, file: string, path: string): string {
  const s = str(value, file, path);
  if (!/^[a-z0-9-]+$/.test(s)) fail(file, path, 'a lowercase slug');
  return s;
}

const WINGS: readonly WingId[] = [
  'atrium', 'space', 'life', 'deep-time', 'wildlife', 'special', 'theaters', 'science', 'plaza', 'editorial', 'sealed',
];

function readJson(dir: string, name: string): Json {
  const raw: unknown = JSON.parse(readFileSync(join(dir, name), 'utf8'));
  return obj(raw, name, '$');
}

/** Optional properties are omitted rather than set to undefined (exactOptionalPropertyTypes). */
function withOptional<T extends object>(base: T, extras: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(extras)) if (value !== undefined) out[key] = value;
  return out as T;
}

export function parseHalls(json: Json, file = 'halls.json'): HallsFile {
  const halls = arr(json['halls'], file, 'halls').map((raw, i): Hall => {
    const h = obj(raw, file, `halls[${i}]`);
    const floor = h['floor'];
    if (!(floor === null || floor === 0 || floor === 1 || floor === 2 || floor === 3)) fail(file, `halls[${i}].floor`, '0–3 or null');
    const wing = str(h['wing'], file, `halls[${i}].wing`);
    if (!WINGS.includes(wing as WingId)) fail(file, `halls[${i}].wing`, `one of ${WINGS.join(', ')}`);
    const status = h['status'];
    if (status !== 'open' && status !== 'sealed') fail(file, `halls[${i}].status`, '"open" or "sealed"');
    const spans = h['spansFloors'] === undefined ? undefined : arr(h['spansFloors'], file, `halls[${i}].spansFloors`).map(Number);
    return withOptional<Hall>(
      {
        slug: slug(h['slug'], file, `halls[${i}].slug`),
        name: str(h['name'], file, `halls[${i}].name`),
        floor,
        floorLabel: str(h['floorLabel'], file, `halls[${i}].floorLabel`),
        wing: wing as WingId,
        status,
        description: str(h['description'], file, `halls[${i}].description`),
        media: str(h['media'], file, `halls[${i}].media`),
      },
      { shortName: optStr(h['shortName'], file, `halls[${i}].shortName`), spansFloors: spans },
    );
  });
  const plates = json['objectPlates'];
  if (typeof plates !== 'number' || plates < 0) fail(file, 'objectPlates', 'a non-negative number');
  return {
    halls,
    objectPlates: plates,
    objectPlateName: str(json['objectPlateName'], file, 'objectPlateName'),
    objectPlateMeta: str(json['objectPlateMeta'], file, 'objectPlateMeta'),
    objectPlateText: str(json['objectPlateText'], file, 'objectPlateText'),
  };
}

export function parseExhibitions(json: Json, file = 'exhibitions.json'): Exhibition[] {
  return arr(json['exhibitions'], file, 'exhibitions').map((raw, i): Exhibition => {
    const e = obj(raw, file, `exhibitions[${i}]`);
    const kind = e['kind'];
    if (kind !== 'exhibition' && kind !== 'event') fail(file, `exhibitions[${i}].kind`, '"exhibition" or "event"');
    return withOptional<Exhibition>(
      {
        slug: slug(e['slug'], file, `exhibitions[${i}].slug`),
        name: str(e['name'], file, `exhibitions[${i}].name`),
        kind,
        opens: dateOrNull(e['opens'], file, `exhibitions[${i}].opens`),
        closes: dateOrNull(e['closes'], file, `exhibitions[${i}].closes`),
        dateLabel: str(e['dateLabel'], file, `exhibitions[${i}].dateLabel`),
        description: str(e['description'], file, `exhibitions[${i}].description`),
        media: str(e['media'], file, `exhibitions[${i}].media`),
      },
      {
        comingLabel: optStr(e['comingLabel'], file, `exhibitions[${i}].comingLabel`),
        thirdPartyIp: e['thirdPartyIp'] === true ? true : undefined,
      },
    );
  });
}

export function parseTheaters(json: Json, file = 'theaters.json'): Theater[] {
  return arr(json['theaters'], file, 'theaters').map((raw, i): Theater => {
    const t = obj(raw, file, `theaters[${i}]`);
    return withOptional<Theater>(
      {
        slug: slug(t['slug'], file, `theaters[${i}].slug`),
        name: str(t['name'], file, `theaters[${i}].name`),
        description: str(t['description'], file, `theaters[${i}].description`),
        media: str(t['media'], file, `theaters[${i}].media`),
      },
      { ticketNote: optStr(t['ticketNote'], file, `theaters[${i}].ticketNote`) },
    );
  });
}

export function parseEvents(json: Json, file = 'events.json'): MuseumEvent[] {
  return arr(json['events'], file, 'events').map((raw, i): MuseumEvent => {
    const e = obj(raw, file, `events[${i}]`);
    return {
      id: slug(e['id'], file, `events[${i}].id`),
      name: str(e['name'], file, `events[${i}].name`),
      date: dateOrNull(e['date'], file, `events[${i}].date`),
      dateLabel: str(e['dateLabel'], file, `events[${i}].dateLabel`),
      location: str(e['location'], file, `events[${i}].location`),
    };
  });
}

export function parseNotices(json: Json, file = 'notices.json'): Notice[] {
  return arr(json['notices'], file, 'notices').map((raw, i): Notice => {
    const n = obj(raw, file, `notices[${i}]`);
    const start = n['start'];
    const end = n['end'];
    if (!isIsoDate(start)) fail(file, `notices[${i}].start`, 'an ISO date');
    if (!isIsoDate(end)) fail(file, `notices[${i}].end`, 'an ISO date');
    if (end < start) fail(file, `notices[${i}].end`, 'on or after start');
    return withOptional<Notice>(
      { id: slug(n['id'], file, `notices[${i}].id`), message: str(n['message'], file, `notices[${i}].message`), start, end },
      { hall: optStr(n['hall'], file, `notices[${i}].hall`) },
    );
  });
}

export function parseMedia(json: Json, file = 'media.json'): Map<string, Media> {
  const map = new Map<string, Media>();
  arr(json['media'], file, 'media').forEach((raw, i) => {
    const m = obj(raw, file, `media[${i}]`);
    const src = m['src'];
    if (src !== null && typeof src !== 'string') fail(file, `media[${i}].src`, 'a string or null');
    const width = m['width'];
    const height = m['height'];
    if (typeof width !== 'number' || typeof height !== 'number') fail(file, `media[${i}]`, 'sized with numeric width/height');
    if (typeof m['alt'] !== 'string') fail(file, `media[${i}].alt`, 'a string (empty for decorative)');
    const item: Media = {
      id: str(m['id'], file, `media[${i}].id`),
      src,
      alt: m['alt'],
      credit: str(m['credit'], file, `media[${i}].credit`),
      placeholder: m['placeholder'] === true,
      label: str(m['label'], file, `media[${i}].label`),
      width,
      height,
    };
    if (map.has(item.id)) fail(file, `media[${i}].id`, 'unique');
    map.set(item.id, item);
  });
  return map;
}

export function parseSite(json: Json, file = 'site.json'): Site {
  // Spot-check the fields templates depend on; the full contract is the Site type.
  str(json['name'], file, 'name');
  obj(json['address'], file, 'address');
  obj(json['hours'], file, 'hours');
  const outbound = obj(json['outbound'], file, 'outbound');
  for (const id of ['tickets', 'membership', 'donate', 'login', 'search', 'catalyst', 'digitalCollections']) {
    const link = obj(outbound[id], file, `outbound.${id}`);
    if (!str(link['href'], file, `outbound.${id}.href`).startsWith('https://')) fail(file, `outbound.${id}.href`, 'an https URL');
  }
  const pages = obj(json['pages'], file, 'pages');
  for (const key of ['atrium', 'halls', 'specialExhibitions', 'theaters', 'sturmFamilyWing', 'visit', 'programs', 'learn', 'science', 'about', 'support', 'notFound']) {
    str(obj(pages[key], file, `pages.${key}`)['title'], file, `pages.${key}.title`);
  }
  obj(json['footer'], file, 'footer');
  return json as unknown as Site;
}

export function loadContent(dir: string): Content {
  const halls = parseHalls(readJson(dir, 'halls.json'));
  const exhibitions = parseExhibitions(readJson(dir, 'exhibitions.json'));
  const theaters = parseTheaters(readJson(dir, 'theaters.json'));
  const media = parseMedia(readJson(dir, 'media.json'));
  const content: Content = {
    site: parseSite(readJson(dir, 'site.json')),
    halls,
    exhibitions,
    theaters,
    events: parseEvents(readJson(dir, 'events.json')),
    notices: parseNotices(readJson(dir, 'notices.json')),
    media,
  };
  const referenced = [...halls.halls.map((h) => h.media), ...exhibitions.map((e) => e.media), ...theaters.map((t) => t.media)];
  for (const id of referenced) if (!media.has(id)) throw new ContentError(`media.json: missing entry "${id}"`);
  return content;
}
