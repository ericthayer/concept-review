---
name: build-website-concepts
description: Build two distinct website design concepts from a shared client brief and visual references, then hand them to Concept Review for side-by-side presentation and feedback. Use for client concept exploration, two design directions, or creating the concept sites behind a comparison page. Interview when purpose, aesthetics, functionality or visual inspiration is missing.
---

# Build Website Concepts

## Resolve the brief

1. Read the user's brief, approved checkpoints, project instructions and available references.
2. Read `references/interview.md`. Interview only for missing purpose, aesthetics,
   functional scope, or visual reference. A vague request, a screenshot without a goal,
   and a complete feature list without inspiration all require targeted questions.
   Treat an inaccessible reference as missing until a screenshot or description replaces it.
3. Read `../artifact-template-concept-review/SKILL.md` and its
   `assets/source/contracts/review.d.ts` for the shared handoff contract.
4. For a new review, run the companion scaffold into a new directory:
   `node <presentation-skill>/assets/source/scripts/scaffold.mjs <project>`.
   Never scaffold over existing work. For an existing review, inspect its files first.
5. Complete `<project>/brief.json`. Capture goal, audience, primary action, aesthetics,
   functionality, content source, references with specific takeaways, and constraints.
   Keep both directions at `draft` while building.

## Create two coherent directions

- Use the same verified content, functional scope and primary visitor journey in both.
- Define a rationale and tradeoffs for each direction. Make a meaningful difference
  in visual hierarchy, navigation or interaction; a color swap is insufficient.
- Use the retained concept HTML/CSS/ES-module scaffold in `concepts/a` and `concepts/b`.
  Establish each direction's tokens and master layout before expanding its pages.
- Make real content and required interactions available. Use named module exports,
  semantic HTML, explicit labels, keyboard focus, reduced-motion support and mobile layouts.
- Keep optional dependencies minimal. A framework implementation must also include
  the standalone compiled HTML output in the concept directory.
- Mount shared review navigation with `/review/concept-nav.js`. Give concept A the ID
  `a` and concept B the ID `b`. Hide review chrome only for `?embed=1`; support the
  comparison link, switching concepts, and feedback in full-screen views.
- Keep assets in `<project>/assets`, shared content in `<project>/shared`, and concept
  styles local. Preview routes come from config, not guessed URLs. Use relative URLs
  inside each concept or the configured root routes. Avoid cross-origin frames.
- Preserve approved designs and intentional user edits. A request to edit B must not
  restyle A or the comparison shell. Never invent metrics, claims or contact links.

## Hand off

1. Populate both entries in `review.config.json`: IDs `a` then `b`, unique slugs,
   titles, taglines, preview labels, descriptions, link labels and design attributes.
2. Verify both concept entrypoints, primary actions, mobile layouts, direct links,
   keyboard behavior, browser history and reduced motion. Record verification limits.
3. Set direction status to `ready` only after implementation review. `approved` is a
   client decision; never infer approval from generated code or a feedback submission.
4. Invoke the companion presentation workflow with the project directory. It owns
   the shell, paired preview scaling, feedback form and publication checks. Do not
   rebuild the shell in a new visual style or claim a deployment succeeded without evidence.
