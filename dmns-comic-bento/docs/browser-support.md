# Browser support

Feature-detected, never UA-sniffed (`src/runtime/motion-state.ts`).

## Verified

| Date | Engine | Version | How | Result |
|---|---|---|---|---|
| 2026-10-16 | Chromium (Playwright 1.56.1 bundle, headless) | 141 | `npm run check` (axe, no-JS render, 360px fold, reading order) | Pass |
| 2026-10-16 | Chromium | 141 | `motion.spec.ts`, `camera.spec.ts`: scroll-driven ink, boil cap, beats, cross-document view transitions with types, reduced motion and Still Panels via `getAnimations()` | Pass |

## Fallback ladder

| Feature | Detected by | Without it |
|---|---|---|
| Cross-document view transitions | `pagereveal` event and `@view-transition` | Instant navigation |
| `:active-view-transition-type()` | (part of the above in shipping engines) | Default crossfade |
| Scroll-driven animations | `@supports (animation-timeline: view())` | Panels render inked and captioned |
| Registered `--ink` (`@property`) | CSS | Strokes render drawn |
| JavaScript | n/a | Static comic; default crossfade between pages |

## Not verified in this environment

- Safari / WebKit and Firefox: no browsers available in the build container.
- Real devices (Moto G Power on 4G) and Lighthouse throttled runs.
- Screen readers (NVDA, JAWS, VoiceOver): automated axe checks only.
