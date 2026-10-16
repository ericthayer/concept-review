# Motion spec

Every move, reveal, boil and beat, with what replaces it under reduced motion and Still Panels.
Sections are added per build step (see `CHANGELOG.md`).

## Motion levels

| Level | When | Result |
|---|---|---|
| `full` | `prefers-reduced-motion: no-preference` and Still Panels off | Everything below runs |
| `reduced` | `prefers-reduced-motion: reduce`, or Still Panels on | No transform, clip-path, stroke or boil animation. Every panel renders in its final state. Beats rest on the final beat; Replay plays them on request. |
| `none` | No JS, or no scroll-driven animation support | Static comic. Nothing is hidden behind motion. |

`html[data-motion]` mirrors the level and is set before first paint by an inline boot script.
Still Panels (masthead toggle, `aria-pressed`) persists in `localStorage` under `dmns:still-panels`
and sets `html[data-still]`. Every CSS rule that moves something is gated on
`:root[data-motion='full']:not([data-still])` and `prefers-reduced-motion: no-preference`.
`tests/e2e/motion.spec.ts` asserts with `document.getAnimations()` that no transform, translate,
scale, rotate, clip-path, `--ink` or stroke animation runs under reduced motion or Still Panels.

## Step 3: Ink-in (`src/styles/ink.css`)

Scroll-driven, behind `@supports (animation-timeline: view())`. Without support the page is static.

| Beat | Target | Keyframes | Timeline and range | Easing |
|---|---|---|---|---|
| Gutters rule | `.spread__grid::before` (black gutter layer) over a `--paper-2` sheet | `clip-path: inset()` wipe from top-left | Spread `view-timeline: --spread`, `entry 0%` to `entry 40%` | linear (scroll is the easing) |
| Panels drop | each `dmns-panel` | opacity 0→1, scale 0.96→1, translate 0 12px→0 | Panel's own `view()`, `entry i×2%` to `entry 55%+i×2%` (i = reading order) | linear |
| Strokes draw | `.panel__art` sets registered `--ink` 1→0, lines read it as `stroke-dashoffset` | `--ink` | Panel `view()`, `entry 25%` to `entry 90%` | linear |
| Fills snap | `.art__fill` | opacity 0→1 | Panel `view()`, `entry 25%` to `entry 92%` | `steps(1, end)` |
| Captions slap | `.knockout .w` (word w) | `clip-path` reveal | Panel `view()`, `entry 40%` to `entry 48%+w×4%` | `steps(1, end)` |
| Specimen climbs | Cover stair `.stair-climber` | translate along the stair | `--spread`, `entry 30%` to `exit 10%` | `steps(4, jump-none)` |
| First spread and splash | already on screen at load | `ink-drop`, 300ms, stagger by `--i` | time-based | `--ease-camera` |

**Deviation from the brief, on purpose:** steps 2 to 4 run on each panel's own `view()` timeline
rather than the spread's. On a phone a strip spread is several screens tall; a spread-level range
would leave panels lower down half-inked while fully readable on screen. Every range ends by
`entry 100%`, so a panel that is fully on screen is always fully revealed.

Reduced motion and Still Panels: none of the above. Panels render inked, filled and captioned.
Spreads off screen use `content-visibility: auto` with an intrinsic size, so ink-in costs nothing
for spreads not yet reached.

## Step 4: Boil and beats (`src/styles/boil.css`, `src/runtime/boil.ts`, `src/components/beat-strip.ts`)

| Behaviour | Spec | Reduced motion and Still Panels |
|---|---|---|
| Boil | Three jittered line frames per figure (`{id}-l0..l2`) cycle with `visibility` keyframes, `steps(1, end)`, `--boil-duration` 360ms per cycle (120ms per frame, "on twos" feel). Frames differ in line wobble only, never in luminance, so there is no flash. | Off: frame 0 only. |
| Boil scheduling | `IntersectionObserver` (threshold 0.25) sets `data-live` on on-screen art. At most 6 live at once; the oldest pauses. `html[data-hidden]` pauses all when the tab is hidden. | Not applied. |
| Hover | Boils faster (`--boil-duration-hover` 240ms) and the panel lifts 2px (`translate`, 160ms). No layout change. | Neither. |
| Documentary | Egyptian Mummies, anthropology and living-culture panels never boil. | Same. |
| Beats | Beat strips play once when 50% in view, 1100ms per beat, then rest on the final beat. Never loop. | Rest on the final beat. |
| Replay | Visible button on every beat strip. Replays on click, and on panel hover or focus with full motion. | Click still plays (a user request, not autoplay). |

## Step 5: Cross-document camera (`src/styles/camera.css`, `src/runtime/camera.ts`)

`@view-transition { navigation: auto; }`. Each page inlines the book map and a small classic
script (built from `camera.ts` by `Function#toString`, so it runs before first render and without
site modules). `pageswap` (old page) and `pagereveal` (new page) resolve the move from the book
map and `navigation.activation`, add it as a view-transition type, and name the hero pair.
`<link rel="expect" href="#main-end" blocking="render">` holds first render until `<main>` is
parsed, so the zoom-out target panel exists when names are assigned (a few ms on these static pages).

| Move | When | Old page | New page | Shared elements | Duration and easing |
|---|---|---|---|---|---|
| `zoom-in` | depth increases | scales to 1.08 and fades (pushes past the camera) | fades in from 260ms | clicked panel → splash (`hero-panel`), its caption → h1 (`hero-title`); radius 14px → 0 via `clip-path` | 640ms, `--ease-camera` |
| `zoom-out` | depth decreases | fades out in 260ms | scales 1.08 → 1 and fades in | splash → the panel that links to the page just left; radius 0 → 14px | 520ms |
| `turn-next` | same issue and depth, later order | hinges on the left spine: `rotate: y -6deg`, slides −30%, fades | arrives from the right with the mirror hinge | none | 560ms |
| `turn-prev` | same, earlier order | mirror of turn-next | mirror | none | 560ms |
| `new-issue` | same depth, different issue | sinks to 0.94 and dims to 0.35 | dealt up from below (`translate: 0 100%` → 0) | none | 600ms |
| `calm` | reduced motion or Still Panels | crossfade | crossfade | none | 150ms |

- Masthead and info strip carry their own `view-transition-name` with `animation: none`: wayfinding
  never moves. The old snapshot is hidden so the two never blend.
- Hero names are only assigned to elements on screen, and cleared after `finished`.
- A navigation that starts mid-move calls `skipTransition()` (Navigation API `navigate` event).
- The first spread's time-based entrance is skipped when the page arrived through a move
  (`html[data-camera]`, also used by `tests/e2e/camera.spec.ts`).
- Without JS: the browser's default crossfade. Without cross-document view transitions: instant
  navigation, nothing lost.

## Step 6: Same-document morphs (`src/styles/morph.css`, `src/runtime/transition.ts`)

One helper, `morph(update, types, named)`, names the elements that should move, calls
`document.startViewTransition({ update, types })`, and clears the names on `finished`. A new morph
skips the running one first. Below full motion, or without the API, `update` runs at once.

| Morph | Trigger | Motion | Duration | Keyboard and announcements |
|---|---|---|---|---|
| Lean-in | "Look closer" button (click only) | Every panel in the spread is named (`view-transition-class: lean`) and slides to its new cell; the chosen panel spans the full row | 420ms, `--ease-camera` | Enter or Space opens; focus moves to the panel heading; "{title}, up close. Press Escape to step back." |
| Lean-out | Same button ("Step back") or Escape | Reverse | 420ms | Focus returns to the button; "Back to the full spread." |
| Floor tabs | Tab click, ←/→, Home, End | The floor stage slides vertically: going up, the new floor comes down from above (elevator) | 420ms | ARIA tablist with roving tabindex; the hash is kept in sync; "Showing Floor n." |
| Filters | `aria-pressed` buttons | Leaving panels un-ink (stepped wipe), staying panels slide, arriving panels drop in | 240ms out, 360ms move, 300ms in | "Showing n of N." |

Without JS: no Look closer buttons, floors are stacked spreads with anchor links, and filters are
hidden with every panel shown. Reduced motion and Still Panels: the same state changes, instantly.

## Step 7: Specimen traveler (`src/styles/camera.css`, `src/runtime/camera.ts`)

On every non-calm camera move, the first on-screen `<dmns-specimen>` on each side gets
`view-transition-name: specimen`. The browser morphs its position and size; on top of that the
image pair hops in a 48px arc (560ms) and the pose swaps on landing in held frames (old pose
holds to 300ms, new pose appears at 260ms, `steps(1)`), so it reads as drawn, not tweened.

| Case | Result |
|---|---|
| Both pages show a Specimen on screen | It hops from one spot to the other |
| Only one side | It leaves or arrives with its page |
| Documentary page (Egyptian Mummies, anthropology, living cultures) on either side of the reveal | Never named; no Specimen is drawn there at all |
| Reduced motion or Still Panels | Never named; the calm crossfade |
| Same-document morphs | The Specimen stays in its panel |
