# Changelog

## Step 1 · Data + resolver

- Seed content from the brief in `content/*.json` with validating, typed loaders (`src/lib/content.ts`).
- `RoutePosition` map for every §4 route (`src/lib/coordinates.ts`) and the pure `resolveTransition`
  with unit tests for every branch.
- The Directory carries `spans: [1, 2, 3]`: it is the one room that shows every floor, so walking from it
  into a hall is `enter` and back is `exit`, as §14 requires. Without it the "floor change wins" rule
  would turn Directory → Prehistoric Journey into `ascend`, contradicting the acceptance criteria.

## Step 2 · Static shell

- `scripts/build.ts` renders all 27 routes plus a 404 from `content/*.json` through typed, escaping
  template-literal renderers into `dist/`. No motion yet; every page is navigable with JS disabled.
- "After Hours" tokens with a Daylight theme, self-hosted Latin subsets of Newsreader (display + text
  optical sizes split into two files) and Jost with metric-matched fallbacks.
- Persistent chrome: header with Stillness and Daylight toggles, minimap HUD (collapses to a floor chip
  on phones), notice banner, footer. `_redirects` for the three legacy paths, `_headers` with a hashed CSP.
- `npm run check`: tsc, eslint, unit tests, generated contrast audit (`docs/contrast.md`), gzip budgets,
  link/fragment/TODO-marker checker, Playwright + axe on every route.
- Added a `--signal` token: DMNS gold fails 3:1 as a focus ring on the Daylight surfaces, so rings and
  "you are here" marks use a deepened gold there. The contrast script caught it.
