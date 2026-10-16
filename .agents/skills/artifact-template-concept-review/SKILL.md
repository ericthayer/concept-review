---
name: artifact-template-concept-review
description: Present exactly two website concepts in the reference-backed Concept Review HTML template, with side-by-side live previews, Desktop/Mobile controls, direct concept routes and structured client feedback. Use for white-label client design presentations, concept comparisons, or packaging the output of build-website-concepts.
---

# Concept Review

Preserve the reference composition: warm neutral shell, identity header, two-line
editorial heading, paired browser frames, viewport toggle, concept descriptions and
attributes. Feedback extends the page below the comparison. The concept sites own
their own visual systems. Do not restyle established work without an explicit request.

## Inputs and connected workflow

Read `artifact-template.json`, then resolve `assets/source` relative to this skill.
Read `assets/source/contracts/review.d.ts`. Require a project directory containing
`review.config.json`, `brief.json`, and `concepts/a/index.html`, `concepts/b/index.html`.

If either concept is missing or the brief lacks purpose, aesthetics, functionality
or a visual reference, load `../build-website-concepts/SKILL.md`. Let that workflow
interview and build first. Do not substitute generic starter pages for client-ready work.
If both concepts already exist, use them directly after checking the shared contract.

## Prepare

- In this repository, use the canonical engine in this skill's `assets/source` and
  create each review with `node <engine>/scripts/scaffold.mjs <new-project>`.
- For a standalone project, copy the complete sanitized `assets/source` including
  hidden files into a fresh empty directory. Preserve the package and template files;
  never run a starter initializer over them. Use its `project/` as the editable review.
  Keep the retained skill source unchanged during ordinary template use.
- For native Sites hosting, load the available Sites skill, retain the copied app,
  assign a fresh Site identity and follow its source/build/deploy workflow. Never
  reuse the original Site identity or repository. If Sites is unavailable, report that
  hosting limitation; the static Netlify workflow remains available when requested.
- For the user's requested GitHub/Netlify workflow, honor that destination instead.
  Read the Netlify deploy and forms guidance. The repository's `netlify.toml` publishes
  `/example/dist`; standalone exports publish `/dist`. Do not create another hosted Site.

## Configure and build

1. Edit project config for client branding, copy and concept metadata. No Eric Thayer
   identity, contact details, imagery or Site IDs belong in a new client scaffold.
2. Preserve schema version 1, concept IDs `a` then `b`, and two distinct safe slugs.
   Configure HTTPS current-site links only. Keep routes same-origin; each directory
   produces a real HTML route. There is no SPA catch-all.
3. Keep the master at `assets/source/templates/master.html` and reuse exported
   renderers in `components/review.mjs`. Use the retained styles and browser modules.
4. Build a draft with:
   `node <engine>/scripts/build.mjs --project <project> --out <project>/dist`.
   Build a release with the same command plus `--release`. This requires a complete
   brief and ready/approved direction records. Build output is disposable; never edit it.
5. If branding requires new tokens, make the explicitly requested change in the copied
   engine's semantic token source. Do not change layout or concept styles as a side effect.

## Feedback and routing

- Publish `/`, each configured concept route, `/thanks/`, and a true `404.html`.
- Keep `?embed=1` for framed concepts. Full-screen navigation must return to review,
  switch concepts, and link `/?concept=a#feedback` or `/?concept=b#feedback`.
- Preserve the static Netlify form named `concept-feedback`, hidden `form-name`,
  review ID, revision, viewport and honeypot. Keep all submitted fields in built HTML.
- Enable Netlify form detection before deployment, then verify the registered form.
  Responses belong in that site's Netlify Forms inbox. Do not claim notification email
  delivery or add notification recipients without explicit authorization.
- Preserve native POST and required-field validation. The Download response action
  exports locally and must never imply submission. Do not send production test feedback
  without authorization. When another host is chosen, provide an actual submission
  adapter or label feedback export-only; Netlify attributes alone do not store data there.
- Feedback is advisory. Do not change brief status to `approved`, publish a winning
  design, or discard the other concept automatically after a response.

## Verify and deliver

Run the repository's `npm run check`, or the copied engine's release build. Check
both routes and their local assets, preview scaling at 1440×1050 and 390×844, the mobile
stacked layout, keyboard navigation, form labels, and full-screen return links.
Use supported browser QA when available; explicitly report unverified visual behavior.
Read deployment state and confirm the exact commit and registered feedback form.

Use the existing git repository and publish only when the user has authorized that
workflow. Confirm the intended audience for confidential client work. `noindex` is
not access control. Report the live URL, repository location, workflow entrypoints and
remaining limitations. Never claim an install or deployment that did not complete.
