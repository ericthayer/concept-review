/**
 * Page shell: head, masthead, info strip, page counter, footer, sprite.
 * Chrome uses literal museum names and plain type; comic treatment stays in panels.
 */
import { sprite } from '../../scripts/build-sprites.ts';
import { encodeBook, ISSUE_INDEX_PATH, ISSUE_LABEL, pageCounter, type IssueId } from '../lib/book.ts';
import { cameraScript } from '../runtime/camera.ts';
import type { PageContext } from './context.ts';
import { html, isExternal, raw, type SafeHtml } from './html.ts';

export const NAV_ISSUES: readonly IssueId[] = ['halls', 'special', 'theaters', 'visit', 'programs'];

export interface DocumentSpec {
  readonly title: string;
  readonly description: string;
  readonly main: SafeHtml;
  /** Detail pages block render until the splash is parsed. */
  readonly documentary?: boolean;
}

/** Runs before first paint: theme and Still Panels, so nothing flashes. */
const CAMERA = cameraScript();

const BOOT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('dmns:theme');if(t==='light'||t==='dark')d.dataset.theme=t;if(localStorage.getItem('dmns:still-panels')==='1')d.dataset.still='';}catch(e){}var r=d.hasAttribute('data-still')||matchMedia('(prefers-reduced-motion: reduce)').matches;var v='startViewTransition' in document||(window.CSS&&CSS.supports('animation-timeline: view()'));d.dataset.motion=r?'reduced':v?'full':'none';d.classList.add('js');})();`;

const SPECULATION = JSON.stringify({
  prerender: [{ where: { and: [{ href_matches: '/*' }, { selector_matches: '.panel__link' }] }, eagerness: 'moderate' }],
});

export function externalLink(href: string, label: string, cls = ''): SafeHtml {
  const c = cls ? ` class="${cls}"` : '';
  if (!isExternal(href)) return html`<a${raw(c)} href="${href}">${label}</a>`;
  return html`<a${raw(c)} href="${href}">${label}<span class="ext" aria-hidden="true">↗</span><span class="vh"> (on dmns.org)</span></a>`;
}

function masthead(ctx: PageContext): SafeHtml {
  const current = ctx.position.issue;
  const items = NAV_ISSUES.map((issue) => {
    const href = ISSUE_INDEX_PATH[issue];
    const here = ctx.position.path === href ? ' aria-current="page"' : current === issue ? ' aria-current="true"' : '';
    return html`<li><a href="${href}"${raw(here)}>${ISSUE_LABEL[issue]}</a></li>`;
  });
  const { site } = ctx.content;
  return html`<dmns-masthead><header class="masthead">
<a class="skip-link" href="#main">Skip to main content</a>
<div class="masthead__bar">
<a class="wordmark" href="/"${ctx.position.path === '/' ? raw(' aria-current="page"') : ''}><span class="wordmark__short">${site.shortName}</span><span class="wordmark__long">${site.name}</span><span class="wordmark__concept">Concept</span></a>
<div class="masthead__tools">
${externalLink(site.outbound.tickets, 'Buy Tickets', 'btn-tickets')}
<button type="button" class="tool-btn" data-action="theme" aria-pressed="false" hidden>Dark theme</button>
<button type="button" class="tool-btn" data-action="still" aria-pressed="false" hidden>Still Panels</button>
</div>
</div>
<nav class="masthead__nav" aria-label="Primary"><ul>${items}</ul></nav>
</header></dmns-masthead>`;
}

function infoStrip(ctx: PageContext): SafeHtml {
  const { hours } = ctx.content.site;
  const notice = ctx.urgentNotice;
  const noticeHtml = notice
    ? html`<p class="info-strip__notice"><span class="info-strip__label">Notice</span> ${notice.hall ? html`<a href="/halls/${notice.hall}/">${notice.title}</a>` : notice.title}</p>`
    : '';
  return html`<dmns-info-strip class="info-strip" role="region" aria-label="Today at the museum" data-open="${hours.open}" data-close="${hours.close}" data-late="${hours.fridayLateClose}" data-closed="${hours.closedDates.join(',')}" data-tz="${hours.timeZone}">
<p class="info-strip__hours"><span class="info-strip__label">Hours</span> ${hours.summary}; ${hours.fridaySummary}. <span class="info-strip__state" data-open-state aria-live="polite"></span></p>
${noticeHtml}
</dmns-info-strip>`;
}

function footer(ctx: PageContext): SafeHtml {
  const { site } = ctx.content;
  const f = site.footer;
  const addr = site.address;
  const social = f.social.map((l) => html`<li>${externalLink(l.url, l.label)}</li>`);
  const links = f.links.map((l) => html`<li>${externalLink(l.url, l.label)}</li>`);
  const creds = f.credentials.map((l) => html`<li>${externalLink(l.url, l.label)}</li>`);
  const more = [
    { label: 'About', url: '/about/' },
    { label: 'Support', url: '/support/' },
    { label: 'School Programs', url: '/learn/' },
    { label: 'Science', url: '/science/' },
    { label: 'Membership', url: site.outbound.membership },
    { label: 'Donate', url: site.outbound.donate },
    { label: 'Log in', url: site.outbound.login },
    { label: 'Search', url: site.outbound.search },
  ].map((l) => html`<li>${externalLink(l.url, l.label)}</li>`);
  return html`<footer class="site-footer">
<section class="land-ack" aria-labelledby="land-ack-h"><h2 id="land-ack-h">Land acknowledgment</h2><p>${f.landAcknowledgment}</p></section>
<div class="site-footer__grid">
<section aria-labelledby="footer-visit-h"><h2 id="footer-visit-h">${site.name}</h2><address>${addr.street}<br>${addr.city}, ${addr.region} ${addr.postal}</address><p>${site.hours.summary}; ${site.hours.fridaySummary}. ${site.hours.closedSummary}.</p><nav aria-label="More from the museum"><ul class="link-list">${more}</ul></nav></section>
<section aria-labelledby="footer-news-h"><h2 id="footer-news-h">Newsletter</h2>
<form class="newsletter" action="/newsletter-concept/" method="get" data-concept-form>
<label for="newsletter-email">Email address</label>
<input id="newsletter-email" type="email" autocomplete="email" aria-describedby="newsletter-note">
<button type="submit">Sign up</button>
<p id="newsletter-note" class="newsletter__note">Concept only: this form sends nothing.</p>
<p class="newsletter__status" role="status"></p>
</form>
<h2 id="footer-social-h">Follow</h2><ul class="link-list link-list--inline" aria-labelledby="footer-social-h">${social}</ul></section>
<section aria-labelledby="footer-cred-h"><h2 id="footer-cred-h">Credentials</h2><ul class="link-list">${creds}</ul><p>${f.nonprofit}</p><nav aria-label="Policies"><ul class="link-list">${links}</ul></nav></section>
</div>
<p class="site-footer__concept">Concept redesign for review. Not the official Denver Museum of Nature &amp; Science website; tickets, membership and giving link to <a href="${site.liveOrigin}/">dmns.org</a>. Content copied from dmns.org on ${site.sourceDate}.</p>
</footer>`;
}

export function renderDocument(ctx: PageContext, spec: DocumentSpec): string {
  const counter = pageCounter(ctx.position, ctx.route.siblings);
  const bookJson = JSON.stringify(encodeBook(ctx.routes.map((r) => r.position)));
  // main is rendered first so the sprite knows every figure the page used.
  const main = html`<main id="main" tabindex="-1"><dmns-page data-issue="${ctx.position.issue}" data-depth="${ctx.position.depth}"${spec.documentary ? raw(' data-documentary') : ''}><p class="page-counter">${counter}</p>${spec.main}</dmns-page><span id="main-end" hidden></span></main>`;
  const body = html`${raw(sprite(ctx.art))}${masthead(ctx)}${infoStrip(ctx)}${main}${footer(ctx)}<p class="vh" id="announcer" aria-live="polite"></p>`;
  const title = `${spec.title} | ${ctx.content.site.name} (concept)`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${html`${title}`.value}</title>
<meta name="description" content="${html`${spec.description}`.value}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#0d0d0d">
<link rel="preload" href="/assets/fonts/archivo-variable-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="expect" href="#main-end" blocking="render">
<script>${BOOT}</script>
<script type="application/json" id="book-map">${bookJson}</script>
<script>${CAMERA}</script>
<script type="module" src="/assets/js/main.js"></script>
<script type="speculationrules">${SPECULATION}</script>
</head>
<body>
${body.value}
</body>
</html>
`;
}
