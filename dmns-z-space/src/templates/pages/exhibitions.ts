/** Special Exhibitions Gallery and one page per exhibition. */
import type { Exhibition } from '../../lib/content-types.js';
import { exhibitionPhase, type ExhibitionPhase } from '../../lib/dates.js';
import type { BuildContext } from '../context.js';
import { copy, html, type SafeHtml } from '../html.js';
import { page } from '../layout.js';
import { outbound, plate } from '../partials.js';
import { backLinks, mediaFor, pageHeader } from './shared.js';

const PHASE_LABEL: Readonly<Record<ExhibitionPhase, string>> = { now: 'Now open', coming: 'Coming', closed: 'Closed' };

function card(ctx: BuildContext, e: Exhibition): SafeHtml {
  const phase = exhibitionPhase(e, ctx.today);
  const key = `exhibition-${e.slug}`;
  return html`<li class="exhibit-card" data-phase="${phase}" data-kind="${e.kind}" data-filter-item>
    <a class="exhibit-card__link" href="/special-exhibitions/${e.slug}/" data-doorway>
      ${plate(mediaFor(ctx, e.media), { wing: 'special', morph: key, className: 'exhibit-card__plate' })}
      <span class="exhibit-card__status label">${phase === 'coming' ? (e.comingLabel ?? PHASE_LABEL.coming) : PHASE_LABEL[phase]}${e.kind === 'event' ? ' · Event' : ''}</span>
      <h2 class="exhibit-card__title" data-morph-title="${key}">${e.name}</h2>
      <p class="exhibit-card__date label">${e.dateLabel}</p>
    </a>
  </li>`;
}

export function renderExhibitions(ctx: BuildContext): string {
  const { site, exhibitions } = ctx.content;
  const p = site.pages.specialExhibitions;
  const visible = exhibitions.filter((e) => exhibitionPhase(e, ctx.today) !== 'closed');
  const body = html`
  ${pageHeader(p.title, p.lede ?? null, 'Special Exhibitions')}
  <section class="gallery" aria-label="${p.title}">
    <div class="filter" role="group" aria-label="Filter exhibitions" data-filter hidden>
      <button type="button" class="filter__button" data-filter-value="all" aria-pressed="true">All</button>
      <button type="button" class="filter__button" data-filter-value="now" aria-pressed="false">Now open</button>
      <button type="button" class="filter__button" data-filter-value="coming" aria-pressed="false">Coming</button>
    </div>
    <p class="visually-hidden" data-filter-status aria-live="polite"></p>
    <ul class="exhibit-grid" role="list" data-filter-list>${visible.map((e) => card(ctx, e))}</ul>
  </section>`;
  return page(ctx, { path: '/special-exhibitions/', title: p.title, room: p.title, description: p.lede ?? p.title, bodyClass: 'page-gallery' }, body);
}

export function renderExhibition(ctx: BuildContext, e: Exhibition): string {
  const { site } = ctx.content;
  const key = `exhibition-${e.slug}`;
  const phase = exhibitionPhase(e, ctx.today);
  const body = html`
  <article class="exhibit" data-wing="special">
    <section class="hall-hero hall-hero--exhibit" id="hall-hero" aria-labelledby="exhibit-title">
      <div class="hall-hero__spotlight" aria-hidden="true"></div>
      ${plate(mediaFor(ctx, e.media), { wing: 'special', morph: key, priority: true, className: 'hall-hero__plate' })}
      <div class="hall-hero__text">
        <p class="hall-hero__meta label">${phase === 'coming' ? (e.comingLabel ?? PHASE_LABEL.coming) : PHASE_LABEL[phase]}<span aria-hidden="true"> · </span>${e.dateLabel}</p>
        <h1 id="exhibit-title" class="display hall-hero__title hall-hero__title--long" data-morph-title="${key}">${e.name}</h1>
      </div>
    </section>
    <section class="diorama" aria-labelledby="exhibit-about">
      <div class="diorama__backdrop" aria-hidden="true"></div>
      <div class="diorama__label wall-label" data-wing="special">
        <h2 id="exhibit-about" class="wall-label__name">About the exhibition</h2>
        <p class="wall-label__meta">${e.kind === 'event' ? 'Evening event' : 'Special exhibition'}<span aria-hidden="true"> · </span>${e.dateLabel}</p>
        <p class="wall-label__text">${copy(e.description)}</p>
        ${e.thirdPartyIp ? html`<p class="wall-label__note">Shown by name only in this concept. No third-party imagery or marks are used.</p>` : ''}
        <p>${outbound(site.outbound.tickets, 'button button--ticket')}</p>
      </div>
    </section>
    ${backLinks([
      { href: '/special-exhibitions/', label: 'Back to Special Exhibitions' },
      { href: '/', label: 'Back to the Atrium' },
    ])}
  </article>`;
  return page(
    ctx,
    { path: `/special-exhibitions/${e.slug}/`, title: e.name, room: e.name.split(':')[0] ?? e.name, description: `${e.name}. ${e.dateLabel}.`, bodyClass: 'page-exhibit', expect: 'hall-hero' },
    body,
  );
}
