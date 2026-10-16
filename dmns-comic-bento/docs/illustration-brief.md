# Illustration brief

All art in this build is placeholder line art drawn in code (`art/*.ts`). Every placeholder
SVG carries `data-placeholder="true"` and every panel holding one shows a "Sketch" stamp. Replace each figure 1:1:
same id, same viewBox, same layer structure. Reference SVGs with frames as separate groups
are generated into `art/generated/` by `node scripts/build-sprites.ts`.

## House style

- Single-weight black line, 3px at 1× panel scale (`vector-effect: non-scaling-stroke`), slightly wobbly, open shapes allowed.
- Flat fills, no gradients, no shading except one-color halftone dots.
- Fill layer sits 2–4px off-register from the line layer (the build offsets it; draw fills aligned).
- Accuracy in anatomy, whimsy in posture and expression.
- Three boil frames per pose: same drawing, line wobbling slightly between frames. Never change luminance between frames.
- Pop colors: green `#7cf03a` (art fills), blue `#00a3f2`, orange `#f4911e`, magenta `#e83ad6`, red `#b31f17` (closures only). Max two per spread.
- No raster, no AI imagery, no stock photography, nothing presented as a real DMNS collection object.
- Do not recreate the DMNS logo, the reference video's characters, or any Pokémon material.

## Specimen poses (viewBox `-14 -14 128 128`, 3 frames each)

Specimen is an invented ink-blot creature with field-notebook goggles. Concept device, not a DMNS mascot.

| Figure id | Pose | Used on | Props / fill |
|---|---|---|---|
| `specimen-notebook` | Holding an open field notebook | Mythic Creatures spread, Visit, Programs, School Programs | Notebook (paper) |
| `specimen-tumbling` | Tumbling out of the notebook, rotated −28° | Cover splash panel | — |
| `specimen-climbing` | Mid-step on stairs | Cover "Meanwhile, on every floor…" stair | — |
| `specimen-floating` | Weightless, arms up | Space Odyssey, theater detail pages | Stars |
| `specimen-blocks` | Beside a stack of blocks | Discovery Zone | Blocks: orange, blue, green |
| `specimen-stethoscope` | Wearing a stethoscope | Expedition Health | Chest piece magenta |
| `specimen-binoculars` | Looking through binoculars | Wildlife Halls | Binoculars green |
| `specimen-loupe` | Holding a magnifying loupe | Konovalenko, Cover Halls door, Science | Lens halftone |
| `specimen-digging` | Digging with a shovel | Prehistoric Journey, Science paleontology | Blade paper |
| `specimen-leaves` | Jumping in leaves | Nature Play | Leaves green, orange |
| `specimen-hardhat` | Hard hat, under construction | Gems and Minerals | Hat red |

Specimen never appears on Egyptian Mummies, anthropology or other documentary pages.

## Scenes (viewBox `0 0 320 200`)

| Figure id | Subject | Used on | Pop |
|---|---|---|---|
| `scene-notebook` | Open field notebook | Cover splash panel | — |
| `scene-space` | Ringed planet, stars | Space Odyssey | blue |
| `scene-blocks` | Building blocks, ball | Discovery Zone | orange, blue, green |
| `scene-health` | Heart, DNA helix | Expedition Health | magenta |
| `scene-wildlife` | Diorama frame: mountains, pines, birds | Wildlife Halls | green |
| `scene-vitrine` | Empty vitrine, quiet | Egyptian Mummies (documentary) | sepia |
| `scene-gem` | Faceted gem | Konovalenko, Cover Halls door | blue |
| `scene-stegosaurus` | Stegosaurus: two alternating plate rows, four tail spikes, short forelimbs | Prehistoric Journey | green, orange |
| `scene-construction` | Pencil-blue crystals and scaffold, unfinished hatch | Gems and Minerals | pencil |
| `scene-park` | Trees, leaf pile | Nature Play | green, orange |
| `scene-dragon` | Dragon (beat 1) | Mythic Creatures | green, magenta |
| `scene-unicorn` | Unicorn head (beat 2) | Mythic Creatures | magenta |
| `scene-mermaid` | Mermaid tail out of waves; no human figure (beat 3) | Mythic Creatures | green |
| `scene-landscape` | Horizon and hills, no people | Changing Landscapes (documentary) | sepia |
| `scene-lanterns` | Lantern string, snowflakes | Magical Winter Nights | blue |
| `scene-crate` | Sealed crate (no IP imagery) | Pokémon Fossil Museum: not used, name only | orange |
| `scene-dome` | Planetarium dome | Gates Planetarium, Cover Theaters door | blue |
| `scene-screen` | Giant screen and seat rows | Sturm Infinity Theater | blue |
| `scene-laser` | Static beams (no flashing) | Laser Shows | magenta |
| `scene-drawers` | Collection cabinet | Anthropology & Archaeology (documentary) | sepia |
| `scene-trilobite` | Trilobite | Paleontology & Geology | orange |
| `scene-beetle` | Beetle | Zoology | green |
| `scene-books` | Stacked volumes | Archives (reserved) | blue, orange, green |
| `scene-monitor` | Screen grid | Digital Collections (reserved) | blue |
| `scene-clock` | Clock face | Visit hours | — |
| `scene-pin` | Map pin over roads | Visit address | blue |
| `scene-door` | Door with ramp | Accessibility (reserved) | blue |
| `scene-plaza` | Plaza canopy and tree | Sturm Family Wing | green |
| `scene-calendar` | Calendar | Programs | orange |
| `scene-bus` | School bus | School Programs | orange |
| `scene-microscope` | Microscope | Science | blue |

## Panel sizes to deliver

Art is drawn to the viewBox and scales; the largest renders are the splash (up to ~800×500 CSS px)
and `xl` panels (6×4 grid units, ~700×560 px on desktop). Deliver line and fill layers as separate groups.
