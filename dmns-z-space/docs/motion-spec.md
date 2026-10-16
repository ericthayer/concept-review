# Motion spec

Source of truth: `src/styles/transitions.css` (page and in-page moves) and `src/styles/scroll.css`
(scroll-linked and ambient motion). Durations and easings are tokens in `src/styles/tokens.css`.
Only `transform`, `opacity` and `filter` animate.

Sign convention: a physical camera. Walking right slides the room left; climbing slides the room down.
(The brief's `∓` notation was ambiguous about direction. The brief allows tuning values if the shape holds.)

Caps (vestibular safety, asserted by `tests/unit/motion-caps.test.ts`): one rotation axis per transition
(`rotateY` on lateral only), no roll, no shake, total scale delta ≤ 1.4× (largest is `enter` old: 1 → 1.35).

## Cross-document (page → page)

Opacity is staged to avoid double exposure: outgoing rooms are dark by 55% (enter) or 60% (exit) of the move,
and incoming rooms stay dark until 25% (enter), 20% (exit) or 35% (lateral, stairs).

| Type | Trigger | Old page | New page | Duration · easing | Calm substitute |
|---|---|---|---|---|---|
| `enter` | depth increases | scale 1 → 1.35, opacity 1 → 0, blur 0 → 6px, origin = clicked doorway centre | scale 0.82 → 1, opacity 0 → 1, brightness 0.4 → 1 | 720ms · `cubic-bezier(.2,.7,.1,1)` | 150ms opacity crossfade |
| `exit` | depth decreases | scale 1 → 0.82, brightness 1 → 0.4, opacity → 0 | scale 1.2 → 1, opacity 0 → 1 | 600ms · same | 150ms crossfade |
| `lateral-r` | same depth, x increases | translateX 0 → −30vw, rotateY 0 → 8deg (perspective 1400px), fade | translateX 30vw → 0, rotateY −8deg → 0, fade in | 640ms · same | 150ms crossfade |
| `lateral-l` | same depth, x decreases | translateX 0 → 30vw, rotateY 0 → −8deg, fade | translateX −30vw → 0, rotateY 8deg → 0 | 640ms · same | 150ms crossfade |
| `ascend` | floor increases | translateY 0 → 40vh, fade | translateY −40vh → 0; stair rails streak −80vh → 80vh (2× speed), peak opacity 0.6 | 700ms · same | 150ms crossfade, no rails |
| `descend` | floor decreases | translateY 0 → −40vh, fade | translateY 40vh → 0; rails 80vh → −80vh | 700ms · same | 150ms crossfade, no rails |
| `enter` + `sealed` | entering Gems and Minerals | scale 1 → 1.12, fade | scale 0.94 → 1, brightness 0.4 → 1, stops at the scrim | 480ms · same | 150ms crossfade |
| `reload` | same path | `skipTransition()` | none | none | none |
| Doorway morph (`view-transition-class: hall-door`) | `enter`/`exit` between a card and its hero | card image + title → hero plate + `<h1>` | n/a | group: 720ms enter / 600ms exit · same | names withheld: no morph |
| HUD (`hud-header`, `hud-minimap`, `hud-ticket`) | every move | hidden | shown instantly, `animation: none` | n/a | same |

Precedence in `resolveTransition`: same path → floor change → depth change → lateral. The Directory spans
floors 1–3, so Directory ↔ hall is a depth move, not a stair ride.

## Same-document (in-page)

| Type | Where | Motion | Duration | Focus / announcement | Calm substitute |
|---|---|---|---|---|---|
| `floor-up` / `floor-down` | Directory floor switcher | stage group: same as `ascend` / `descend`; page root still | 700ms | focus moves to the new floor's heading; polite live region announces it | instant swap |
| `filter` | Special Exhibitions | staying cards morph to new positions; leaving cards fade to darkness (opacity → 0, brightness → 0.3, scale → 0.96); arriving cards reverse that | 640ms move, 600ms out, 720ms in | focus stays on the pressed toggle; count announced | instant swap |
| `vitrine-open` / `vitrine-close` | hall object grid | case plate morphs into the dialog plate (`vitrine-plate`) | 720ms | native `showModal()`; Esc, Close or backdrop closes; focus returns to the opener | instant open/close |

## Scroll-linked and ambient

| Effect | Timeline / range | Motion | Calm or no support |
|---|---|---|---|
| Hall hero veil | `scroll(root)`, 0 → 70vh | darkness veil scale 1 → 2.4, opacity 1 → 0.15 (spotlight widens) | veil not rendered |
| Diorama backdrop | `view()`, entry 0% → exit 100% | translateY 6vh → −6vh | static |
| Diorama specimen | `view()`, entry 0% → exit 100% | translateY 14vh → −14vh | static |
| Label cards, vitrine cases | `view()`, entry 0% → cover 50% (40%) | scale 0.94 → 1. Never fades, so text holds full contrast | static |
| Atrium arrival | time, on load | spotlight opacity 0 → 1 + scale 0.88 → 1 (1600ms); headline, hours, CTA rise 0.75rem + fade (900ms, staggered 0/160/260ms) | static |
| Fallback "lights up" | time, on load, engines without cross-document VT | `<main>` opacity 0 → 1, brightness 0.4 → 1, 300ms | 150ms opacity only |

Calm mode = `prefers-reduced-motion: reduce` **or** Stillness on (`localStorage['dmns:stillness']`,
reflected as `html[data-stillness="on"]` before first paint). `prefers-reduced-transparency` removes blur and
scrims in favour of solid surfaces.
