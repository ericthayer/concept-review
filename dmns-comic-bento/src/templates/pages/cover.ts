/** The Cover (/): seven spreads per the page script. */
import { exhibitionPhase } from '../../lib/dates.ts';
import { hallsInBookOrder, type Exhibition, type SpreadScript } from '../../lib/content.ts';
import type { LayoutName } from '../../lib/layouts.ts';
import { specimen } from '../art.ts';
import type { PageContext } from '../context.ts';
import { renderDocument } from '../document.ts';
import { html, join } from '../html.ts';
import type { PanelSpec } from '../panel.ts';
import { renderSpread, type SpreadSpec } from '../spread.ts';
import { exhibitionPanel, hallPanel, hoursBody, ticketsPanel } from './shared.ts';

function script(ctx: PageContext, id: string): SpreadScript {
  const s = ctx.content.coverSpreads.find((x) => x.id === id);
  if (!s) throw new Error(`cover spread script missing: ${id}`);
  return s;
}

function spread(ctx: PageContext, id: string, panels: PanelSpec[], extra: Partial<SpreadSpec> = {}): SpreadSpec {
  const s = script(ctx, id);
  return { id: `spread-${s.id}`, kicker: s.kicker, heading: s.heading, layout: s.layout as LayoutName, panels, ...extra };
}

function exhibition(ctx: PageContext, slug: string): Exhibition {
  const e = ctx.content.exhibitions.find((x) => x.slug === slug);
  if (!e) throw new Error(`exhibition missing: ${slug}`);
  return e;
}

export function renderCover(ctx: PageContext): string {
  const { site, halls } = ctx.content;
  const mythic = exhibition(ctx, 'mythic-creatures');
  const mythicOpen = exhibitionPhase(mythic.opens, mythic.closes, ctx.today) === 'open';
  const coverScript = script(ctx, 'cover');

  const coverSpread: SpreadSpec = {
    id: 'spread-cover',
    heading: coverScript.kicker,
    headingStyle: 'hidden',
    layout: 'cover',
    panels: [
      {
        id: 'p-cover-title', span: 'xl', issue: 'cover', mood: 'lively', kicker: coverScript.kicker,
        title: coverScript.heading, headingLevel: 'h1', art: 'scene-notebook', pose: 'tumbling', spot: 'tr',
        balloon: 'Oof. Page one already?',
      },
      { id: 'p-cover-hours', span: 'm', issue: 'visit', mood: 'plain', title: 'Today’s hours', titleStyle: 'plain', headingLevel: 'h2', body: hoursBody(ctx), link: { href: '/visit/', verb: 'Plan Your Visit', object: '' } },
      { ...ticketsPanel(ctx, 'p-cover-tickets'), headingLevel: 'h2' },
      {
        id: 'p-cover-now', span: 's', issue: 'special', mood: 'plain', pop: 'magenta', kicker: mythicOpen ? 'Now open' : mythic.dateLabel,
        title: mythic.shortName, headingLevel: 'h2', link: { href: `/special-exhibitions/${mythic.slug}/`, verb: 'Enter', object: mythic.shortName }, destination: mythic.slug,
      },
    ],
  };

  const mythicSpread = spread(ctx, 'mythic', [
    {
      id: 'p-mythic', span: 'xl', issue: 'special', mood: 'lively', pop: 'magenta', kicker: mythic.dateLabel, title: mythic.shortName,
      sub: 'Dragons, Unicorns & Mermaids', lean: true, destination: mythic.slug,
      beats: {
        sentence: 'Here be dragons, unicorns and mermaids.',
        items: [
          { art: 'scene-dragon', label: 'Here be dragons' },
          { art: 'scene-unicorn', label: 'Here be unicorns' },
          { art: 'scene-mermaid', label: 'Here be mermaids' },
        ],
      },
      link: { href: `/special-exhibitions/${mythic.slug}/`, verb: 'Enter', object: mythic.name },
    },
    {
      id: 'p-mythic-issue', span: 'm', issue: 'special', mood: 'lively', pop: 'green', kicker: 'Special Edition', title: 'Special Exhibitions',
      art: 'scene-lanterns', pose: 'notebook', spot: 'br', balloon: 'I’m taking notes. For science.', lean: true,
      link: { href: '/special-exhibitions/', verb: 'See all', object: 'Special Exhibitions' }, destination: 'special',
    },
    { ...ticketsPanel(ctx, 'p-mythic-tickets'), span: 'm', lean: true },
    { id: 'p-mythic-theaters', span: 's', issue: 'theaters', mood: 'plain', kicker: 'Now Screening', title: 'Theaters', link: { href: '/theaters/', verb: 'See', object: 'Theaters' }, destination: 'theaters' },
    { id: 'p-mythic-members', span: 's', issue: 'support', mood: 'plain', kicker: 'Members', title: 'Membership', link: { href: site.outbound.membership, verb: 'Become a Member', object: '' } },
  ]);

  const waysIn = spread(ctx, 'ways-in', [
    { id: 'p-door-halls', span: 't', issue: 'halls', mood: 'lively', pop: 'blue', kicker: 'Issue: The Halls', title: 'Halls', sub: 'Permanent exhibitions on three floors and outdoors.', art: 'scene-gem', pose: 'loupe', spot: 'bl', link: { href: '/halls/', verb: 'Enter', object: 'the Halls' }, destination: 'halls' },
    { id: 'p-door-special', span: 't', issue: 'special', mood: 'lively', pop: 'magenta', kicker: 'Special Edition', title: 'Special Exhibitions', sub: 'Limited-run exhibitions and evening events.', art: 'scene-unicorn', link: { href: '/special-exhibitions/', verb: 'Enter', object: 'Special Exhibitions' }, destination: 'special' },
    { id: 'p-door-theaters', span: 't', issue: 'theaters', mood: 'lively', pop: 'blue', kicker: 'Now Screening', title: 'Theaters', sub: 'Gates Planetarium, Sturm Infinity Theater and Laser Shows.', art: 'scene-dome', link: { href: '/theaters/', verb: 'Enter', object: 'Theaters' }, destination: 'theaters' },
  ]);

  const ordered = hallsInBookOrder(halls);
  let lastFloor = '';
  let step = -1;
  const stairPanels: PanelSpec[] = ordered.map((h) => {
    const floor = h.floors[0] ?? 'tbd';
    const group = floor === 'tbd' || floor === 'outdoor' ? 'beyond' : floor;
    const starts = group !== lastFloor;
    if (starts) step += 1;
    lastFloor = group;
    const base = hallPanel(h, { span: 's', art: false, id: `p-stair-${h.slug}` });
    return { ...base, pop: null, pose: null, stepStart: starts ? step : undefined, sub: undefined } as PanelSpec;
  });
  const floors = spread(ctx, 'floors', stairPanels, {
    decor: html`<div class="stair-climber" aria-hidden="true">${specimen(ctx, 'climbing', 'center')}</div>`,
  });

  const coming = spread(ctx, 'coming', [
    ...['changing-landscapes', 'magical-winter-nights', 'pokemon-fossil-museum'].map((slug) => exhibitionPanel(ctx, exhibition(ctx, slug), { span: 'm', id: `p-coming-${slug}` })),
    ...ctx.content.events.map((e): PanelSpec => ({
      id: `p-coming-${e.id}`, span: 'm', issue: 'programs', mood: 'plain', kicker: 'Programs & Events', title: e.todo ? 'Upcoming event' : e.title,
      sub: e.todo ? null : undefined, todo: e.todo, link: { href: '/programs/', verb: 'See', object: 'Programs' },
    })),
  ]);

  const science = spread(ctx, 'science', [
    { id: 'p-glass-paleo', span: 't', issue: 'science', mood: 'lively', pop: 'orange', kicker: 'Collections', title: 'Paleontology & Geology', art: 'scene-trilobite', link: { href: '/science/', verb: 'Go behind the glass', object: 'Science' }, destination: 'science' },
    { id: 'p-glass-anthro', span: 't', issue: 'science', mood: 'documentary', kicker: 'Collections', title: 'Anthropology & Archaeology', art: 'scene-drawers', link: { href: '/science/#collections', verb: 'Read about', object: 'the collections' } },
    { id: 'p-glass-zoo', span: 't', issue: 'science', mood: 'lively', pop: 'green', kicker: 'Collections', title: 'Vertebrate & Invertebrate Zoology', art: 'scene-beetle', pose: 'loupe', spot: 'br', link: { href: '/science/#collections', verb: 'Read about', object: 'the collections' } },
  ]);

  const visitLink = (label: string): string => site.visitLinks.find((l) => l.label === label)?.url ?? '/visit/';
  const gettingHere = spread(ctx, 'getting-here', [
    { id: 'p-visit-hours', span: 'xl', issue: 'visit', mood: 'plain', title: 'Hours', titleStyle: 'plain', body: hoursBody(ctx), link: { href: '/visit/', verb: 'Plan Your Visit', object: '' } },
    { id: 'p-visit-address', span: 'm', issue: 'visit', mood: 'plain', title: 'Address', titleStyle: 'plain', body: html`<address>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postal}</address>` },
    { id: 'p-visit-getting-here', span: 'm', issue: 'visit', mood: 'plain', title: 'Getting Here', titleStyle: 'plain', link: { href: visitLink('Getting Here'), verb: 'Getting Here', object: '' } },
    { id: 'p-visit-access', span: 's', issue: 'visit', mood: 'plain', title: 'Accessibility', titleStyle: 'plain', link: { href: visitLink('Accessibility'), verb: 'Accessibility', object: '' } },
    { id: 'p-visit-sturm', span: 's', issue: 'visit', mood: 'plain', title: 'Sturm Family Wing', titleStyle: 'plain', sub: site.sturmWing.tagline, link: { href: '/visit/#sturm-family-wing', verb: 'Sturm Family Wing', object: '' } },
  ]);

  const spreads = [coverSpread, mythicSpread, waysIn, floors, coming, science, gettingHere];
  const main = join(spreads.map((s, i) => renderSpread(ctx, s, i)));
  return renderDocument(ctx, {
    title: 'Home',
    description: `Concept redesign of the ${site.name} website: halls, special exhibitions, theaters, hours and tickets.`,
    main,
  });
}
