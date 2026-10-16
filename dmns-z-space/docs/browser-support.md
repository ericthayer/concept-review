# Browser support

Feature detection only, never UA sniffing:

| Capability | Detection | Used for |
|---|---|---|
| Same-document VT | `'startViewTransition' in document` | floor switcher, filter, vitrine (`src/dom/transition.ts`) |
| Cross-document VT | `'onpagereveal' in window` (no CSS test exists for `@view-transition`) | page moves; absent → `html.vt-fallback` lights-up entrance |
| VT classes | `CSS.supports('view-transition-class: a')` | doorway morph styling (`hall-door`) |
| Scroll timelines | `@supports (animation-timeline: view())` | scroll-as-walking |
| Speculation Rules | `<script type="speculationrules">` (ignored where unsupported) | prerendering doorway targets |
| Render-blocking scripts | `blocking="render"` (ignored where unsupported) | registering `pagereveal` before the first frame |

## Verified

| Date | Engine | Version | How | Result |
|---|---|---|---|---|
| 2026-10-16 | Chromium (headless, Playwright 1.56.1) | 141.0.7390.37 | `npm run check` (Playwright suite), feature probe | All detections true. `enter`/`exit`/`lateral-*`/`ascend`/sealed choreography, doorway morphs, HUD stillness, calm mode, same-document moves and keyboard walkthrough asserted through `getAnimations()` and `viewTransition.types` |
| 2026-10-16 | Chromium 141, `onpagereveal` removed by init script | 141.0.7390.37 | Playwright | Navigation works; `vt-fallback` lights-up entrance runs |
| 2026-10-16 | Chromium 141, `prefers-reduced-motion: reduce` / Stillness | 141.0.7390.37 | Playwright | No transform, filter or blur animation on any pseudo-element or element |

## Lighthouse (deployed, password-protected Netlify site)

Lighthouse 12.8.2, headless Chromium 141, run 2026-10-16 against the password-protected review deploy with the
session cookie. Scores are Performance / Accessibility / Best Practices / SEO.

| Page | Mobile | Desktop | Mobile LCP | Mobile CLS | Mobile TBT |
|---|---|---|---|---|---|
| `/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.4 s | 0.006 | 10 ms |
| `/halls/` | 99 / 100 / 100 / 100 | 99 / 100 / 100 / 100 | 1.4 s | 0.074 | 10 ms |
| `/halls/prehistoric-journey/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.4 s | 0.006 | 10 ms |
| `/special-exhibitions/mythic-creatures/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.4 s | 0.006 | 0 ms |

- The first run scored 93 for Best Practices everywhere: the production CSP refused the inline speculation
  rules, so doorway prerendering never ran. Fixed by hashing the rules into `script-src`; an e2e test now applies
  the built CSP and fails on any refusal.
- `/halls/` CLS 0.07 is the floorplan enhancing to one floor after first paint. It is inside the 0.1 budget.
- Remaining "render-blocking" notes are `z-space.js`, which is `blocking="render"` on purpose so `pagereveal`
  is wired before first paint.

## Could not be run here

- **Firefox and Safari/WebKit.** Only Chromium is installed in this environment. I didn't check their current
  support for cross-document VT, `view-transition-class`, VT types or scroll timelines against live
  release notes. Where a feature is missing, the fallback ladder in `docs/motion-spec.md` applies by
  design. It still needs testing in real browsers.
- **Real-device field metrics.** The Lighthouse runs below are lab numbers: mobile uses Lighthouse's simulated
  Moto G Power on slow 4G, not a physical phone, and INP needs real interactions.
- **Screen readers** (NVDA, JAWS, VoiceOver). axe runs on every route; manual AT passes are outstanding.
- **Prerender + emulated reduced motion.** Chromium's prerendered pages don't inherit DevTools media
  emulation, so the e2e suite activates links by keyboard focus + Enter, which doesn't trigger
  `moderate` prerendering. Real users' OS preferences do apply to prerendered pages.
