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

## Could not be run here

- **Firefox and Safari/WebKit.** Only Chromium is installed in this environment. I didn't check their current
  support for cross-document VT, `view-transition-class`, VT types or scroll timelines against live
  release notes. Where a feature is missing, the fallback ladder in `docs/motion-spec.md` applies by
  design. It still needs testing in real browsers.
- **Throttled-device Lighthouse** (Moto G Power, 4G) for the LCP/INP/CLS budgets in §11. The build gates the JS
  and CSS byte budgets. The field metrics need a Lighthouse run against a deployed URL.
- **Screen readers** (NVDA, JAWS, VoiceOver). axe runs on every route; manual AT passes are outstanding.
- **Prerender + emulated reduced motion.** Chromium's prerendered pages don't inherit DevTools media
  emulation, so the e2e suite activates links by keyboard focus + Enter, which doesn't trigger
  `moderate` prerendering. Real users' OS preferences do apply to prerendered pages.
