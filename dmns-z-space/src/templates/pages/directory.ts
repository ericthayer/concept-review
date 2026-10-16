/** Directory: the interactive floorplan, §4 / §8 <dmns-floorplan>. */
import type { Hall } from '../../lib/content-types.js';
import type { BuildContext } from '../context.js';
import { copy, html, type SafeHtml } from '../html.js';
import { page } from '../layout.js';
import { plate } from '../partials.js';
import { mediaFor, pageHeader } from './shared.js';

function hallCard(ctx: BuildContext, hall: Hall): SafeHtml {
  const key = `hall-${hall.slug}`;
  const sealed = hall.status === 'sealed';
  return html`<li class="hall-card${sealed ? ' hall-card--sealed' : ''}" data-wing="${hall.wing}">
    <a class="hall-card__link" href="/halls/${hall.slug}/" data-doorway>
      ${plate(mediaFor(ctx, hall.media), { wing: hall.wing, morph: key, className: 'hall-card__plate' })}
      ${sealed ? html`<span class="scrim" aria-hidden="true"></span>` : ''}
      <span class="hall-card__meta label">${copy(hall.floorLabel)}${sealed ? ' · Under renovation' : ''}</span>
      <h3 class="hall-card__title" data-morph-title="${key}">${hall.name}</h3>
      <p class="hall-card__text">${hall.description}</p>
    </a>
  </li>`;
}

/** Decorative outline of one floor; the rooms themselves are the list beside it. */
function floorOutline(floor: number): SafeHtml {
  return html`<svg class="floorplan__outline" viewBox="0 0 320 120" aria-hidden="true" focusable="false">
    <path d="M20 90 L160 20 L300 90 L160 110 Z" />
    <path class="floorplan__outline-inner" d="M70 86 L160 42 L250 86 L160 100 Z" />
    <text x="24" y="112" class="floorplan__outline-num">${floor === 0 ? 'OUT' : `F${floor}`}</text>
  </svg>`;
}

export function renderDirectory(ctx: BuildContext): string {
  const { halls, site } = ctx.content;
  const upper = halls.upperLevel;
  const upperHall = halls.halls.find((h) => h.slug === upper.hall);
  const sealed = halls.halls.filter((h) => h.status === 'sealed');

  const floors = halls.floors.map((floor) => {
    const rooms = halls.halls.filter((h) => h.floor === floor.floor && h.status !== 'sealed');
    const id = `floor-${floor.floor}`;
    return html`<section class="floorplan__floor" id="${id}" data-floor="${floor.floor}" data-wing="${floor.wing}" aria-labelledby="${id}-title">
      ${floorOutline(floor.floor)}
      <h2 class="floorplan__floor-title" id="${id}-title" tabindex="-1">${floor.name} <span class="floorplan__theme">${floor.theme}</span></h2>
      <ul class="hall-grid" role="list">
        ${rooms.map((h) => hallCard(ctx, h))}
        ${upperHall && upper.floor === floor.floor
          ? html`<li class="hall-card hall-card--stair" data-wing="${upperHall.wing}">
              <a class="hall-card__link" href="/halls/${upperHall.slug}/#${upper.anchor}">
                <span class="hall-card__meta label">Stairs · continues from Floor ${upperHall.floor ?? ''}</span>
                <h3 class="hall-card__title">${upper.name}</h3>
                <p class="hall-card__text">${upperHall.description}</p>
              </a>
            </li>`
          : ''}
      </ul>
    </section>`;
  });

  const body = html`
  ${pageHeader(site.pages.halls.title, site.pages.halls.lede ?? null, 'Permanent halls')}
  <dmns-floorplan class="floorplan">
    <div class="floorplan__switcher" role="group" aria-label="Choose a floor" data-switcher hidden>
      ${halls.floors.map(
        (f) => html`<button type="button" class="floor-button" data-show-floor="${f.floor}" aria-controls="floor-${f.floor}" aria-pressed="false">
          <span class="floor-button__num">${f.floor === 0 ? 'Out' : f.floor}</span><span class="floor-button__name">${f.theme}</span>
        </button>`,
      )}
    </div>
    <p class="visually-hidden" data-floor-status aria-live="polite"></p>
    <div class="floorplan__stage">${floors}</div>
  </dmns-floorplan>
  ${sealed.length
    ? html`<section class="sealed-list" aria-labelledby="sealed-title">
        <h2 id="sealed-title" class="section-title section-title--small">${halls.sealedHeading}</h2>
        <ul class="hall-grid" role="list">${sealed.map((h) => hallCard(ctx, h))}</ul>
      </section>`
    : ''}`;

  return page(
    ctx,
    { path: '/halls/', title: site.pages.halls.title, room: site.pages.halls.title, description: site.pages.halls.lede ?? site.pages.halls.title, bodyClass: 'page-directory' },
    body,
  );
}
