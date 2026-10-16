# Browser support

Feature-detected, never UA-sniffed (`src/runtime/motion-state.ts`).

## Verified

| Date | Engine | Version | How | Result |
|---|---|---|---|---|
| 2026-10-16 | Chromium (Playwright 1.56.1 bundle, headless) | 141 | `npm run check` (axe, no-JS render, 360px fold, reading order) | Pass |
| 2026-10-16 | Chromium | 141 | `motion.spec.ts`, `camera.spec.ts`, `morph.spec.ts`, `fallbacks.spec.ts`: scroll-driven ink, boil cap, beats, cross-document view transitions with types, reduced motion and Still Panels via `getAnimations()` | Pass |

## Lighthouse (2026-10-16)

Lighthouse 12.8.2, run from the build container against the password-protected Netlify deploy
(default mobile profile with simulated Moto G Power throttling, and the desktop preset).
Scores are Performance / Accessibility / Best Practices / SEO; times in seconds.

| Page | Mode | Scores | FCP | LCP | CLS | TBT (ms) |
|---|---|---|---|---|---|---|
| Cover | mobile | 100 / 100 / 100 / 100 | 1.0 | 1.5 | 0.018 | 0 |
| Cover | desktop | 100 / 100 / 100 / 100 | 0.3 | 0.3 | 0.001 | 0 |
| Halls | mobile | 100 / 100 / 100 / 100 | 1.1 | 1.5 | 0.043 | 0 |
| Halls | desktop | 100 / 100 / 100 / 100 | 0.3 | 0.3 | 0.004 | 0 |
| Prehistoric Journey | mobile | 100 / 100 / 100 / 100 | 0.9 | 1.4 | 0.018 | 0 |
| Prehistoric Journey | desktop | 100 / 100 / 100 / 100 | 0.3 | 0.3 | 0.001 | 0 |
| Special Exhibitions | mobile | 100 / 100 / 100 / 100 | 0.9 | 1.5 | 0.019 | 0 |
| Special Exhibitions | desktop | 100 / 100 / 100 / 100 | 0.3 | 0.3 | 0.002 | 0 |

The first run measured mobile CLS at 0.29–0.32 (JS-revealed controls pushing `<main>` down); fixed
before these numbers. Simulated throttling is not a real device.

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
- Real devices (Moto G Power on 4G): Lighthouse above simulates one; no physical device was used.
- axe under emulated forced colors: its contrast rule reads unforced backgrounds, so forced colors
  are checked by computed styles and a screenshot only.
- Frame rate: the tour recording is a headless screencast, so it under-represents smoothness.
- Screen readers (NVDA, JAWS, VoiceOver): automated axe checks only.
