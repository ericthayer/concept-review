/** The document shell every route shares. */
import { createHash } from 'node:crypto';
import type { BuildContext, PageMeta } from './context.js';
import { positionOf } from './context.js';
import { footer, header, minimap, noticeBanner } from './chrome.js';
import { attrs, html, trusted, type SafeHtml } from './html.js';

/**
 * Runs before first paint so theme and Stillness never flash. Kept tiny and hashed into
 * the CSP in _headers; everything else is an external module.
 */
export const HEAD_SCRIPT =
  "var d=document.documentElement;if(!('onpagereveal' in window))d.classList.add('vt-fallback');try{var s=localStorage,t=s.getItem('dmns:theme');if(t==='light'||t==='dark')d.dataset.theme=t;if(s.getItem('dmns:stillness')==='on')d.dataset.stillness='on'}catch(e){}";

/** Prerender doorway targets on hover/focus so `enter` starts from a ready page. */
export const SPECULATION_RULES = JSON.stringify({
  prerender: [{ where: { selector_matches: 'a[data-doorway]' }, eagerness: 'moderate' }],
});

export function cspHash(source: string): string {
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
}

export function page(ctx: BuildContext, meta: PageMeta, body: SafeHtml): string {
  const position = positionOf(ctx, meta.positionPath ?? meta.path);
  const title = meta.path === '/' ? ctx.content.site.name : `${meta.title} · ${ctx.content.site.name}`;
  const doc = html`<!doctype html>
<html lang="en"${attrs({
    'data-floor': position.floor,
    'data-depth': position.depth,
    'data-wing': position.wing,
  })}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${meta.description}">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#0b0c0e">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/newsreader-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.assets.css}">
${meta.expect ? html`<link rel="expect" href="#${meta.expect}" blocking="render">` : ''}
<script>${trusted(HEAD_SCRIPT)}</script>
${ctx.assets.preload.map((href) => html`<link rel="modulepreload" href="${href}">
`)}<script type="module" src="${ctx.assets.vt}" blocking="render"></script>
<script type="module" src="${ctx.assets.js}"></script>
<script type="speculationrules">${trusted(SPECULATION_RULES)}</script>
<script type="application/json" id="dmns-routes">${trusted(ctx.packedRoutes)}</script>
</head>
<body class="${meta.bodyClass ?? ''}">
<a class="skip-link" href="#main">Skip to content</a>
${header(ctx, meta.path)}
${noticeBanner(ctx.content.notices, ctx.today)}
<main id="main" class="main" tabindex="-1">
${body}
</main>
${minimap(ctx, position, meta.room)}
<div class="stair-rails" aria-hidden="true"></div>
${footer(ctx)}
</body>
</html>
`;
  return doc.value;
}
