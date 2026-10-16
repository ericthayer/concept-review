# Concept Review

Read `.agents/skills/build-website-concepts/SKILL.md` for concept creation and
`.agents/skills/artifact-template-concept-review/SKILL.md` for the review presentation.
The skills hand off through `brief.json`, `review.config.json`, and `concepts/{a,b}/`.

The comparison layout is an established visual checkpoint. Preserve its composition,
colors, typography, spacing and preview behavior unless explicitly asked to redesign it.
Preserve intentional user changes. Keep concept styling isolated from the review shell.

Canonical reusable code lives inside the presentation skill at `assets/source/`.
Do not maintain a second engine copy. Edit example content in `/example`, never its
generated `/example/dist`. Use named ES module exports and TypeScript contracts.

Run `npm run check` before a release. Verify direct concept routes, keyboard use,
both viewport modes and feedback registration on Netlify. Report any unavailable
browser checks. Do not post test feedback to production without authorization.

Do not invent client results, metrics, contact information or project approvals.
Do not deploy confidential client concepts publicly by default. Confirm their intended
audience when a deployment destination does not establish it. The example in this repo
is explicitly authorized for public deployment to concept-review.netlify.app.
