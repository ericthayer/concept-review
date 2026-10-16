/**
 * Static build: content/*.json → typed templates → dist/.
 * Usage: node scripts/build.ts   (BUILD_DATE=YYYY-MM-DD to pin "today")
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createBookMap } from '../src/lib/book.ts';
import { dateInZone, isIsoDate, liveNotices, mostUrgentNotice } from '../src/lib/dates.ts';
import { generateLayoutCss, validateLayouts } from '../src/lib/layouts.ts';
import { buildRoutes, LIVE_REDIRECTS, type Route } from '../src/lib/routes.ts';
import { pageContext, type SiteContext } from '../src/templates/context.ts';
import { renderCover } from '../src/templates/pages/cover.ts';
import { renderHall, renderHallsIndex } from '../src/templates/pages/halls.ts';
import { renderAbout, renderLearn, renderPrograms, renderScience, renderSimple, renderSupport, renderVisit } from '../src/templates/pages/info.ts';
import { renderExhibition, renderSpecialIndex, renderTheater, renderTheatersIndex } from '../src/templates/pages/special.ts';
import { loadContent, ROOT } from './load-content.ts';

const DIST = join(ROOT, 'dist');
const CLIENT = join(ROOT, 'build', 'client');

/** Stylesheet order is the cascade order. */
export const STYLESHEETS = [
  'tokens.css',
  'base.css',
  'grid.css',
  'components/masthead.css',
  'components/info-strip.css',
  'components/panel.css',
  'components/caption.css',
  'components/art.css',
  'components/splash.css',
  'components/controls.css',
  'components/footer.css',
  'ink.css',
  'boil.css',
  'camera.css',
  'fallbacks.css',
];

function resolveToday(timeZone: string): string {
  const pinned = process.env['BUILD_DATE'];
  if (pinned) {
    if (!isIsoDate(pinned)) throw new Error(`BUILD_DATE must be YYYY-MM-DD, got ${pinned}`);
    return pinned;
  }
  return dateInZone(new Date(), timeZone);
}

function find<T extends { readonly slug: string }>(items: readonly T[], slug: string): T {
  const item = items.find((i) => i.slug === slug);
  if (!item) throw new Error(`Missing content for ${slug}`);
  return item;
}

function renderRoute(site: SiteContext, route: Route): string {
  const ctx = pageContext(site, route);
  const page = route.page;
  switch (page.kind) {
    case 'cover':
      return renderCover(ctx);
    case 'hall':
      return renderHall(ctx, find(site.content.halls, page.slug));
    case 'exhibition':
      return renderExhibition(ctx, find(site.content.exhibitions, page.slug));
    case 'theater':
      return renderTheater(ctx, find(site.content.theaters, page.slug));
    case 'index':
      switch (page.issue) {
        case 'halls':
          return renderHallsIndex(ctx);
        case 'special':
          return renderSpecialIndex(ctx);
        case 'theaters':
          return renderTheatersIndex(ctx);
        case 'visit':
          return renderVisit(ctx);
        case 'programs':
          return renderPrograms(ctx);
        case 'learn':
          return renderLearn(ctx);
        case 'science':
          return renderScience(ctx);
        case 'about':
          return renderAbout(ctx);
        case 'support':
          return renderSupport(ctx);
      }
  }
}

function write(rel: string, body: string): void {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
}

function routeFile(path: string): string {
  return join(path.replace(/^\//, ''), 'index.html');
}

export function build(): { pages: number; today: string } {
  const layoutProblems = validateLayouts();
  if (layoutProblems.length) throw new Error(`Layout problems: ${JSON.stringify(layoutProblems)}`);
  const content = loadContent();
  const today = resolveToday(content.site.hours.timeZone);
  const routes = buildRoutes(content);
  const notices = liveNotices(content.notices, today);
  const site: SiteContext = {
    content,
    routes,
    book: createBookMap(routes.map((r) => r.position)),
    today,
    notices,
    urgentNotice: mostUrgentNotice(notices, today),
  };

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  for (const route of routes) write(routeFile(route.position.path), renderRoute(site, route));

  const pseudo = (path: string): Route => ({ position: { path, issue: 'about', depth: 1, order: 0 }, page: { kind: 'index', issue: 'about' }, siblings: 1 });
  write('404.html', renderSimple(pageContext(site, pseudo('/404/')), 'Page not found', 'This page is not in the book. Try the Cover or Plan Your Visit.'));
  write(
    'newsletter-concept/index.html',
    renderSimple(pageContext(site, pseudo('/newsletter-concept/')), 'Newsletter (concept)', 'This concept site does not collect email addresses. Nothing was sent or stored.'),
  );

  const css = STYLESHEETS.map((f) => readFileSync(join(ROOT, 'src', 'styles', f), 'utf8')).join('\n') + '\n' + generateLayoutCss();
  write('assets/css/site.css', css);

  if (!existsSync(CLIENT)) throw new Error('Client JS missing: run `tsc -p tsconfig.client.json` first (npm run build does).');
  cpSync(CLIENT, join(DIST, 'assets', 'js'), { recursive: true });

  for (const f of readdirSync(join(ROOT, 'public', 'fonts'))) {
    if (f.endsWith('.woff2')) cpSync(join(ROOT, 'public', 'fonts', f), join(DIST, 'assets', 'fonts', f));
  }
  for (const f of ['_headers', 'favicon.svg']) cpSync(join(ROOT, 'public', f), join(DIST, f));
  const redirects = LIVE_REDIRECTS.map(([from, to]) => `${from}  ${to}  301`).join('\n');
  write('_redirects', `# Live dmns.org paths → concept routes\n${redirects}\n`);

  return { pages: routes.length + 2, today };
}

const result = build();
console.log(`Built ${result.pages} pages into dist/ (today = ${result.today})`);
