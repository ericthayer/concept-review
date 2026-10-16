/**
 * Deterministic static build: content/*.json → typed templates → dist/.
 * Run after `tsc` (npm run build does both). No dev-only code paths.
 */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../src/lib/content.js';
import { buildRouteTable, packRouteTable } from '../src/lib/coordinates.js';
import { isIsoDate, museumToday } from '../src/lib/dates.js';
import type { BuildContext } from '../src/templates/context.js';
import { HEAD_SCRIPT, cspHash } from '../src/templates/layout.js';
import { renderAtrium } from '../src/templates/pages/atrium.js';
import { renderDirectory } from '../src/templates/pages/directory.js';
import { renderNotFound, renderPrograms, renderScience, renderSimple, renderSturmWing, renderVisit } from '../src/templates/pages/editorial.js';
import { renderExhibition, renderExhibitions } from '../src/templates/pages/exhibitions.js';
import { renderHall } from '../src/templates/pages/hall.js';
import { renderTheater, renderTheaters } from '../src/templates/pages/theaters.js';

/** Stylesheet cascade order. One file per concern; concatenated into one hashed file. */
export const STYLE_ORDER: readonly string[] = [
  'tokens.css',
  'base.css',
  'components/chrome.css',
  'components/minimap.css',
  'components/plate.css',
  'components/atrium.css',
  'components/floorplan.css',
  'components/hall.css',
  'components/gallery.css',
  'components/editorial.css',
  'transitions.css',
  'scroll.css',
];

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, '..', '..');
const DIST = join(ROOT, 'dist');
const COMPILED_SRC = join(ROOT, '.build', 'src');

function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 10);
}

function write(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

/** Follow static relative imports from the entry so only browser modules ship. */
function moduleGraph(entry: string): string[] {
  const seen = new Set<string>();
  const visit = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
      const spec = match[1] ?? match[2];
      if (spec) visit(resolve(dirname(file), spec));
    }
  };
  visit(entry);
  return [...seen];
}

function buildStyles(): string {
  const css = STYLE_ORDER.map((name) => {
    const text = readFileSync(join(ROOT, 'src', 'styles', name), 'utf8');
    return `/* ${name} */\n${text}`;
  }).join('\n');
  const file = `/css/site.${hash(css)}.css`;
  write(join(DIST, file), css);
  return file;
}

function buildScripts(): string {
  const entry = join(COMPILED_SRC, 'main.js');
  if (!existsSync(entry)) throw new Error('Run tsc before the build (npm run build does both).');
  for (const file of moduleGraph(entry)) {
    const out = join(DIST, 'js', relative(COMPILED_SRC, file));
    const source = readFileSync(file, 'utf8');
    if (/from\s*['"]node:/.test(source)) throw new Error(`${relative(ROOT, file)} imports a Node built-in but ships to the browser`);
    write(out, source);
  }
  return '/js/main.js';
}

function headers(): string {
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${cspHash(HEAD_SCRIPT)} 'inline-speculation-rules'`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join('; ');
  return `/*
  Content-Security-Policy: ${csp}
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/css/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=0, must-revalidate
`;
}

export function build(): { readonly pages: readonly string[] } {
  const envDate = process.env['BUILD_DATE'];
  const today = envDate && isIsoDate(envDate) ? envDate : museumToday();
  const content = loadContent(join(ROOT, 'content'));
  const routes = buildRouteTable({ halls: content.halls.halls, exhibitions: content.exhibitions, theaters: content.theaters });

  rmSync(DIST, { recursive: true, force: true });
  cpSync(join(ROOT, 'public'), DIST, { recursive: true });

  const ctx: BuildContext = {
    content,
    routes,
    today,
    packedRoutes: packRouteTable(routes),
    assets: { css: buildStyles(), js: buildScripts() },
  };

  const pages = new Map<string, string>([
    ['/', renderAtrium(ctx)],
    ['/halls/', renderDirectory(ctx)],
    ['/special-exhibitions/', renderExhibitions(ctx)],
    ['/theaters/', renderTheaters(ctx)],
    ['/sturm-family-wing/', renderSturmWing(ctx)],
    ['/visit/', renderVisit(ctx)],
    ['/programs/', renderPrograms(ctx)],
    ['/learn/', renderSimple(ctx, '/learn/')],
    ['/science/', renderScience(ctx)],
    ['/about/', renderSimple(ctx, '/about/')],
    ['/support/', renderSimple(ctx, '/support/')],
  ]);
  for (const hall of content.halls.halls) pages.set(`/halls/${hall.slug}/`, renderHall(ctx, hall));
  for (const e of content.exhibitions) pages.set(`/special-exhibitions/${e.slug}/`, renderExhibition(ctx, e));
  for (const t of content.theaters) pages.set(`/theaters/${t.slug}/`, renderTheater(ctx, t));

  for (const path of routes.keys()) if (!pages.has(path)) throw new Error(`Route ${path} has a position but no page`);
  for (const [path, markup] of pages) write(join(DIST, path, 'index.html'), markup);
  write(join(DIST, '404.html'), renderNotFound(ctx));

  const legacy = [content.site.pages.halls, content.site.pages.specialExhibitions, content.site.pages.sturmFamilyWing];
  const targets = ['/halls/', '/special-exhibitions/', '/sturm-family-wing/'];
  write(
    join(DIST, '_redirects'),
    legacy.map((p, i) => `${p.legacyPath ?? ''}  ${targets[i] ?? '/'}  301`).filter((line) => line.startsWith('/')).join('\n') + '\n',
  );
  write(join(DIST, '_headers'), headers());
  write(join(DIST, 'build.json'), JSON.stringify({ today, pages: [...pages.keys()] }, null, 2));
  return { pages: [...pages.keys()] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { pages } = build();
  console.log(`Built ${pages.length} pages + 404 into ${relative(process.cwd(), DIST) || 'dist'}`);
}
