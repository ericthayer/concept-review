/** Visit, Programs, School Programs, Science, About, Support, 404, newsletter. */
import type { IssueId } from '../../lib/book.ts';
import type { Link } from '../../lib/content.ts';
import type { PageContext } from '../context.ts';
import { externalLink, renderDocument } from '../document.ts';
import { html, join, slugify, type SafeHtml } from '../html.ts';
import type { PanelSpec } from '../panel.ts';
import { renderSpread, type SpreadSpec } from '../spread.ts';
import { hoursBody, linkPanel, ticketsPanel } from './shared.ts';
import { filterBar } from './special.ts';
import { renderSplash } from './splash.ts';

function page(ctx: PageContext, title: string, description: string, main: SafeHtml): string {
  return renderDocument(ctx, { title, description, main });
}

export function renderVisit(ctx: PageContext): string {
  const { site } = ctx.content;
  const url = (label: string): string => site.visitLinks.find((l) => l.label === label)?.url ?? site.liveOrigin;
  const essentials: SpreadSpec = {
    id: 'spread-essentials',
    kicker: 'Getting here',
    heading: 'The essentials',
    layout: 'mosaic',
    panels: [
      { id: 'p-hours', span: 'xl', issue: 'visit', mood: 'lively', title: 'Hours', titleStyle: 'plain', art: 'scene-clock', pose: 'notebook', spot: 'bl', body: hoursBody(ctx) },
      { id: 'p-address', span: 'm', issue: 'visit', mood: 'lively', title: 'Address', titleStyle: 'plain', art: 'scene-pin', body: html`<address>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postal}</address>`, link: { href: url('Getting Here'), verb: 'Getting Here', object: '' } },
      ticketsPanel(ctx, 'p-visit-tickets'),
      linkPanel('visit', { label: 'Accessibility', url: url('Accessibility') }, { span: 's' }),
      linkPanel('visit', { label: 'Pricing & Discounts', url: url('Pricing & Discounts') }, { span: 's' }),
    ],
  };
  const sturm: PanelSpec[] = [
    {
      id: 'p-sturm', span: 'w', issue: 'visit', mood: 'lively', kicker: 'Sturm Family Wing', title: 'Sturm Family Wing', art: 'scene-plaza', sub: site.sturmWing.tagline,
      link: { href: url('Sturm Family Wing'), verb: 'Sturm Family Wing', object: '' },
    },
    ...site.sturmWing.spaces.map((s): PanelSpec => ({ id: `p-sturm-${slugify(s.name)}`, span: 'm', issue: 'visit', mood: 'plain', title: s.name, titleStyle: 'plain', sub: s.detail })),
  ];
  const more = site.visitLinks
    .filter((l) => ['Eat & Shop', 'In the Community'].includes(l.label))
    .map((l) => linkPanel('visit', l, { span: 'm' }));
  const spreads: SpreadSpec[] = [
    essentials,
    { id: 'sturm-family-wing', kicker: 'Part curiosity lab', heading: 'Sturm Family Wing', layout: 'strip', panels: sturm },
    { id: 'spread-more', kicker: 'And also', heading: 'Eat, shop and more', headingStyle: 'plain', layout: 'strip', panels: more },
  ];
  const main = html`${renderSplash(ctx, { title: 'Plan Your Visit', kicker: 'Getting Here', sub: `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`, mood: 'lively', issueHead: true })}${join(spreads.map((s, i) => renderSpread(ctx, s, i + 1)))}`;
  return page(ctx, 'Plan Your Visit', 'Hours, address, accessibility, tickets and the Sturm Family Wing at the Denver Museum of Nature & Science.', main);
}

export function renderPrograms(ctx: PageContext): string {
  const { site, events } = ctx.content;
  const panels: PanelSpec[] = [
    ...site.programLinks.map((l) => linkPanel('programs', l, { span: 'm', filter: [l.category] })),
    ...events.map((e): PanelSpec => ({
      id: `p-event-${e.id}`, span: 'm', issue: 'programs', mood: 'plain', kicker: 'Event', title: e.todo ? 'Upcoming event' : e.title, titleStyle: 'plain',
      sub: e.todo ? null : undefined, todo: e.todo, filter: [e.category],
    })),
  ];
  const spread: SpreadSpec = {
    id: 'spread-programs', kicker: 'Coming attractions', heading: 'Programs & Events', layout: 'strip', panels,
    before: filterBar('spread-programs', 'Show', [
      { value: 'events', label: 'Events & nights' },
      { value: 'kids', label: 'Camps & kids' },
      { value: 'host', label: 'Host an event' },
    ]),
  };
  const main = html`${renderSplash(ctx, { title: 'Programs & Events', kicker: 'Coming Attractions', mood: 'lively', art: 'scene-calendar', pose: 'notebook', issueHead: true })}${renderSpread(ctx, spread, 1)}`;
  return page(ctx, 'Programs & Events', 'Programs, events, camps and venue hire at the Denver Museum of Nature & Science.', main);
}

export function renderLearn(ctx: PageContext): string {
  const panels = ctx.content.site.learnLinks.map((l) => linkPanel('learn', l, { span: 'm' }));
  const spread: SpreadSpec = { id: 'spread-learn', kicker: 'Field Trips', heading: 'School Programs', headingStyle: 'plain', layout: 'strip', panels };
  const main = html`${renderSplash(ctx, { title: 'School Programs', kicker: 'Field Trips', mood: 'lively', art: 'scene-bus', pose: 'notebook', issueHead: true })}${renderSpread(ctx, spread, 1)}`;
  return page(ctx, 'School Programs', 'Onsite, offsite and virtual school programs at the Denver Museum of Nature & Science.', main);
}

export function renderScience(ctx: PageContext): string {
  const { site } = ctx.content;
  const collections: SpreadSpec = {
    id: 'collections',
    kicker: 'Behind the Glass',
    heading: 'Collections',
    layout: 'mosaic',
    panels: [
      { id: 'p-col-anthro', span: 'xl', issue: 'science', mood: 'documentary', kicker: 'Collection', title: 'Anthropology & Archaeology', art: 'scene-drawers', link: { href: site.scienceLinks[0]?.url ?? site.liveOrigin, verb: 'Collections', object: '' } },
      { id: 'p-col-paleo', span: 'm', issue: 'science', mood: 'lively', kicker: 'Collection', title: 'Paleontology & Geology', art: 'scene-trilobite', pose: 'digging', spot: 'br' },
      { id: 'p-col-zoo', span: 'm', issue: 'science', mood: 'lively', kicker: 'Collection', title: 'Vertebrate & Invertebrate Zoology', art: 'scene-beetle' },
      { id: 'p-col-archives', span: 's', issue: 'science', mood: 'plain', kicker: 'Collection', title: 'Archives', titleStyle: 'plain' },
      { id: 'p-col-digital', span: 's', issue: 'science', mood: 'plain', kicker: 'Online', title: 'DMNS Digital Collections', titleStyle: 'plain', link: { href: site.outbound.digitalCollections, verb: 'DMNS Digital Collections', object: '' } },
    ],
  };
  const more: SpreadSpec = {
    id: 'spread-research', kicker: 'In the labs', heading: 'Research & people', headingStyle: 'plain', layout: 'strip',
    panels: site.scienceLinks.filter((l) => l.label !== 'Collections').map((l) => linkPanel('science', l, { span: 'm' })),
  };
  const main = html`${renderSplash(ctx, { title: 'Science', kicker: 'Behind the Glass', mood: 'lively', art: 'scene-microscope', pose: 'loupe', issueHead: true })}${join([collections, more].map((s, i) => renderSpread(ctx, s, i + 1)))}`;
  return page(ctx, 'Science', 'Collections, labs and research at the Denver Museum of Nature & Science.', main);
}

function editorial(ctx: PageContext, issue: IssueId, title: string, intro: string, links: readonly Link[], extra: readonly Link[] = []): string {
  const list = [...links, ...extra].map((l) => html`<li>${externalLink(l.url, l.label)}</li>`);
  const main = html`<section id="splash" class="editorial" aria-labelledby="page-title"><h1 id="page-title" class="plain-heading" tabindex="-1">${title}</h1><p>${intro}</p><h2 id="${issue}-links-h">On dmns.org</h2><ul class="link-list link-list--large" aria-labelledby="${issue}-links-h">${list}</ul></section>`;
  return page(ctx, title, `${title}: ${ctx.content.site.name}.`, main);
}

export function renderAbout(ctx: PageContext): string {
  return editorial(ctx, 'about', 'About', 'Leadership, plans, careers and policies live on the museum’s website.', ctx.content.site.aboutLinks);
}

export function renderSupport(ctx: PageContext): string {
  const { outbound } = ctx.content.site;
  return editorial(ctx, 'support', 'Support', 'Membership, volunteering and giving are handled on the museum’s website.', ctx.content.site.supportLinks, [{ label: 'Donate', url: outbound.donate }]);
}

export function renderSimple(ctx: PageContext, title: string, body: string): string {
  const main = html`<section id="splash" class="editorial" aria-labelledby="page-title"><h1 id="page-title" class="plain-heading" tabindex="-1">${title}</h1><p>${body}</p><p><a href="/">Back to the Cover</a> · <a href="/visit/">Plan Your Visit</a></p></section>`;
  return page(ctx, title, body, main);
}
