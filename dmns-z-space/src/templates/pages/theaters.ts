/** Theaters & Dome index and one page per theater. */
import type { Theater } from '../../lib/content-types.js';
import type { BuildContext } from '../context.js';
import { copy, html } from '../html.js';
import { page } from '../layout.js';
import { outbound, plate } from '../partials.js';
import { backLinks, mediaFor, pageHeader } from './shared.js';

export function renderTheaters(ctx: BuildContext): string {
  const { site, theaters } = ctx.content;
  const p = site.pages.theaters;
  const body = html`
  ${pageHeader(p.title, p.lede ?? null, 'Theaters')}
  <ul class="exhibit-grid" role="list">
    ${theaters.map(
      (t) => html`<li class="exhibit-card" data-wing="theaters">
        <a class="exhibit-card__link" href="/theaters/${t.slug}/" data-doorway>
          ${plate(mediaFor(ctx, t.media), { wing: 'theaters', className: 'exhibit-card__plate' })}
          ${t.ticketNote ? html`<span class="exhibit-card__status label">${t.ticketNote}</span>` : ''}
          <h2 class="exhibit-card__title">${t.name}</h2>
          <p class="exhibit-card__text">${copy(t.description)}</p>
        </a>
      </li>`,
    )}
  </ul>`;
  return page(ctx, { path: '/theaters/', title: p.title, room: p.title, description: p.lede ?? p.title, bodyClass: 'page-theaters' }, body);
}

export function renderTheater(ctx: BuildContext, t: Theater): string {
  const { site } = ctx.content;
  const body = html`
  <article class="exhibit" data-wing="theaters">
    <section class="hall-hero hall-hero--exhibit" id="hall-hero" aria-labelledby="theater-title">
      <div class="hall-hero__spotlight" aria-hidden="true"></div>
      ${plate(mediaFor(ctx, t.media), { wing: 'theaters', priority: true, className: 'hall-hero__plate' })}
      <div class="hall-hero__text">
        <p class="hall-hero__meta label">Theaters &amp; Dome${t.ticketNote ? html`<span aria-hidden="true"> · </span>${t.ticketNote}` : ''}</p>
        <h1 id="theater-title" class="display hall-hero__title">${t.name}</h1>
      </div>
    </section>
    <section class="diorama" aria-labelledby="theater-about">
      <div class="diorama__backdrop" aria-hidden="true"></div>
      <div class="diorama__label wall-label" data-wing="theaters">
        <h2 id="theater-about" class="wall-label__name">What's showing</h2>
        <p class="wall-label__meta">Films &amp; shows</p>
        <p class="wall-label__text">${copy(t.description)}</p>
        <p>${outbound(site.outbound.tickets, 'button button--ticket')}</p>
      </div>
    </section>
    ${backLinks([
      { href: '/theaters/', label: 'Back to Theaters & Dome' },
      { href: '/', label: 'Back to the Atrium' },
    ])}
  </article>`;
  return page(ctx, { path: `/theaters/${t.slug}/`, title: t.name, room: t.name, description: `${t.name}. ${site.pages.theaters.title}.`, bodyClass: 'page-theater', expect: 'hall-hero' }, body);
}
