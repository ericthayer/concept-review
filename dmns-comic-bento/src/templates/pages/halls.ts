/** Halls index (/halls/) and hall detail (/halls/{slug}/). */
import { FLOOR_ORDER, floorName, hallsInBookOrder, type FloorId, type Hall } from '../../lib/content.ts';
import type { PageContext } from '../context.ts';
import { renderDocument } from '../document.ts';
import { html, join } from '../html.ts';
import type { PanelSpec } from '../panel.ts';
import { renderSpread, type SpreadSpec } from '../spread.ts';
import { hallNotice, hallPanel, noticePanel, ticketsPanel } from './shared.ts';
import { renderSplash } from './splash.ts';

function floorId(f: FloorId): string {
  return `floor-${f}`;
}

export function renderHallsIndex(ctx: PageContext): string {
  const halls = hallsInBookOrder(ctx.content.halls);
  const floors = FLOOR_ORDER.filter((f) => halls.some((h) => h.floors.includes(f)));
  const tabs = html`<dmns-floor-tabs><nav class="floor-tabs" aria-label="Floors"><ul>${floors.map(
    (f) => html`<li><a href="#${floorId(f)}" id="tab-${floorId(f)}" data-floor="${f}">${floorName(f)}</a></li>`,
  )}</ul></nav></dmns-floor-tabs>`;
  const spreads: SpreadSpec[] = floors.map((f) => {
    const onFloor = halls.filter((h) => h.floors.includes(f));
    const panels: PanelSpec[] = onFloor.map((h) => {
      const continued = h.floors.length > 1 && h.floors[0] !== f;
      const next = h.floors[h.floors.indexOf(f) + 1];
      const kicker = continued ? `Continued from ${floorName(h.floors[0] ?? f)}` : next ? `Continued on ${floorName(next)}` : undefined;
      return hallPanel(h, { span: 'w', art: true, id: `p-${floorId(f)}-${h.slug}`, ctx, ...(kicker ? { kicker } : {}) });
    });
    return { id: floorId(f), kicker: f === 'tbd' || f === 'outdoor' ? 'Meanwhile…' : `Meanwhile, on ${floorName(f)}…`, heading: floorName(f), layout: 'strip', panels };
  });
  const main = html`${renderSplash(ctx, {
    title: 'Halls',
    kicker: 'Issue: The Halls',
    sub: 'Permanent exhibitions, floor by floor.',
    mood: 'lively',
    issueHead: true,
    extra: tabs,
  })}<div class="floor-spreads">${join(spreads.map((s, i) => renderSpread(ctx, s, i + 1)))}</div>`;
  return renderDocument(ctx, {
    title: 'Halls',
    description: 'Permanent exhibition halls at the Denver Museum of Nature & Science, by floor.',
    main,
  });
}

function neighbours(ctx: PageContext, hall: Hall): { prev: Hall | null; next: Hall | null } {
  const ordered = hallsInBookOrder(ctx.content.halls);
  const i = ordered.findIndex((h) => h.slug === hall.slug);
  return { prev: ordered[i - 1] ?? null, next: ordered[i + 1] ?? null };
}

export function renderHall(ctx: PageContext, hall: Hall): string {
  const notice = hallNotice(ctx, hall.slug);
  const { prev, next } = neighbours(ctx, hall);
  const doc = hall.mood === 'documentary';
  const closed = hall.mood === 'closed';

  const story: SpreadSpec = {
    id: 'spread-story',
    kicker: closed ? 'Under construction' : 'In this hall',
    heading: closed ? 'What happens next' : 'Inside the hall',
    layout: 'strip',
    panels: closed
      ? [
          { id: 'p-story-status', span: 'w', issue: 'halls', mood: 'closed', kicker: 'Status', title: 'Renovation', titleStyle: 'plain', sub: hall.description, subIsQuote: hall.descriptionIsQuote },
          { id: 'p-story-reopen', span: 'w', issue: 'halls', mood: 'closed', kicker: 'Reopening', title: 'Reopening date', titleStyle: 'plain', sub: null, todo: true },
        ]
      : [
          { id: 'p-story-highlights', span: 'w', issue: 'halls', mood: doc ? 'documentary' : 'plain', kicker: 'Highlights', title: 'Exhibit highlights', titleStyle: 'plain', sub: null, todo: true },
          { id: 'p-story-collection', span: 'w', issue: 'halls', mood: doc ? 'documentary' : 'plain', kicker: 'From the collection', title: 'Objects on view', titleStyle: 'plain', sub: null, todo: true },
        ],
  };

  const sameFloor = ctx.content.halls.filter((h) => h.slug !== hall.slug && h.floors.some((f) => hall.floors.includes(f) && f !== 'tbd'));
  const also: SpreadSpec | null = sameFloor.length
    ? {
        id: 'spread-also',
        kicker: 'Meanwhile, down the hall…',
        heading: `Also on ${hall.floorLabel}`,
        layout: 'strip',
        panels: hallsInBookOrder(sameFloor).map((h) => hallPanel(h, { span: 'm', art: true, id: `p-also-${h.slug}`, ctx })),
      }
    : null;

  const plan: PanelSpec[] = [
    {
      id: 'p-plan', span: 'w', issue: 'visit', mood: 'plain', kicker: 'Plan this visit', title: hall.name, titleStyle: 'plain',
      body: html`<dl class="facts"><div><dt>Where</dt><dd>${hall.floorLabel}</dd></div><div><dt>Hours</dt><dd>${ctx.content.site.hours.summary}</dd></div></dl>`,
    },
    ...(notice ? [noticePanel(notice, ctx.today, 'p-notice')] : []),
    ticketsPanel(ctx, 'p-plan-tickets'),
    ...(prev ? [{ ...hallPanel(prev, { span: 's', art: false, id: 'p-prev', kicker: 'Previous hall' }), sub: undefined, link: { href: `/halls/${prev.slug}/`, verb: 'Previous hall', object: prev.name } }] : []),
    ...(next ? [{ ...hallPanel(next, { span: 's', art: false, id: 'p-next', kicker: 'Next hall' }), sub: undefined, link: { href: `/halls/${next.slug}/`, verb: 'Next hall', object: next.name } }] : []),
    { id: 'p-back', span: 's', issue: 'halls', mood: 'plain', title: 'All halls', titleStyle: 'plain', link: { href: '/halls/', verb: 'Back to all halls', object: '' }, destination: 'halls' },
  ];
  const planSpread: SpreadSpec = {
    id: 'spread-plan',
    kicker: 'Plan this visit',
    heading: 'Plan this visit',
    headingStyle: 'plain',
    layout: 'strip',
    panels: plan.map((p) => ({ ...p, pose: null })),
  };

  const spreads = [story, ...(also ? [also] : []), planSpread];
  const main = html`${renderSplash(ctx, {
    title: hall.name,
    kicker: hall.floorLabel,
    sub: hall.description,
    subIsQuote: hall.descriptionIsQuote,
    mood: hall.mood,
    art: hall.art,
    pose: hall.pose,
  })}${join(spreads.map((s, i) => renderSpread(ctx, s, i + 1)))}`;
  return renderDocument(ctx, {
    title: hall.name,
    description: `${hall.name} at the Denver Museum of Nature & Science. ${hall.description}`,
    main,
    expectSplash: true,
    documentary: doc,
  });
}
