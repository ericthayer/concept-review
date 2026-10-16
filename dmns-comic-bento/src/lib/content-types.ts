/**
 * Content types. Loaders live in content.ts.
 * Every rendered fact must trace to content/*.json; missing copy is null and
 * renders as a visibly marked "TODO: confirm with DMNS" placeholder.
 */
import type { IsoDate, NoticeSeverity } from './dates.ts';
import type { LayoutName } from './layouts.ts';

export const TODO = 'TODO: confirm with DMNS';

export type PopColor = 'green' | 'blue' | 'orange' | 'magenta' | 'red';
export type Mood = 'lively' | 'documentary' | 'closed';
export type FloorId = '1' | '2' | '3' | 'outdoor' | 'tbd';
export type Pose =
  | 'notebook'
  | 'digging'
  | 'floating'
  | 'stethoscope'
  | 'binoculars'
  | 'hardhat'
  | 'loupe'
  | 'blocks'
  | 'leaves'
  | 'climbing'
  | 'tumbling';

export const POSES: readonly Pose[] = [
  'notebook', 'digging', 'floating', 'stethoscope', 'binoculars', 'hardhat',
  'loupe', 'blocks', 'leaves', 'climbing', 'tumbling',
];
export const POP_COLORS: readonly PopColor[] = ['green', 'blue', 'orange', 'magenta', 'red'];
export const MOODS: readonly Mood[] = ['lively', 'documentary', 'closed'];
export const FLOORS: readonly FloorId[] = ['1', '2', '3', 'outdoor', 'tbd'];
export const LAYOUT_NAMES: readonly LayoutName[] = ['cover', 'trio', 'mosaic', 'stair', 'strip'];

export interface Link {
  readonly label: string;
  readonly url: string;
}

export interface Hall {
  readonly slug: string;
  readonly name: string;
  readonly floors: readonly FloorId[];
  readonly floorLabel: string;
  readonly description: string;
  readonly descriptionIsQuote: boolean;
  readonly mood: Mood;
  readonly pop: PopColor | null;
  readonly pose: Pose | null;
  readonly art: string;
}

export interface Exhibition {
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly kind: 'exhibition' | 'event';
  readonly opens: IsoDate | null;
  readonly closes: IsoDate | null;
  readonly dateLabel: string;
  readonly description: string | null;
  readonly mood: Mood;
  readonly pop: PopColor | null;
  readonly art: string;
  readonly liveUrl: string;
  readonly ticketsUrl: string | null;
  /** Third-party IP: name only, never imagery. */
  readonly noImagery: boolean;
}

export interface Theater {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly ticketsUrl: string;
  readonly pop: PopColor;
  readonly art: string;
}

export type ProgramCategory = 'events' | 'kids' | 'host';
export const PROGRAM_CATEGORIES: readonly ProgramCategory[] = ['events', 'kids', 'host'];

export interface EventItem {
  readonly id: string;
  readonly title: string;
  readonly date: IsoDate | null;
  readonly category: ProgramCategory;
  readonly url: string | null;
  readonly todo: boolean;
}

export interface Notice {
  readonly id: string;
  readonly title: string;
  readonly hall: string | null;
  readonly start: IsoDate;
  readonly end: IsoDate;
  readonly severity: NoticeSeverity;
}

export interface MediaItem {
  readonly src: string;
  readonly alt: string;
  readonly credit: string;
  readonly placeholder: boolean;
}

export interface ProgramLink extends Link {
  readonly category: ProgramCategory;
}

export interface Site {
  readonly name: string;
  readonly shortName: string;
  readonly liveOrigin: string;
  readonly sourceDate: IsoDate;
  readonly address: { readonly street: string; readonly city: string; readonly region: string; readonly postal: string };
  readonly hours: {
    readonly open: string;
    readonly close: string;
    readonly fridayLateClose: string;
    readonly closedDates: readonly string[];
    readonly timeZone: string;
    readonly summary: string;
    readonly fridaySummary: string;
    readonly closedSummary: string;
  };
  readonly outbound: Readonly<Record<'tickets' | 'membership' | 'donate' | 'login' | 'search' | 'catalyst' | 'digitalCollections', string>>;
  readonly visitLinks: readonly Link[];
  readonly sturmWing: { readonly tagline: string; readonly spaces: readonly { readonly name: string; readonly detail: string }[] };
  readonly programLinks: readonly ProgramLink[];
  readonly learnLinks: readonly Link[];
  readonly scienceLinks: readonly Link[];
  readonly aboutLinks: readonly Link[];
  readonly supportLinks: readonly Link[];
  readonly footer: {
    readonly landAcknowledgment: string;
    readonly nonprofit: string;
    readonly credentials: readonly Link[];
    readonly social: readonly Link[];
    readonly links: readonly Link[];
  };
}

export interface SpreadScript {
  readonly id: string;
  readonly kicker: string;
  readonly heading: string;
  readonly layout: LayoutName;
}

export interface Content {
  readonly site: Site;
  readonly halls: readonly Hall[];
  readonly exhibitions: readonly Exhibition[];
  readonly theaters: readonly Theater[];
  readonly events: readonly EventItem[];
  readonly notices: readonly Notice[];
  readonly media: readonly MediaItem[];
  readonly coverSpreads: readonly SpreadScript[];
}

/** Floors in display order, for the Halls floor switcher. */
export const FLOOR_ORDER: readonly FloorId[] = ['1', '2', '3', 'outdoor', 'tbd'];

export function floorName(f: FloorId): string {
  switch (f) {
    case '1':
    case '2':
    case '3':
      return `Floor ${f}`;
    case 'outdoor':
      return 'Outdoor';
    case 'tbd':
      return 'Floor to be confirmed';
  }
}

/** Halls in book order: by first floor, then source order. */
export function hallsInBookOrder(halls: readonly Hall[]): Hall[] {
  const rank = (h: Hall): number => FLOOR_ORDER.indexOf(h.floors[0] ?? 'tbd');
  return halls
    .map((h, i) => ({ h, i }))
    .sort((a, b) => rank(a.h) - rank(b.h) || a.i - b.i)
    .map(({ h }) => h);
}
