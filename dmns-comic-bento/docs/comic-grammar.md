# Comic grammar

The site is a book. These terms are used in conversation, in content and in code.

| Term | Meaning on the site | Code |
|---|---|---|
| Book | The whole site | `src/lib/book.ts` (`BookMap`) |
| Issue | A top-level section: Halls, Special Exhibitions, Theaters, Visit, Programs, School Programs, Science, About, Support | `IssueId` |
| Page | One route; a bento grid of panels | `<dmns-page>` |
| Spread | A band of panels inside a page; scrolling advances spread by spread | `<dmns-spread>`, `SpreadSpec` |
| Panel | One bento cell: art + caption + optional link | `<dmns-panel>`, `PanelSpec` |
| Beat | One frame of a panel's mini-strip (1–4 per panel) | `<dmns-beat-strip>`, `.beat` |
| Gutter | The black space between panels. A material, not empty space | `.spread__grid::before` |
| Caption box | Narrator voice: factual copy in black knockout labels | `<dmns-caption>`, `.knockout` |
| Speech balloon | Only invented characters speak, and only jokes or invitations | `<dmns-balloon>` |
| SFX | Hand-lettered sound word, SVG strokes, max one per spread | `<dmns-sfx>`, `art/sfx.ts` |
| Splash | One panel filling the viewport; the hero of an index or detail page | `#splash`, `.splash__panel` |
| Specimen | The traveler: an invented ink-blot field researcher, one per spread | `<dmns-specimen>` |
| Kicker | Small Jost label above a caption; the only place comic framing touches wayfinding copy | `.kicker` |

## The one rule

Whimsy lives in the panels; wayfinding stays plain. Navigation labels, the info strip,
buttons, form labels and `<title>` use the museum's literal names. Comic framing
("Meanwhile, on Floor 3…", "Special Edition") appears only as kicker or display copy inside panels.

## Voice

- **Caption boxes** carry facts, in the museum's voice, copied from `content/*.json`.
- **Balloons** belong to Specimen only and never carry prices, dates, hours or collection claims.
- Nothing puts words in the mouths of real people, real cultures or human remains.

## Documentary panels

Egyptian Mummies, anthropology collections, human remains and living-culture content
(Changing Landscapes) use `data-mood="documentary"`: sepia and paper only, caption body
type instead of knockout boxes, no Specimen, balloons, SFX, boil or highlighter. This is a
respect boundary enforced in `content.ts` (documentary halls cannot carry a pose) and in
the templates (balloons, SFX and Specimen render only for `lively`/`closed` moods).

## Spread rules (enforced at build time in `src/templates/spread.ts`)

- Panel count must match the layout's slot count (`layouts.ts`).
- At most two pop colors per spread, counted from the actual art fills. A panel that would
  add a third is rendered with its pop fills swapped for halftone (`data-mute`).
- Specimen appears in at most one panel per spread: the first that asks for it.
