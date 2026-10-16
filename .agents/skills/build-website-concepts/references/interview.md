# Intake questions

Use existing conversation context and supplied sources first. Ask only for gaps, in
small batches (at most three questions per round). Do not ask the user to repeat a
complete brief. Ask a direct question when answers affect the work; do not silently
turn assumptions into confirmed requirements.

1. Goal: What is this site for, who needs it, and what should they do first?
2. Functionality: Which actions must work in the concept? Separate core behavior
   from later integrations and identify what is illustrative.
3. Aesthetics: What should it feel like? Ask for concrete traits and anything to avoid.
4. Visual reference: Ask for a screenshot, URL, or specific described inspiration.
   A screenshot plus no goal still requires a goal interview. A complete functional
   brief plus no visual reference still requires a visual-reference interview.

When the user cannot supply inspiration, offer one specific creative direction in
plain language and get their response. Record that chosen described inspiration in
`references` with `kind: description`. Do not pretend the user supplied a screenshot.
If a URL cannot be accessed, state the limitation and request a screenshot or description.

Do not block on optional budget, brand history, or technology details for a small
concept. Use established project conventions unless the requirement changes them.

Stop the interview once purpose, audience, primary action, aesthetics, functional scope
and at least one usable visual reference are understood. Record content provenance,
constraints and assumptions in `brief.json`. Do not begin visual implementation while
the goal or visual reference remains unresolved.
