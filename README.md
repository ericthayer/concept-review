# Concept Review

Two linked agent skills and a white-label HTML presentation for reviewing two website
concepts. Based on the [Eric Thayer portfolio comparison](https://ethayer-portfolio-directions.ethayer-design.chatgpt.site).

**Example:** [concept-review.netlify.app](https://concept-review.netlify.app/)

## Workflows

| Skill | Responsibility |
| --- | --- |
| `build-website-concepts` | Interview for missing goals, aesthetics, functionality and visual references; implement two distinct concepts from the same content. |
| `artifact-template-concept-review` | Present both concepts with live Desktop/Mobile previews, independent routes, review navigation and structured feedback. |

Skills are checked in under `.agents/skills/` and share `brief.json`, `review.config.json`
and `concepts/a`, `concepts/b`. `AGENTS.md` describes the repository workflow. Agents
without automatic skill discovery can open the two `SKILL.md` files directly.

Example requests:

> Use build-website-concepts to create two website directions for this client. Here is the brief and visual reference…

> Use artifact-template-concept-review to present the two concepts in ./clients/acme and prepare them for feedback.

The concept skill hands off to the presentation skill. The presentation skill returns
to intake when the brief or concepts are missing. Neither treats feedback as approval.

## Current example: DMNS redesign study

The supplied briefs are retained in `example/briefs/`:

- **A — Walk Into Wonder:** architectural imagery, gallery-like reading surfaces,
  layered depth and native transitions.
- **B — Wonder, Panel by Panel:** illustrated comic-grid compositions, finite reveals,
  connected panels and native transitions.

Each has Homepage, Purchase, Visit, an exhibition index, and three exhibition details.
Both share factual content and practical functionality. This replaces the portfolio
demo; the previous example remains in git history.

Edit the named renderers in `example/shared/museum-components.mjs`, content in
`museum-data.js`, and each concept's stylesheet. The master is
`example/templates/museum-master.html`. Run `npm run render:example` to regenerate
tracked HTML; `npm run build` runs this automatically. Edit renderers rather than
regenerated HTML. The skill's generic white-label scaffold remains unchanged.

The B reference video was not attached; its written description was used.
See `example/ASSET_SOURCES.md` and `example/VERIFICATION.md` for provenance and limits.

## Run the example

Use Node 22 or newer. There are no runtime or npm package dependencies.

```sh
npm run check
python3 -m http.server 8080 --directory example/dist
```

Open `http://localhost:8080`. Native feedback submissions require Netlify; local
preview supports response downloads and clearly identifies the submission limitation.

## Create a client review

```sh
npm run scaffold -- clients/acme
```

The command refuses to overwrite an existing directory. Complete:

| Path | What to edit |
| --- | --- |
| `clients/acme/brief.json` | Audience, purpose, primary action, functional scope, reference takeaways and each direction's rationale/tradeoffs. |
| `clients/acme/review.config.json` | Client identity, two-line heading, review revision, descriptions, route slugs and attributes. |
| `clients/acme/concepts/a/` | Standalone HTML, styles and ES modules for concept A. |
| `clients/acme/concepts/b/` | Standalone HTML, styles and ES modules for concept B. |
| `clients/acme/assets/`, `shared/` | Optional shared assets and verified content. |

The starter concepts are scaffolds, not finished client designs. Replace their sample
copy and implement the brief. Set direction status to `ready` after verification;
reserve `approved` for explicit client approval.

```sh
node .agents/skills/artifact-template-concept-review/assets/source/scripts/build.mjs \
  --project clients/acme --out clients/acme/dist --release
```

A draft build omits `--release`. Release builds reject incomplete intake and draft
directions. Never edit generated `dist`. Slugs must be distinct lowercase path names;
unsafe paths and reserved routes are rejected. Change all concept-owned hardcoded links
if you change a slug; the shared navigation reads generated config automatically.

## Template structure

Canonical reusable source is inside the presentation skill's `assets/source/`, so the
skill and code travel together without maintaining duplicate templates:

```text
.agents/skills/
  build-website-concepts/
    SKILL.md
    references/interview.md
  artifact-template-concept-review/
    SKILL.md
    artifact-template.json
    assets/source/
      templates/master.html
      components/review.mjs
      styles/{base,review}.css
      browser/{review,concept-nav}.js
      contracts/review.d.ts
      scripts/{scaffold,validate,build}.mjs
      project/                    # white-label concept scaffold + config
example/                          # DMNS redesign study, separate from template
tests/
netlify.toml
```

The presentation skill was initialized with Template Creator. The repository is the
source of truth; committing it does not automatically install it into a ChatGPT gallery.
To use the workflows elsewhere, copy both complete skill directories into that
workspace's `.agents/skills`. Do not copy only SKILL.md: the retained source is required.

For a standalone code export, copy the presentation skill's complete `assets/source/`
into an empty repository, including hidden files. Edit `project/`, run `npm run build`,
then publish `dist/`. The `.openai/hosting.json` contains only a static directory and no
original Site identity; use a new identity if choosing Sites hosting.

## Routes and feedback

| Route | Purpose |
| --- | --- |
| `/` | Comparison page and feedback form. |
| `/concept-a/` | Example A; the route is configurable for other reviews. |
| `/concept-b/` | Example B; the route is configurable for other reviews. |
| `/?concept=a#feedback` | Return from A with its feedback choice selected. |
| `/thanks/` | Native form submission destination. |

Desktop previews use a 1440×1050 viewport scaled to each column. Mobile previews use
390×844. The presentation stacks the concepts on small screens. Full-screen views
show review navigation; `?embed=1` hides that navigation inside the previews.

The built HTML contains a Netlify form named `concept-feedback`. Enable form detection
on the target Netlify site before its next deploy. Responses contain review ID, revision,
viewport, preferred direction, what to keep, what to change, reviewer name and optional
email. View responses in **Netlify → concept-review → Forms → concept-feedback**.
The download action saves JSON locally and does not submit anything.

No notification recipients are configured. Configure notifications explicitly if needed.
The template uses native POST so server failures remain visible; it never displays a
client-side success message merely because a network request was attempted. Netlify
spam filtering can route legitimate submissions to spam. Check both folders.

## Deploy

The root `netlify.toml` runs `npm run check` and publishes **example/dist** from the
connected GitHub repository. No database, API key or serverless function is required.
Each page has a physical HTML entrypoint; no SPA rewrite masks invalid routes.

The public example is explicitly authorized. For confidential clients, establish access
control before deployment. `noindex` and unguessable URLs are not privacy controls.
Feedback stays in the Netlify inbox, not in the public repository. Review storage limits
and retention requirements for your Netlify plan before using it at client scale.

## Verification and design lock

`npm run check` tests fresh scaffolding, intake gates, route validation, HTML escaping,
form fields, repeatable builds and local asset/import resolution. Browser checks still
need a supported browser environment: Desktop/Mobile toggles, keyboard use, reduced
motion and concept interactions. Production feedback tests require explicit permission.

Preserve the approved comparison visual language. Branding and copy are configurable;
changes to typography, spacing or layout require a requested design change. Keep concept
styles isolated and keep deliberate user edits intact.

Reusable source is covered by the repository license. Example museum imagery and
fonts remain subject to their original rights; see `example/ASSET_SOURCES.md`. They are
not included in new client scaffolds and should not be reused as client assets.
