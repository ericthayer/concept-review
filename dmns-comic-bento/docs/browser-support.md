# Browser support

Feature-detected, never UA-sniffed (`src/runtime/motion-state.ts`).

## Verified

| Date | Engine | Version | How | Result |
|---|---|---|---|---|
| 2026-10-16 | Chromium (Playwright 1.56.1 bundle, headless) | 141 | `npm run check` (axe, no-JS render, 360px fold, reading order) | Pass |
| 2026-10-16 | Chromium | 141 | `motion.spec.ts`, `camera.spec.ts`, `morph.spec.ts`, `fallbacks.spec.ts`: scroll-driven ink, boil cap, beats, cross-document view transitions with types, reduced motion and Still Panels via `getAnimations()` | Pass |

## Fallback ladder

| Feature | Detected by | Without it |
|---|---|---|
| Cross-document view transitions | `pagereveal` event and `@view-transition` | Instant navigation |
| `:active-view-transition-type()` | (part of the above in shipping engines) | Default crossfade |
| Scroll-driven animations | `@supports (animation-timeline: view())` | Panels render inked and captioned |
| Registered `--ink` (`@property`) | CSS | Strokes render drawn |
| JavaScript | n/a | Static comic; default crossfade between pages |
| Same-document view transitions | `'startViewTransition' in document` | Look closer, floor tabs and filters change state instantly (e2e: `fallbacks.spec.ts`) |
| All of the above (`data-motion="none"`) | boot script | 240ms opacity-only splash arrival (`fallbacks.css`) |
| `prefers-reduced-transparency` | media query | Ink-drop and new-issue sink keep geometry, never go half see-through |
| `forced-colors` | media query | Panels get CanvasText edges; pressed and selected controls use Highlight (e2e: `fallbacks.spec.ts`) |

## Not verified in this environment

- Safari / WebKit and Firefox: no browsers available in the build container.
- Real devices (Moto G Power on 4G) and Lighthouse throttled runs. Lighthouse is not installed in
  the build container; budgets are enforced by `npm run check:budgets` instead.
- axe under emulated forced colors: its contrast rule reads unforced backgrounds, so forced colors
  are checked by computed styles and a screenshot only.
- Frame rate: the tour recording is a headless screencast, so it under-represents smoothness.
- Screen readers (NVDA, JAWS, VoiceOver): automated axe checks only.
