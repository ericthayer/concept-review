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

## Step 3 · Cross-document z-space

- `@view-transition { navigation: auto }` on every page. `src/z-space.ts` loads with `blocking="render"`
  (its module graph is `modulepreload`ed) so `pagereveal` is registered before the first frame.
- `pageswap` resolves the move from building coordinates, adds it to `viewTransition.types`, writes the
  clicked doorway's centre as `--vt-origin-x/y`, and hands both to the next page through `sessionStorage`.
  `pagereveal` replays them, or recomputes from `navigation.activation` if storage is blocked.
- Four choreographies plus the sealed-hall variant in `src/styles/transitions.css`. Header, minimap and
  ticket button carry their own names with `animation: none`, so they hold still like a HUD.
- Sign convention is a physical camera (walking right slides the room left; climbing slides it down).
- A click during a running transition skips it. Calm mode (reduced motion or Stillness) collapses every
  move to a 150ms crossfade, withholds morph names and drops group animations.
- Head script flags engines without cross-document VT (`vt-fallback`), which get a 300ms lights-up on `<main>`.

## Step 4 · Shared-element morphs

- Directory card → hall hero, gallery card → exhibition hero, and Atrium "Now showing" plate →
  exhibition hero. Image and title each get a `view-transition-name` only inside `pageswap`/`pagereveal`
  and lose it when the transition finishes. `view-transition-class: hall-door` styles them all once.
- Browser Back from a hall plays `exit` and morphs the hero back into its Directory card.

## Step 5 · Scroll is walking

- `src/styles/scroll.css`: a darkness veil over each hall hero opens with root scroll progress
  (transform + opacity only); diorama backdrop and specimen layers move at different rates on `view()`
  timelines; label cards and vitrine cases step forward (0.94 → 1). All inside
  `@supports (animation-timeline: view())` and off under reduced motion or Stillness. Labels scale but never fade, so text holds full contrast at every scroll position.
- Atrium arrival: the spotlight warms up and the headline, hours and ticket CTA rise in.
- `prefers-reduced-transparency` swaps every blur and scrim for solid surfaces.

## Step 6 · Same-document transitions

- `transition(update, types)` helper (`src/dom/transition.ts`) runs `update()` directly when the API is
  missing or calm mode is on, and skips any running transition rather than queueing.
- Directory floor switcher (`<dmns-floorplan>`): one floor at a time, the stage slides like the stairwell,
  focus moves to the new floor heading and a polite live region announces it.
- Vitrine dialog (`<dmns-vitrine>`): native `showModal()`, plate morph from case to dialog, Esc, Close or
  backdrop closes it and focus returns to the opener. Enter and Space both open.
- Special Exhibitions filter (`<dmns-filter>`): staying cards morph, leaving cards fade into darkness.
- `<dmns-doorway>` writes its own centre as the camera origin, `<dmns-event-corridor>` arrow buttons,
  `<dmns-minimap>` closes on Escape or outside click, `<dmns-sealed-hall>` ties the closure to the heading.

## Step 7 · Fallback ladder + Stillness audit

- Verified in Playwright: no cross-document VT → lights-up entrance; reduced motion and Stillness → no
  transform or filter animation anywhere; Stillness persists across navigation.
- `tests/unit/motion-caps.test.ts` asserts that keyframes animate only transform/opacity/filter, that scale
  stays within 1.4×, that rotation is Y-only and ≤ 8deg, and that every type has a calm substitute.
- `docs/browser-support.md` and `docs/motion-spec.md`.

## Step 8 · Polish

- Staged opacity on every page move so two rooms are never double-exposed at full strength.
- Header breakpoints keep Membership/Donate visible down to 70rem and never overflow (asserted 360–1920px).
- Keyboard walkthrough recording script (`scripts/record-walkthrough.ts`).
