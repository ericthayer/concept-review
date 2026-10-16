import type { Media } from '../../lib/content-types.js';
import type { BuildContext } from '../context.js';
import { html, type SafeHtml } from '../html.js';

export function mediaFor(ctx: BuildContext, id: string): Media {
  const media = ctx.content.media.get(id);
  if (!media) throw new Error(`media.json has no entry "${id}"`);
  return media;
}

export function pageHeader(title: string, lede: SafeHtml | string | null, eyebrowText?: string): SafeHtml {
  return html`<header class="page-header">
    ${eyebrowText ? html`<p class="eyebrow">${eyebrowText}</p>` : ''}
    <h1 class="page-title">${title}</h1>
    ${lede ? html`<p class="lede">${lede}</p>` : ''}
  </header>`;
}

export function backLinks(links: readonly { readonly href: string; readonly label: string }[]): SafeHtml {
  return html`<nav class="back-links" aria-label="Leave this room">
    <ul role="list">${links.map((l) => html`<li><a href="${l.href}">${l.label}</a></li>`)}</ul>
  </nav>`;
}
