/** Panel builders shared across pages. Every fact comes from content. */
import type { IssueId } from '../../lib/book.ts';
import { exhibitionPhase, isInEffect } from '../../lib/dates.ts';
import type { Exhibition, Hall, Link, Notice, Theater } from '../../lib/content.ts';
import type { Span } from '../../lib/layouts.ts';
import type { PageContext } from '../context.ts';
import { html, slugify, type SafeHtml } from '../html.ts';
import type { PanelSpec } from '../panel.ts';

export function hoursBody(ctx: PageContext): SafeHtml {
  const { hours } = ctx.content.site;
  return html`<ul class="hours-list"><li>${hours.summary}</li><li>${hours.fridaySummary}</li><li>${hours.closedSummary}</li></ul><p class="hours-state" data-open-state-mirror></p>`;
}

export function ticketsPanel(ctx: PageContext, id: string): PanelSpec {
  return {
    id, span: 's', issue: 'visit', mood: 'plain', cta: true, title: 'Tickets', titleStyle: 'plain',
    link: { href: ctx.content.site.outbound.tickets, verb: 'Buy Tickets', object: '' },
  };
}

export function hallNotice(ctx: PageContext, slug: string): Notice | null {
  return ctx.notices.find((n) => n.hall === slug) ?? null;
}

export function hallPanel(h: Hall, opts: { span: Span; art: boolean; id: string; ctx?: PageContext; kicker?: string }): PanelSpec {
  const notice = opts.ctx ? hallNotice(opts.ctx, h.slug) : null;
  const kicker = opts.kicker ?? (h.mood === 'closed' ? 'To be continued…' : h.floorLabel);
  return {
    id: opts.id,
    span: opts.span,
    issue: 'halls',
    mood: h.mood,
    pop: h.pop,
    kicker,
    title: h.name,
    sub: h.description,
    subIsQuote: h.descriptionIsQuote,
    art: opts.art ? h.art : undefined,
    pose: h.pose,
    spot: 'br',
    notice: Boolean(notice),
    link: { href: `/halls/${h.slug}/`, verb: h.mood === 'closed' ? 'Read on' : 'Enter', object: h.name },
    destination: h.slug,
  };
}

export type ExhibitionFilter = 'open' | 'upcoming' | 'evening';

export function exhibitionFilters(ctx: PageContext, e: Exhibition): ExhibitionFilter[] {
  const out: ExhibitionFilter[] = [];
  const phase = exhibitionPhase(e.opens, e.closes, ctx.today);
  if (phase === 'open') out.push('open');
  if (phase === 'upcoming') out.push('upcoming');
  if (e.kind === 'event') out.push('evening');
  return out;
}

export function exhibitionPanel(ctx: PageContext, e: Exhibition, opts: { span: Span; id: string }): PanelSpec {
  return {
    id: opts.id,
    span: opts.span,
    issue: 'special',
    mood: e.mood,
    pop: e.noImagery ? null : e.pop,
    kicker: e.dateLabel,
    title: e.shortName,
    sub: e.shortName === e.name ? undefined : e.name,
    art: e.noImagery ? undefined : e.art,
    filter: exhibitionFilters(ctx, e),
    link: { href: `/special-exhibitions/${e.slug}/`, verb: 'Enter', object: e.name },
    destination: e.slug,
  };
}

export function theaterPanel(t: Theater, opts: { span: Span; id: string }): PanelSpec {
  return {
    id: opts.id,
    span: opts.span,
    issue: 'theaters',
    mood: 'lively',
    pop: t.pop,
    kicker: 'Now Screening',
    title: t.name,
    sub: t.description,
    art: t.art,
    link: { href: `/theaters/${t.slug}/`, verb: 'Enter', object: t.name },
    destination: t.slug,
  };
}

/** Plain outbound link panel for menus that stay on dmns.org. */
export function linkPanel(issue: IssueId, link: Link, opts: { span?: Span; kicker?: string; art?: string; filter?: readonly string[]; prefix?: string } = {}): PanelSpec {
  return {
    id: `p-${opts.prefix ?? issue}-${slugify(link.label)}`,
    span: opts.span ?? 'm',
    issue,
    mood: opts.art ? 'lively' : 'plain',
    kicker: opts.kicker,
    title: link.label,
    titleStyle: opts.art ? 'knockout' : 'plain',
    art: opts.art,
    filter: opts.filter,
    link: { href: link.url, verb: link.label, object: '' },
  };
}

export function noticePanel(n: Notice, today: string, id: string): PanelSpec {
  return {
    id,
    span: 'w',
    issue: 'halls',
    mood: 'plain',
    notice: true,
    kicker: isInEffect(n, today) ? 'Notice: in effect' : 'Notice',
    title: n.title,
    titleStyle: 'plain',
  };
}
