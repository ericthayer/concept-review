# Changelog

Each entry is one step of the build order (§15). Every step ends with `npm run check` green.

## Step 8: Fallback ladder and polish (2026-10-16)

- Mobile CLS fix: JS-upgraded controls (theme, Still Panels, Look closer, Replay, filters) keep
  their space from first paint via `html.js` instead of being unhidden later. Lighthouse mobile
  CLS went from 0.29–0.32 to 0.02–0.04.

- `fallbacks.css`: opacity-only arrival when nothing else is supported, reduced-transparency
  keyframes, forced-colors edges and states.
- Pressed filter pills keep a visible edge on the black page.
- `tests/e2e/fallbacks.spec.ts`: morphs without `startViewTransition`; forced colors.
- Docs: fallback ladder, verification gaps, README motion table; 60s tour recorded headless.

## Step 7: Specimen traveler (2026-10-16)

- The on-screen Specimen hops between pages on camera moves, changing pose on landing.
- Never on documentary pages or in calm moves; covered by `tests/e2e/camera.spec.ts`.

## Step 6: Same-document morphs (2026-10-16)

- `morph()` helper over `startViewTransition({ update, types })` with scoped names.
- Look closer / Step back (Escape returns focus), floor tabs as an ARIA tablist with an elevator
  slide, filters with an un-ink exit; all announced through one polite live region.
- `tests/e2e/morph.spec.ts`: keyboard paths at full and reduced motion.

## Step 5: Cross-document camera (2026-10-16)

- Every in-book navigation is a camera move: zoom in and out (panel ⇄ splash, caption ⇄ h1),
  page turns on a 6° hinge, and new-issue deals; reduced motion and Still Panels get a 150ms crossfade.
- Move resolution runs in an inline classic script compiled from `src/runtime/camera.ts`,
  unit-tested against `resolveCameraMove` for every route pair.
- Motion level is now set before first paint by the boot script.
- `tests/e2e/camera.spec.ts` drives each move and the calm fallback in Chromium.

## Step 4: Boil and beats (2026-10-16)

- Line art boils in three held frames (360ms cycle, `steps()`), only on screen, at most six
  panels at once, paused when the tab is hidden; documentary panels never boil.
- Beat strips play once in view (1100ms per beat), rest on the final beat, and replay on request.
- Hover lift and faster boil are full-motion only.
- `tests/e2e/motion.spec.ts`: boil and ink run at full motion; under reduced motion and Still
  Panels, `getAnimations()` shows no transform, clip-path or stroke animation; Still Panels persists.

## Step 3: Ink-in (2026-10-16)

- Scroll-driven ink-in: gutters rule, panels drop in reading order, strokes draw through the
  registered `--ink` property, fills snap, knockout caption words slap down one by one.
- Panel-level `view()` ranges that finish by `entry 100%` (see `docs/motion-spec.md`).
- Gated on scroll-timeline support, `prefers-reduced-motion` and Still Panels.

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
