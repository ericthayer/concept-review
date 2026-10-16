/**
 * <dmns-panel>: one bento cell. Art + caption + one stretched link.
 */
import type { IssueId } from '../lib/book.ts';
import type { Mood, PopColor, Pose } from '../lib/content.ts';
import type { Span } from '../lib/layouts.ts';
import type { SfxWord } from '../../art/sfx.ts';
import { artSvg, balloon, sfx, sketchStamp, specimen, type SpecimenSpot } from './art.ts';
import { captionSub, kicker, knockout, plainHeading, type HeadingTag } from './caption.ts';
import type { PageContext } from './context.ts';
import { html, isExternal, raw, type SafeHtml } from './html.ts';

export interface PanelLink {
  readonly href: string;
  /** Short visible verb, e.g. "Enter". */
  readonly verb: string;
  /** Completes the accessible name, e.g. the hall name. */
  readonly object: string;
}

export interface Beat {
  readonly art: string;
  readonly label: string;
}

export interface PanelSpec {
  readonly id: string;
  readonly span: Span;
  readonly issue: IssueId;
  readonly mood: Mood | 'plain';
  readonly pop?: PopColor | null;
  readonly kicker?: string;
  readonly title: string;
  readonly titleStyle?: 'knockout' | 'plain';
  readonly headingLevel?: HeadingTag;
  /** undefined = no sub caption; null = TODO placeholder */
  readonly sub?: string | null;
  readonly subIsQuote?: boolean;
  readonly body?: SafeHtml;
  readonly link?: PanelLink;
  readonly cta?: boolean;
  readonly art?: string;
  readonly pose?: Pose | null;
  readonly spot?: SpecimenSpot;
  readonly balloon?: string;
  readonly sfx?: SfxWord;
  readonly beats?: { readonly items: readonly Beat[]; readonly sentence: string };
  readonly notice?: boolean;
  readonly lean?: boolean;
  readonly filter?: readonly string[];
  readonly todo?: boolean;
  readonly stepStart?: number;
  /** Slug of the destination, used to give the panel a stable transition key. */
  readonly destination?: string;
}

export interface PanelRenderFlags {
  readonly showSpecimen: boolean;
  readonly mute: boolean;
}

function linkHtml(link: PanelLink, cta: boolean): SafeHtml {
  const ext = isExternal(link.href);
  const cls = cta ? 'panel__link panel__link--cta' : 'panel__link';
  return html`<a class="${cls}" href="${link.href}">${link.verb}<span class="vh"> ${link.object}</span>${ext ? html`<span class="ext" aria-hidden="true">↗</span><span class="vh"> (on dmns.org)</span>` : html`<span class="arrow" aria-hidden="true">→</span>`}</a>`;
}

function beatStrip(ctx: PageContext, beats: NonNullable<PanelSpec['beats']>): SafeHtml {
  const items = beats.items.map(
    (b, i) => html`<div class="beat" data-beat="${i + 1}">${artSvg(ctx, b.art)}<span class="beat__label">${b.label}</span></div>`,
  );
  return html`<dmns-beat-strip class="panel__art panel__art--beats" data-beats="${beats.items.length}"><p class="vh">${beats.sentence}</p><div class="beats" aria-hidden="true">${items}</div>${sketchStamp()}<button type="button" class="beat-replay" data-js-only>Replay</button></dmns-beat-strip>`;
}

function artBlock(ctx: PageContext, spec: PanelSpec, flags: PanelRenderFlags): SafeHtml {
  if (spec.beats) return beatStrip(ctx, spec.beats);
  if (!spec.art) return html``;
  const showSpecimen = flags.showSpecimen && spec.pose && (spec.mood === 'lively' || spec.mood === 'closed') ? spec.pose : null;
  return html`<figure class="panel__art" aria-hidden="true">${artSvg(ctx, spec.art)}${showSpecimen ? specimen(ctx, showSpecimen, spec.spot) : ''}${spec.balloon && spec.mood === 'lively' ? balloon(spec.balloon) : ''}${spec.sfx && spec.mood === 'lively' ? sfx(spec.sfx) : ''}${sketchStamp()}</figure>`;
}

export function renderPanel(ctx: PageContext, spec: PanelSpec, flags: PanelRenderFlags): SafeHtml {
  const titleId = `${spec.id}-t`;
  const level = spec.headingLevel ?? 'h3';
  const heading =
    (spec.titleStyle ?? 'knockout') === 'knockout'
      ? knockout(spec.title, { tag: level, id: titleId, maxChars: spec.span === 's' ? 12 : 16, className: 'caption panel__title' })
      : plainHeading(spec.title, level, titleId);
  const attrs = [
    `id="${spec.id}"`,
    `data-span="${spec.span}"`,
    `data-issue="${spec.issue}"`,
    `data-mood="${spec.mood}"`,
    spec.pop && !flags.mute ? `data-pop="${spec.pop}"` : '',
    flags.mute ? 'data-mute' : '',
    spec.notice ? 'data-notice' : '',
    spec.cta ? 'data-cta' : '',
    spec.todo ? 'data-todo' : '',
    spec.art || spec.beats ? 'data-has-art' : '',
    spec.filter ? `data-filter="${spec.filter.join(' ')}"` : '',
    spec.stepStart !== undefined ? `data-step-start="${spec.stepStart}"` : '',
    spec.destination ? `data-dest="${spec.destination}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const lean = spec.lean
    ? html`<button type="button" class="lean-btn" aria-expanded="false" aria-controls="${spec.id}" data-js-only>Look closer<span class="vh"> at ${spec.title}</span></button>`
    : '';
  const sub = spec.sub === undefined ? '' : captionSub(spec.sub, { quote: spec.subIsQuote ?? false });
  return html`<dmns-panel ${raw(attrs)}><article class="panel" aria-labelledby="${titleId}">${artBlock(ctx, spec, flags)}<div class="panel__copy">${spec.kicker ? kicker(spec.kicker) : ''}${heading}${sub}${spec.body ?? ''}</div><div class="panel__actions">${spec.link ? linkHtml(spec.link, spec.cta ?? false) : ''}${lean}</div></article></dmns-panel>`;
}

