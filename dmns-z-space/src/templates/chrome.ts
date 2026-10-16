/** Persistent chrome: header, notice banner, minimap HUD, footer. */
import type { Content, Notice } from '../lib/content-types.js';
import type { RoutePosition } from '../lib/coordinates.js';
import { activeNotices } from '../lib/dates.js';
import type { BuildContext } from './context.js';
import { attrs, copy, html, type SafeHtml } from './html.js';
import { outbound } from './partials.js';

function isCurrentSection(path: string, href: string): boolean {
  return href !== '/' && path.startsWith(href);
}

export function header(ctx: BuildContext, path: string): SafeHtml {
  const { site } = ctx.content;
  return html`<header class="site-header">
    <dmns-header class="site-header__inner">
      <a class="wordmark" href="/"${attrs({ 'aria-current': path === '/' ? 'page' : null })}>
        <span class="wordmark__mark">${site.shortName}</span>
        <span class="wordmark__name">${site.name}</span>
      </a>
      <nav class="primary-nav" aria-label="Primary">
        <ul role="list">
          ${site.primaryNav.map(
            (link) => html`<li><a href="${link.href}"${attrs({
              'aria-current': path === link.href ? 'page' : isCurrentSection(path, link.href) ? 'true' : null,
            })}>${link.label}</a></li>`,
          )}
        </ul>
      </nav>
      <div class="site-header__tools">
        <nav class="secondary-nav" aria-label="Support the museum">
          <ul role="list">${site.secondaryNav.map((id) => html`<li>${outbound(site.outbound[id])}</li>`)}</ul>
        </nav>
        <div class="site-header__toggles" data-toggles hidden>
          <button type="button" class="toggle" data-stillness-toggle aria-pressed="false">Stillness</button>
          <button type="button" class="toggle" data-theme-toggle aria-pressed="false">Daylight</button>
        </div>
        <a class="button button--ticket" href="${site.outbound.tickets.href}" rel="external" data-hud="ticket">${site.outbound.tickets.label}<span class="visually-hidden"> (dmns.org)</span></a>
      </div>
    </dmns-header>
  </header>`;
}

export function noticeBanner(notices: readonly Notice[], today: BuildContext['today']): SafeHtml {
  const live = activeNotices(notices, today);
  return html`<dmns-notice class="notice-banner" role="region" aria-label="Today's notice"${attrs({ hidden: live.length === 0 })}>
    <div class="notice-banner__live" aria-live="polite">
      ${live.map(
        (n) => html`<p class="notice-banner__item" data-notice-id="${n.id}" data-end="${n.end}">
          <span class="notice-banner__label">Notice</span>
          ${n.hall ? html`<a href="/halls/${n.hall}/">${n.message}</a>` : n.message}
        </p>`,
      )}
    </div>
    <button type="button" class="notice-banner__dismiss" data-dismiss hidden aria-label="Dismiss notices">Dismiss</button>
  </dmns-notice>`;
}

interface MapRoom {
  readonly name: string;
  readonly href: string;
}

function roomsByFloor(content: Content): Map<number, MapRoom[]> {
  const byFloor = new Map<number, MapRoom[]>();
  const push = (floor: number, room: MapRoom): void => {
    byFloor.set(floor, [...(byFloor.get(floor) ?? []), room]);
  };
  for (const hall of content.halls.halls) {
    if (hall.floor === null) continue;
    push(hall.floor, { name: hall.shortName ?? hall.name, href: `/halls/${hall.slug}/` });
  }
  const upper = content.halls.upperLevel;
  push(upper.floor, { name: upper.name, href: `/halls/${upper.hall}/#${upper.anchor}` });
  push(1, { name: content.site.pages.specialExhibitions.title, href: '/special-exhibitions/' });
  push(1, { name: content.site.pages.theaters.title, href: '/theaters/' });
  push(0, { name: content.site.pages.sturmFamilyWing.title, href: '/sturm-family-wing/' });
  return byFloor;
}

/** Isometric floor plates. Decorative: the room list is the accessible map. */
function isoPlates(current: RoutePosition): SafeHtml {
  const plates = [0, 1, 2, 3].map((floor) => {
    const y = 66 - floor * 18;
    const here = floor === current.floor;
    return html`<g class="minimap__plate${here ? ' is-current' : ''}">
      <path d="M8 ${y} L48 ${y - 10} L88 ${y} L48 ${y + 10} Z"/>
      ${here ? html`<circle class="minimap__here" cx="${48 + (current.x % 4) * 6 - 9}" cy="${y}" r="3"/>` : ''}
    </g>`;
  });
  return html`<svg class="minimap__iso" viewBox="0 0 96 80" width="96" height="80" aria-hidden="true" focusable="false">${plates}</svg>`;
}

export function minimap(ctx: BuildContext, position: RoutePosition, room: string): SafeHtml {
  const floors = ctx.content.halls.floors;
  const rooms = roomsByFloor(ctx.content);
  const floorName = floors.find((f) => f.floor === position.floor)?.name ?? `Floor ${position.floor}`;
  return html`<dmns-minimap class="minimap" data-wing="${position.wing}" data-floor="${position.floor}">
    <details class="minimap__panel">
      <summary class="minimap__chip">
        ${isoPlates(position)}
        <span class="minimap__here-label"><span class="visually-hidden">You are here: </span>${floorName} · ${room}</span>
      </summary>
      <nav class="minimap__rooms" aria-label="Museum map">
        ${floors.map(
          (floor) => html`<section class="minimap__floor" data-wing="${floor.wing}"${attrs({ 'data-current': floor.floor === position.floor })}>
            <h2 class="minimap__floor-name">${floor.name} <span>${floor.theme}</span></h2>
            <ul role="list">
              ${(rooms.get(floor.floor) ?? []).map(
                (r) => html`<li><a href="${r.href}"${attrs({
                  'aria-current': r.href === position.path ? 'page' : null,
                })}>${r.name}</a></li>`,
              )}
            </ul>
          </section>`,
        )}
        <p class="minimap__directory"><a href="/halls/">Open the full Directory</a></p>
      </nav>
    </details>
  </dmns-minimap>`;
}

export function footer(ctx: BuildContext): SafeHtml {
  const { site } = ctx.content;
  const f = site.footer;
  return html`<footer class="site-footer">
    <div class="site-footer__inner">
      <section class="site-footer__land" aria-labelledby="land-heading">
        <h2 id="land-heading" class="eyebrow">Land acknowledgment</h2>
        <p>${copy(f.landAcknowledgment)}</p>
      </section>
      <section class="site-footer__visit" aria-labelledby="footer-visit-heading">
        <h2 id="footer-visit-heading" class="eyebrow">Visit</h2>
        <address>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}</address>
        <p class="site-footer__hours">${site.hours.daily}<br>${site.hours.extended}<br>${site.hours.closed}</p>
      </section>
      <section class="site-footer__newsletter" aria-labelledby="newsletter-heading">
        <h2 id="newsletter-heading" class="eyebrow">${f.newsletter.heading}</h2>
        <form class="newsletter" action="#" method="get" data-concept-form>
          <label for="newsletter-email">Email address</label>
          <div class="newsletter__row">
            <input id="newsletter-email" name="email" type="email" autocomplete="email" aria-describedby="newsletter-note" required>
            <button type="submit" class="button">Sign up</button>
          </div>
          <p id="newsletter-note" class="newsletter__note">${f.newsletter.note}</p>
        </form>
      </section>
      <nav class="site-footer__social" aria-label="Social media">
        <ul role="list">${f.social.map((link) => html`<li>${outbound(link)}</li>`)}</ul>
      </nav>
      <nav class="site-footer__links" aria-label="Policies and contact">
        <ul role="list">
          <li><a href="/about/">About</a></li>
          <li><a href="/support/">Support</a></li>
          <li><a href="/programs/">Programs &amp; Events</a></li>
          <li><a href="/learn/">School Programs</a></li>
          <li><a href="/science/">Behind the Glass</a></li>
          ${f.links.map((link) => html`<li>${outbound(link)}</li>`)}
        </ul>
      </nav>
      <div class="site-footer__credentials">
        <ul role="list">${f.credentials.map((c) => html`<li>${c}</li>`)}</ul>
        <p>${f.nonprofit}</p>
        <p class="site-footer__concept">${site.conceptNote}</p>
      </div>
    </div>
  </footer>`;
}
