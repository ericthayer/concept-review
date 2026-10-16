/** One permanent hall: hero in darkness, dioramas, vitrines, exit doorways (§3.4). */
import { isTodo, type Hall } from '../../lib/content-types.js';
import { activeNotices } from '../../lib/dates.js';
import type { BuildContext } from '../context.js';
import { copy, html, type SafeHtml } from '../html.js';
import { arrowLeft, arrowRight, stairIcon } from '../icons.js';
import { page } from '../layout.js';
import { plate, wallLabel } from '../partials.js';
import { mediaFor } from './shared.js';

/** Walk order: floor by floor, corridor order within a floor. Floor edges become stairs. */
function neighbours(ctx: BuildContext, hall: Hall): { prev: Hall | undefined; next: Hall | undefined } {
  const walk = ctx.content.halls.halls
    .filter((h) => h.status === 'open' && h.floor !== null)
    .map((h, order) => ({ h, order }))
    .sort((a, b) => (a.h.floor ?? 0) - (b.h.floor ?? 0) || a.order - b.order)
    .map(({ h }) => h);
  const i = walk.findIndex((h) => h.slug === hall.slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return { prev: walk[i - 1], next: walk[i + 1] };
}

function exitDoor(hall: Hall | undefined, dir: 'prev' | 'next', from: Hall): SafeHtml {
  if (!hall) return html`<li class="exit-doors__item exit-doors__item--empty" aria-hidden="true"></li>`;
  const stairs = hall.floor !== from.floor;
  const kind = stairs ? (dir === 'prev' ? 'Stairs down' : 'Stairs up') : dir === 'prev' ? 'Previous hall' : 'Next hall';
  return html`<li class="exit-doors__item exit-doors__item--${dir}" data-wing="${hall.wing}">
    <a class="exit-door" href="/halls/${hall.slug}/" rel="${dir}" data-doorway>
      <span class="exit-door__kind label">${dir === 'prev' ? arrowLeft : ''}${stairs ? stairIcon : ''}${kind}${dir === 'next' ? arrowRight : ''}</span>
      <span class="exit-door__name">${hall.shortName ?? hall.name}</span>
      <span class="exit-door__floor label">${hall.floorLabel}</span>
    </a>
  </li>`;
}

function vitrine(ctx: BuildContext, hall: Hall, n: number): SafeHtml {
  const { objectPlateName, objectPlateMeta, objectPlateText } = ctx.content.halls;
  const id = `${hall.slug}-object-${n}`;
  const media = mediaFor(ctx, `object-plate-${n}`);
  // One TODO marker per label: unknown metadata/text is omitted rather than repeated.
  const meta = isTodo(objectPlateMeta) ? [] : [objectPlateMeta];
  const text = isTodo(objectPlateText) ? undefined : objectPlateText;
  return html`<li class="vitrines__item">
    <dmns-vitrine class="vitrine" data-wing="${hall.wing}">
      <figure class="vitrine__case">
        ${plate(media, { wing: hall.wing, className: 'vitrine__plate' })}
        <figcaption>${wallLabel({ id: `${id}-name`, name: objectPlateName, meta, ...(text ? { text } : {}), headingLevel: 3, wing: hall.wing, className: 'wall-label--case' })}</figcaption>
      </figure>
      <button type="button" class="vitrine__open" data-open aria-haspopup="dialog" aria-describedby="${id}-name" hidden>Step up to the case</button>
      <dialog class="vitrine__dialog" aria-labelledby="${id}-dialog-name">
        <div class="vitrine__dialog-inner">
          ${plate(media, { wing: hall.wing, className: 'vitrine__dialog-plate' })}
          ${wallLabel({ id: `${id}-dialog-name`, name: objectPlateName, meta: [...meta, hall.name], ...(text ? { text } : {}), headingLevel: 2, wing: hall.wing })}
          <form method="dialog"><button class="button" value="close">Close</button></form>
        </div>
      </dialog>
    </dmns-vitrine>
  </li>`;
}

function sealedBody(hall: Hall, ctx: BuildContext): SafeHtml {
  return html`<dmns-sealed-hall class="sealed-hall" data-wing="${hall.wing}">
    <div class="sealed-hall__scrim" aria-hidden="true"></div>
    <div class="sealed-hall__message">
      <p class="label">Under renovation</p>
      <p class="sealed-hall__text">${hall.description}</p>
      <p class="sealed-hall__floor label">Location: ${copy(hall.floorLabel)}</p>
      <p><a href="/halls/">Back to the Directory</a></p>
    </div>
  </dmns-sealed-hall>
  ${copyNote(ctx)}`;
}

function copyNote(ctx: BuildContext): SafeHtml {
  return html`<p class="hall__concept-note">${ctx.content.site.conceptNote}</p>`;
}

export function renderHall(ctx: BuildContext, hall: Hall): string {
  const key = `hall-${hall.slug}`;
  const path = `/halls/${hall.slug}/`;
  const sealed = hall.status === 'sealed';
  const notices = activeNotices(ctx.content.notices, ctx.today).filter((n) => n.hall === hall.slug);
  const { prev, next } = neighbours(ctx, hall);
  const upper = ctx.content.halls.upperLevel;
  const plates = Array.from({ length: ctx.content.halls.objectPlates }, (_, i) => i + 1);

  const body = html`
  <article class="hall${sealed ? ' hall--sealed' : ''}" data-wing="${hall.wing}">
    <section class="hall-hero" id="hall-hero" aria-labelledby="hall-title">
      <div class="hall-hero__spotlight" aria-hidden="true"></div>
      ${plate(mediaFor(ctx, hall.media), { wing: hall.wing, morph: key, priority: true, className: 'hall-hero__plate' })}
      <div class="hall-hero__text">
        <p class="hall-hero__meta label">${copy(hall.floorLabel)}<span aria-hidden="true"> · </span>Permanent hall</p>
        <h1 id="hall-title" class="display hall-hero__title" data-morph-title="${key}">${hall.name}</h1>
      </div>
    </section>
    ${notices.map((n) => html`<p class="hall__notice" role="note"><span class="label">Notice</span> ${n.message}</p>`)}
    ${sealed
      ? sealedBody(hall, ctx)
      : html`
    <section class="diorama" aria-labelledby="${hall.slug}-about">
      <div class="diorama__backdrop" aria-hidden="true"></div>
      <div class="diorama__specimen" aria-hidden="true"><span class="diorama__beam"></span></div>
      ${wallLabel({ id: `${hall.slug}-about`, name: 'About this hall', meta: [hall.floorLabel, ctx.content.halls.floors.find((f) => f.floor === hall.floor)?.theme ?? ''], text: hall.description, headingLevel: 2, wing: hall.wing, className: 'diorama__label' })}
    </section>
    <section class="vitrines" aria-labelledby="${hall.slug}-objects">
      <h2 id="${hall.slug}-objects" class="section-title">In the cases</h2>
      <ul class="vitrines__list" role="list">${plates.map((n) => vitrine(ctx, hall, n))}</ul>
    </section>
    ${hall.slug === upper.hall
      ? html`<section class="diorama diorama--upper" id="${upper.anchor}" aria-labelledby="${upper.anchor}-title">
          <div class="diorama__backdrop" aria-hidden="true"></div>
          ${wallLabel({ id: `${upper.anchor}-title`, name: upper.name, meta: [`Floor ${upper.floor}`], text: hall.description, headingLevel: 2, wing: hall.wing, className: 'diorama__label' })}
        </section>`
      : ''}`}
    <nav class="exit-doors" aria-label="Exit doorways">
      <ul role="list">
        ${exitDoor(prev, 'prev', hall)}
        <li class="exit-doors__item exit-doors__item--atrium">
          <a class="exit-door exit-door--atrium" href="/"><span class="exit-door__kind label">Exit</span><span class="exit-door__name">Back to the Atrium</span></a>
        </li>
        ${exitDoor(next, 'next', hall)}
      </ul>
      <p class="exit-doors__directory"><a href="/halls/">Back to the Directory</a></p>
    </nav>
  </article>`;

  return page(
    ctx,
    { path, title: hall.name, room: hall.shortName ?? hall.name, description: hall.description, bodyClass: `page-hall${sealed ? ' page-hall--sealed' : ''}`, expect: 'hall-hero' },
    body,
  );
}
