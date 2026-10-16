# Browser support

Feature-detected, never UA-sniffed (`src/runtime/motion-state.ts`).

## Verified

| Date | Engine | Version | How | Result |
|---|---|---|---|---|
| 2026-10-16 | Chromium (Playwright 1.56.1 bundle, headless) | 141 | `npm run check` (axe, no-JS render, 360px fold, reading order) | Pass |

## Not verified in this environment

- Safari / WebKit and Firefox: no browsers available in the build container.
- Real devices (Moto G Power on 4G) and Lighthouse throttled runs.
- Screen readers (NVDA, JAWS, VoiceOver): automated axe checks only.
