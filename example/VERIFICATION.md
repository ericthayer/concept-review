# DMNS redesign example verification

## Implemented

- Homepage, Purchase, Visit, exhibition index, and three exhibition detail pages per concept.
- Shared content source, HTML master, named page renderers and typed content contract.
- Authentic institutional logo, sampled museum green and Jost typeface.
- A: architectural homepage, three live DOM depth planes, gallery chapters and imagery.
- B: 12-column desktop comic grid, six-column mobile composition, original illustrative
  dinosaur art, finite fossil reveal and specimen interpretation panels.
- Native cross-document navigation and same-document filter, panel, member-state and
  planner-result transitions, with capability detection and motion fallbacks.
- Persistent motion preference, system reduced-motion support and mobile depth simplification.
- Native modal focus containment, Escape dismissal and focus return.
- Member-aware admission estimate, bounded counters and official checkout handoff.
- Date/interests-based visit starting point, closure handling, FAQs and practical links.
- Preserved comparison presentation, preview scaling and feedback form.

## Automated checks

`npm run check`: seven passing tests covering intake, route safety, scaffolding,
escaping, form contract, local assets/imports, page coverage, removal of portfolio
content, admission estimates and closure behavior. Museum modules and the renderer
also pass `node --check`.

## Verification limits

The managed environment does not expose the supported control-browser skill.
Interactive desktop/mobile, keyboard, View Transitions, rapid interactions and
reduced-motion behavior require browser verification. Source and fallbacks are
checked; interactive behavior is not declared visually verified.

LCP <2.5s, INP <200ms and CLS <0.1 are targets, not measured results. Live routes and
Netlify form registration will be checked after deployment. No production test
feedback will be sent without authorization. The missing B reference video is
recorded in ASSET_SOURCES.md. Inventory, reservations and checkout remain on DMNS.
