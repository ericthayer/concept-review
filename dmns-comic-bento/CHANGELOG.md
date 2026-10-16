# Changelog

Each entry is one step of the build order (§15). Every step ends with `npm run check` green.

## Step 2: Static comic (2026-10-16)

- Every route prerendered as plain, accessible HTML on the bento grid: Cover, 9 issue pages,
  9 hall pages, 4 special exhibitions, 3 theaters, plus 404 and a newsletter concept page.
- Field Notes tokens, Archivo (variable, wdth + wght) and Jost self-hosted as Latin WOFF2.
- Placeholder line art drawn in code: 11 Specimen poses and 31 scenes, each with three
  jittered boil frames and an off-register fill layer, inlined per page as a symbol sprite.
- Spread rules enforced at build time: slot counts, max two pop colors, one Specimen per spread.
- Checks: contrast (`docs/contrast.md`), budgets, internal links and fragments, DOM-vs-visual
  reading order at three container sizes, project lint, Playwright + axe on every route.
- No motion yet.

## Step 1: Content and book model (2026-10-16)

- `content/*.json` seeded from dmns.org as of 2026-10-16, with typed, validating loaders.
- `src/lib/book.ts`: `PagePosition`, `resolveCameraMove`, compact book map for the client.
- `src/lib/layouts.ts`: five named layouts as typed area maps at three container sizes.
- `src/lib/dates.ts`, `src/lib/motion.ts`, `src/lib/routes.ts`; unit tests for every branch.
