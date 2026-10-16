/** The Atrium (homepage) sequence, §7. */
import { activeNotices, exhibitionPhase } from '../../lib/dates.js';
import { isTodo, type Exhibition } from '../../lib/content-types.js';
import type { BuildContext } from '../context.js';
import { copy, html, type SafeHtml } from '../html.js';
import { arrowLeft, arrowRight } from '../icons.js';
import { eyebrow, outbound, plate } from '../partials.js';
import { page } from '../layout.js';
import { mediaFor } from './shared.js';

function doorway(href: string, title: string, lede: string, wing: string, index: number): SafeHtml {
  return html`<li class="doorways__item">
    <dmns-doorway class="doorway" data-wing="${wing}">
      <a class="doorway__portal" href="${href}" data-doorway>
        <span class="doorway__room" aria-hidden="true"><span class="doorway__glow"></span></span>
        <span class="doorway__index" aria-hidden="true">0${index + 1}</span>
        <span class="doorway__title">${title}</span>
        <span class="doorway__lede">${copy(lede)}</span>
      </a>
    </dmns-doorway>
  </li>`;
}

function showingPlate(ctx: BuildContext, e: Exhibition): SafeHtml {
  const phase = exhibitionPhase(e, ctx.today);
  return html`<li class="showing__item showing__item--${phase}">
    <a class="showing__link" href="/special-exhibitions/${e.slug}/" data-doorway>
      ${plate(mediaFor(ctx, e.media), { wing: 'special', morph: `exhibition-${e.slug}` })}
      <span class="showing__status">${phase === 'coming' ? (e.comingLabel ?? 'Coming') : 'Now showing'}</span>
      <span class="showing__name" data-morph-title="exhibition-${e.slug}">${e.name}</span>
      <span class="showing__date">${e.dateLabel}</span>
    </a>
  </li>`;
}

export function renderAtrium(ctx: BuildContext): string {
  const { site, exhibitions, events, notices } = ctx.content;
  const p = site.pages;
  const showing = exhibitions.filter((e) => exhibitionPhase(e, ctx.today) !== 'closed');
  const now = showing.filter((e) => exhibitionPhase(e, ctx.today) === 'now');
  const coming = showing.filter((e) => exhibitionPhase(e, ctx.today) === 'coming');
  const live = activeNotices(notices, ctx.today);

  const body = html`
  <section class="arrival" aria-labelledby="atrium-title">
    <div class="arrival__spotlight" aria-hidden="true"></div>
    <h1 id="atrium-title" class="display arrival__title">${p.atrium.headline}</h1>
    <p class="arrival__hours label">${site.hours.daily}<span aria-hidden="true"> · </span><br class="arrival__break">${site.hours.extended}</p>
    <p class="arrival__cta"><a class="button button--ticket button--large" href="${site.outbound.tickets.href}" rel="external">${site.outbound.tickets.label}<span class="visually-hidden"> (dmns.org)</span></a></p>
  </section>

  <section class="doorways" aria-labelledby="doorways-title">
    <h2 id="doorways-title" class="section-title">${p.atrium.doorwaysHeading}</h2>
    <ul class="doorways__list" role="list">
      ${doorway('/halls/', 'Halls', p.halls.lede ?? '', 'space', 0)}
      ${doorway('/special-exhibitions/', 'Special Exhibitions', p.specialExhibitions.lede ?? '', 'special', 1)}
      ${doorway('/theaters/', 'Theaters', p.theaters.lede ?? '', 'theaters', 2)}
    </ul>
  </section>

  <section class="showing" aria-labelledby="showing-title">
    <h2 id="showing-title" class="section-title">${p.atrium.nowShowingHeading}</h2>
    <ul class="showing__now" role="list">${now.map((e) => showingPlate(ctx, e))}</ul>
    <ul class="showing__coming" role="list">${coming.map((e) => showingPlate(ctx, e))}</ul>
  </section>

  ${live.length
    ? html`<section class="notices-strip" aria-labelledby="notices-title">
        <h2 id="notices-title" class="section-title section-title--small">Notices</h2>
        <ul role="list">${live.map((n) => html`<li>${n.hall ? html`<a href="/halls/${n.hall}/">${n.message}</a>` : n.message}</li>`)}</ul>
      </section>`
    : ''}

  <section class="events" aria-labelledby="events-title">
    <h2 id="events-title" class="section-title">${p.atrium.eventsHeading}</h2>
    <dmns-event-corridor class="corridor">
      <div class="corridor__controls" data-controls hidden>
        <button type="button" class="icon-button" data-dir="-1" aria-controls="events-track" aria-label="Previous events">${arrowLeft}</button>
        <button type="button" class="icon-button" data-dir="1" aria-controls="events-track" aria-label="Next events">${arrowRight}</button>
      </div>
      <ol id="events-track" class="corridor__track" role="list" tabindex="0" aria-label="${p.atrium.eventsHeading}">
        ${events.map(
          (e) => html`<li class="corridor__item">
            ${isTodo(e.dateLabel) ? '' : html`<p class="corridor__date label">${e.dateLabel}</p>`}
            <h3 class="corridor__name">${copy(e.name)}</h3>
            ${isTodo(e.location) ? '' : html`<p class="corridor__where">${e.location}</p>`}
          </li>`,
        )}
      </ol>
    </dmns-event-corridor>
    <p class="events__more"><a href="/programs/">All programs &amp; events</a></p>
  </section>

  <section class="glass-teaser" aria-labelledby="glass-title">
    ${plate(mediaFor(ctx, 'behind-the-glass'), { wing: 'science', className: 'glass-teaser__plate' })}
    <div class="glass-teaser__text">
      ${eyebrow('Science')}
      <h2 id="glass-title" class="section-title">${p.atrium.behindGlassHeading}</h2>
      <p class="lede">${p.science.lede ?? ''}</p>
      <ul class="link-list" role="list">
        <li><a href="/science/" data-doorway>Collections &amp; research</a></li>
        <li>${outbound(site.outbound.digitalCollections)}</li>
      </ul>
    </div>
  </section>

  <section class="visit-block" aria-labelledby="visit-title">
    <h2 id="visit-title" class="section-title">${p.atrium.visitHeading}</h2>
    <dl class="facts">
      <div><dt class="label">Hours</dt><dd>${site.hours.daily}<br>${site.hours.extended}<br>${site.hours.closed}</dd></div>
      <div><dt class="label">Address</dt><dd><address>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}</address></dd></div>
    </dl>
    <ul class="link-list" role="list">
      <li><a href="/visit/#getting-here">Getting here</a></li>
      <li><a href="/visit/#accessibility">Accessibility</a></li>
      <li><a href="/visit/">Plan your visit</a></li>
    </ul>
  </section>`;

  return page(
    ctx,
    { path: '/', title: p.atrium.title, room: p.atrium.title, description: `${site.name}. ${site.hours.daily}. ${site.address.street}, ${site.address.city}.`, bodyClass: 'page-atrium' },
    body,
  );
}
