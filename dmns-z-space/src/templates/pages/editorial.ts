/** Plain editorial rooms: no theatrics beyond the default enter/exit. */
import type { BuildContext } from '../context.js';
import { copy, html, type SafeHtml } from '../html.js';
import { page } from '../layout.js';
import { outbound } from '../partials.js';
import { backLinks, pageHeader } from './shared.js';

const back = backLinks([{ href: '/', label: 'Back to the Atrium' }]);

function editorial(ctx: BuildContext, path: string, title: string, description: string, body: SafeHtml, bodyClass = 'page-editorial'): string {
  return page(ctx, { path, title, room: title, description, bodyClass }, html`<article class="editorial">${body}${back}</article>`);
}

export function renderSturmWing(ctx: BuildContext): string {
  const p = ctx.content.site.pages.sturmFamilyWing;
  return editorial(
    ctx,
    '/sturm-family-wing/',
    p.title,
    `${p.subtitle}. ${p.lede ?? ''}`,
    html`${pageHeader(p.title, p.lede ?? null, p.subtitle)}
    <ul class="room-list" role="list">
      ${p.spaces.map(
        (s) => html`<li class="room-list__item">
          <h2 class="room-list__name">${s.href ? html`<a href="${s.href}">${s.name}</a>` : s.name}</h2>
          <p>${copy(s.text)}</p>
        </li>`,
      )}
    </ul>`,
  );
}

export function renderVisit(ctx: BuildContext): string {
  const { site } = ctx.content;
  const p = site.pages.visit;
  return editorial(
    ctx,
    '/visit/',
    p.title,
    `${site.hours.daily}. ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}.`,
    html`${pageHeader(p.title, null, 'Visit')}
    <ul class="room-list" role="list">
      ${p.sections.map(
        (s) => html`<li class="room-list__item" id="${s.id}">
          <h2 class="room-list__name">${s.name}</h2>
          <p>${copy(s.text)}</p>
          ${s.outbound ? html`<p>${outbound(site.outbound[s.outbound])}</p>` : ''}
        </li>`,
      )}
      <li class="room-list__item" id="sturm-family-wing">
        <h2 class="room-list__name"><a href="/sturm-family-wing/">${site.pages.sturmFamilyWing.title}</a></h2>
        <p>${site.pages.sturmFamilyWing.subtitle}. ${site.pages.sturmFamilyWing.lede ?? ''}</p>
      </li>
    </ul>`,
  );
}

export function renderPrograms(ctx: BuildContext): string {
  const p = ctx.content.site.pages.programs;
  return editorial(
    ctx,
    '/programs/',
    p.title,
    p.items.join(', '),
    html`${pageHeader(p.title, null, 'Programs')}
    <ul class="room-list" role="list">
      ${p.items.map((item) => html`<li class="room-list__item"><h2 class="room-list__name">${item}</h2><p>${copy(p.itemText)}</p></li>`)}
    </ul>`,
  );
}

export function renderScience(ctx: BuildContext): string {
  const { site } = ctx.content;
  const p = site.pages.science;
  return editorial(
    ctx,
    '/science/',
    p.title,
    p.lede ?? p.title,
    html`${pageHeader(p.title, p.lede ?? null, 'Science · Lower level')}
    <section class="collections" aria-labelledby="collections-title">
      <h2 id="collections-title" class="section-title">Collections</h2>
      <ul class="drawer-list" role="list">
        ${p.collections.map((c) => html`<li class="drawer-list__item">${c}</li>`)}
        <li class="drawer-list__item">${outbound(site.outbound.digitalCollections)}</li>
      </ul>
    </section>
    <ul class="room-list" role="list">
      ${p.topics.map((t) => html`<li class="room-list__item"><h2 class="room-list__name">${t}</h2><p>${copy(p.topicText)}</p></li>`)}
    </ul>
    <p>${outbound(site.outbound.catalyst)}</p>`,
    'page-editorial page-basement',
  );
}

export function renderSimple(ctx: BuildContext, path: '/learn/' | '/about/' | '/support/'): string {
  const { site } = ctx.content;
  const p = path === '/learn/' ? site.pages.learn : path === '/about/' ? site.pages.about : site.pages.support;
  const extra =
    path === '/support/'
      ? html`<ul class="link-list" role="list"><li>${outbound(site.outbound.membership)}</li><li>${outbound(site.outbound.donate)}</li></ul>`
      : path === '/about/'
        ? html`<ul class="link-list" role="list">${site.footer.links.map((l) => html`<li>${outbound(l)}</li>`)}</ul>`
        : '';
  return editorial(ctx, path, p.title, `${p.title}. ${site.name}.`, html`${pageHeader(p.title, p.lede ? copy(p.lede) : null)}${extra}`);
}

export function renderNotFound(ctx: BuildContext): string {
  const p = ctx.content.site.pages.notFound;
  return page(
    ctx,
    { path: '/404.html', positionPath: '/', title: p.title, room: p.title, description: p.lede ?? p.title, bodyClass: 'page-editorial page-404' },
    html`<article class="editorial">${pageHeader(p.title, p.lede ?? null)}
      <ul class="link-list" role="list"><li><a href="/">Back to the Atrium</a></li><li><a href="/halls/">Open the Directory</a></li></ul>
    </article>`,
  );
}
