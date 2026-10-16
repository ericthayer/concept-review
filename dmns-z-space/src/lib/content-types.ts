/** Shared content contracts. Pure types: safe to import from build and browser code. */

export type IsoDate = `${number}-${number}-${number}`;

export type WingId =
  | 'atrium'
  | 'space'
  | 'life'
  | 'deep-time'
  | 'wildlife'
  | 'special'
  | 'theaters'
  | 'science'
  | 'plaza'
  | 'editorial'
  | 'sealed';

export type HallStatus = 'open' | 'sealed';

export interface Hall {
  readonly slug: string;
  readonly name: string;
  readonly shortName?: string;
  /** null = floor not confirmed by DMNS. */
  readonly floor: 0 | 1 | 2 | 3 | null;
  readonly floorLabel: string;
  readonly wing: WingId;
  readonly status: HallStatus;
  readonly spansFloors?: readonly number[];
  readonly description: string;
  readonly media: string;
}

export interface HallsFile {
  readonly halls: readonly Hall[];
  readonly objectPlates: number;
  readonly objectPlateName: string;
  readonly objectPlateMeta: string;
  readonly objectPlateText: string;
}

export interface Exhibition {
  readonly slug: string;
  readonly name: string;
  readonly kind: 'exhibition' | 'event';
  readonly opens: IsoDate | null;
  readonly closes: IsoDate | null;
  readonly dateLabel: string;
  readonly comingLabel?: string;
  readonly thirdPartyIp?: boolean;
  readonly description: string;
  readonly media: string;
}

export interface Theater {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly ticketNote?: string;
  readonly media: string;
}

export interface MuseumEvent {
  readonly id: string;
  readonly name: string;
  readonly date: IsoDate | null;
  readonly dateLabel: string;
  readonly location: string;
}

export interface Notice {
  readonly id: string;
  readonly message: string;
  /** First day the banner shows. */
  readonly start: IsoDate;
  /** Last day the banner shows; expired notices are dropped at build time. */
  readonly end: IsoDate;
  readonly hall?: string;
}

export interface Media {
  readonly id: string;
  readonly src: string | null;
  readonly alt: string;
  readonly credit: string;
  readonly placeholder: boolean;
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

export interface Link {
  readonly label: string;
  readonly href: string;
}

export type OutboundId =
  | 'tickets'
  | 'membership'
  | 'donate'
  | 'login'
  | 'search'
  | 'catalyst'
  | 'digitalCollections';

export interface Site {
  readonly name: string;
  readonly shortName: string;
  readonly conceptNote: string;
  readonly liveSite: string;
  readonly address: { readonly street: string; readonly city: string; readonly region: string; readonly postalCode: string };
  readonly hours: { readonly daily: string; readonly extended: string; readonly closed: string };
  readonly outbound: Readonly<Record<OutboundId, Link>>;
  readonly primaryNav: readonly Link[];
  readonly secondaryNav: readonly OutboundId[];
  readonly pages: SitePages;
  readonly footer: {
    readonly landAcknowledgment: string;
    readonly credentials: readonly string[];
    readonly nonprofit: string;
    readonly newsletter: { readonly heading: string; readonly note: string };
    readonly social: readonly Link[];
    readonly links: readonly Link[];
  };
}

export interface BasicPage {
  readonly title: string;
  readonly lede?: string;
  readonly legacyPath?: string;
}

export interface SitePages {
  readonly atrium: BasicPage & {
    readonly headline: string;
    readonly doorwaysHeading: string;
    readonly nowShowingHeading: string;
    readonly eventsHeading: string;
    readonly behindGlassHeading: string;
    readonly visitHeading: string;
  };
  readonly halls: BasicPage;
  readonly specialExhibitions: BasicPage;
  readonly theaters: BasicPage;
  readonly sturmFamilyWing: BasicPage & {
    readonly subtitle: string;
    readonly spaces: readonly { readonly name: string; readonly text: string; readonly href?: string }[];
  };
  readonly visit: BasicPage & {
    readonly sections: readonly { readonly id: string; readonly name: string; readonly text: string; readonly outbound?: OutboundId }[];
  };
  readonly programs: BasicPage & { readonly items: readonly string[]; readonly itemText: string };
  readonly learn: BasicPage;
  readonly science: BasicPage & {
    readonly topics: readonly string[];
    readonly collections: readonly string[];
    readonly topicText: string;
  };
  readonly about: BasicPage;
  readonly support: BasicPage;
  readonly notFound: BasicPage;
}

export interface Content {
  readonly site: Site;
  readonly halls: HallsFile;
  readonly exhibitions: readonly Exhibition[];
  readonly theaters: readonly Theater[];
  readonly events: readonly MuseumEvent[];
  readonly notices: readonly Notice[];
  readonly media: ReadonlyMap<string, Media>;
}

export const TODO_MARK = 'TODO: confirm with DMNS';

export function isTodo(value: string | null | undefined): boolean {
  return value == null || value.startsWith(TODO_MARK);
}
