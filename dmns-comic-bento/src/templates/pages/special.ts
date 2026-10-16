/** Special exhibitions index + detail, and Theaters index + detail. */
import type { Exhibition, Theater } from '../../lib/content.ts';
import type { PageContext } from '../context.ts';
import { externalLink, renderDocument } from '../document.ts';
import { html, join, type SafeHtml } from '../html.ts';
import type { PanelSpec } from '../panel.ts';
import { renderSpread, type SpreadSpec } from '../spread.ts';
import { exhibitionPanel, theaterPanel, ticketsPanel } from './shared.ts';
import { renderSplash } from './splash.ts';

export interface FilterOption {
  readonly value: string;
  readonly label: string;
}

export function filterBar(id: string, label: string, options: readonly FilterOption[]): SafeHtml {
  const buttons = [{ value: 'all', label: 'All' }, ...options].map(
    (o) => html`<li><button type="button" data-filter-value="${o.value}" aria-pressed="${o.value === 'all' ? 'true' : 'false'}">${o.label}</button></li>`,
  );
  return html`<dmns-filter class="filter" data-target="${id}" hidden><p class="filter__label" id="${id}-filter-label">${label}</p><ul class="filter__options" role="group" aria-labelledby="${id}-filter-label">${buttons}</ul></dmns-filter>`;
}

export function renderSpecialIndex(ctx: PageContext): string {
  const panels = ctx.content.exhibitions.map((e) => exhibitionPanel(ctx, e, { span: 'w', id: `p-ex-${e.slug}` }));
  const spread: SpreadSpec = {
    id: 'spread-exhibitions',
    kicker: 'Special Edition',
    heading: 'On now and coming soon',
    layout: 'strip',
    panels,
    before: filterBar('spread-exhibitions', 'Show', [
      { value: 'open', label: 'Now open' },
      { value: 'upcoming', label: 'Coming soon' },
      { value: 'evening', label: 'Evening events' },
    ]),
  };
  const main = html`${renderSplash(ctx, { title: 'Special Exhibitions', kicker: 'Special Edition', sub: 'Limited-run exhibitions and evening events.', mood: 'lively', issueHead: true })}${renderSpread(ctx, spread, 1)}`;
  return renderDocument(ctx, { title: 'Special Exhibitions', description: 'Special exhibitions and evening events at the Denver Museum of Nature & Science.', main });
}

function infoBody(rows: readonly [string, SafeHtml | string][]): SafeHtml {
  return html`<dl class="facts">${rows.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`;
}

export function renderExhibition(ctx: PageContext, e: Exhibition): string {
  const doc = e.mood === 'documentary';
  const others = ctx.content.exhibitions.filter((x) => x.slug !== e.slug);
  const details: PanelSpec[] = [
    { id: 'p-about', span: 'w', issue: 'special', mood: doc ? 'documentary' : 'plain', kicker: 'About the exhibition', title: e.name, titleStyle: 'plain', sub: e.description, todo: e.description === null },
    {
      id: 'p-when', span: 'm', issue: 'special', mood: 'plain', kicker: 'When', title: e.dateLabel, titleStyle: 'plain',
      body: infoBody([['More', externalLink(e.liveUrl, 'Details on dmns.org')]]),
    },
    ...(e.ticketsUrl ? [{ ...ticketsPanel(ctx, 'p-ex-tickets'), link: { href: e.ticketsUrl, verb: 'Buy Tickets', object: `for ${e.shortName}` } }] : []),
  ];
  const spreads: SpreadSpec[] = [
    { id: 'spread-details', kicker: 'The facts', heading: 'Plan this visit', headingStyle: 'plain', layout: 'strip', panels: details },
    {
      id: 'spread-more',
      kicker: 'Also in this issue',
      heading: 'More special exhibitions',
      layout: 'strip',
      panels: [
        ...others.map((o) => exhibitionPanel(ctx, o, { span: 'm', id: `p-more-${o.slug}` })),
        { id: 'p-back', span: 's', issue: 'special', mood: 'plain', title: 'All special exhibitions', titleStyle: 'plain', link: { href: '/special-exhibitions/', verb: 'Back to Special Exhibitions', object: '' }, destination: 'special' },
      ],
    },
  ];
  const kicker = e.noImagery ? 'Coming 2027' : e.dateLabel;
  const main = html`${renderSplash(ctx, {
    title: e.shortName,
    kicker,
    sub: e.shortName === e.name ? e.dateLabel : e.name,
    mood: e.mood,
    ...(e.noImagery ? {} : { art: e.art }),
  })}${join(spreads.map((s, i) => renderSpread(ctx, s, i + 1)))}`;
  return renderDocument(ctx, {
    title: e.name,
    description: `${e.name} at the Denver Museum of Nature & Science. ${e.dateLabel}.`,
    main,
    expectSplash: true,
    documentary: doc,
  });
}

export function renderTheatersIndex(ctx: PageContext): string {
  const spread: SpreadSpec = {
    id: 'spread-theaters',
    kicker: 'Now Screening',
    heading: 'Three screens',
    layout: 'trio',
    panels: ctx.content.theaters.map((t) => theaterPanel(t, { span: 't', id: `p-th-${t.slug}` })),
  };
  const main = html`${renderSplash(ctx, { title: 'Theaters', kicker: 'Now Screening', sub: 'Films, shows and lectures.', mood: 'lively', issueHead: true })}${renderSpread(ctx, spread, 1)}`;
  return renderDocument(ctx, { title: 'Theaters', description: 'Gates Planetarium, Sturm Infinity Theater and Laser Shows at the Denver Museum of Nature & Science.', main });
}

export function renderTheater(ctx: PageContext, t: Theater): string {
  const others = ctx.content.theaters.filter((x) => x.slug !== t.slug);
  const spreads: SpreadSpec[] = [
    {
      id: 'spread-details',
      kicker: 'The facts',
      heading: 'Plan this visit',
      headingStyle: 'plain',
      layout: 'strip',
      panels: [
        { id: 'p-about', span: 'w', issue: 'theaters', mood: 'plain', kicker: 'About', title: t.name, titleStyle: 'plain', sub: t.description, todo: t.description === null },
        { id: 'p-showtimes', span: 'm', issue: 'theaters', mood: 'plain', kicker: 'Showtimes', title: 'Showtimes and tickets', titleStyle: 'plain', cta: true, link: { href: t.ticketsUrl, verb: 'Buy Tickets', object: `for ${t.name}` } },
      ],
    },
    {
      id: 'spread-more',
      kicker: 'Also in this issue',
      heading: 'Other screens',
      layout: 'strip',
      panels: [
        ...others.map((o) => theaterPanel(o, { span: 'm', id: `p-more-${o.slug}` })),
        { id: 'p-back', span: 's', issue: 'theaters', mood: 'plain', title: 'All theaters', titleStyle: 'plain', link: { href: '/theaters/', verb: 'Back to Theaters', object: '' }, destination: 'theaters' },
      ],
    },
  ];
  const main = html`${renderSplash(ctx, { title: t.name, kicker: 'Now Screening', sub: t.description, mood: 'lively', art: t.art, pose: 'floating' })}${join(spreads.map((s, i) => renderSpread(ctx, s, i + 1)))}`;
  return renderDocument(ctx, { title: t.name, description: `${t.name} at the Denver Museum of Nature & Science.`, main, expectSplash: true });
}
