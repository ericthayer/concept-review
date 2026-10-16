Act as a museum creative director, interaction designer, and senior frontend engineer. Design and build an exceptional website redesign for the **Denver Museum of Nature & Science**: https://www.dmns.org/.

The central concept is **“Walk Into Wonder.”** The website should feel like moving through the museum’s halls: approaching an exhibition, crossing its threshold, discovering an object, and continuing into another world.

Express the institution’s prestige through curatorial precision, architectural composition, extraordinary imagery, and thoughtful motion. Preserve its warmth, scientific credibility, and welcome to families, students, and curious visitors.

Build a working, responsive experience with substantial **native View Transitions API interactions** and a coherent journey through **z-space**.

**1. Ground the redesign in the museum**

Review these sources before designing:

- [Current website and visitor journeys](https://www.dmns.org/)
- [Permanent exhibitions](https://www.dmns.org/exhibitions/permanent-exhibitions/)
- [Mission, vision, and values](https://www.dmns.org/about/)
- [Native View Transitions documentation](https://developer.chrome.com/docs/web-platform/view-transitions)

Preserve the real logo, institutional identity, primary navigation labels, and existing destination URLs where available. Verify current exhibition status, hours, prices, and dates before displaying them. Keep temporary closures and visitor notices visible.

Use the museum’s actual exhibitions and collections to drive the storytelling. Distinguish the proposed digital journey from the building’s physical floor plan.

**2. Establish an architectural visual language**

Imagine a beautifully designed exhibition catalogue becoming a place you can enter.

Use monumental photography, generous negative space, precise alignment, confident typography, and compositions that suggest gallery walls, display cases, apertures, and passageways.

Build a restrained palette from mineral whites, pale stone, charcoal, and the museum’s existing green accent, sampled from its assets. Let exhibition photography introduce richer color. Keep interface colors consistent throughout.

Use the institution’s typefaces where available. Otherwise choose a rigorous, distinctive grotesk with excellent reading clarity. Give headings scale and presence without overwhelming the objects. Treat supporting information like well-designed museum interpretation panels.

Favor sharp architectural frames and subtle borders. Use asymmetry with clear hierarchy. Give each chapter a distinct composition while retaining the same underlying design system.

Avoid generic feature-card grids, excessive rounded containers, decorative gradients, floating glass panels, and constant animated embellishment.

**3. Choreograph the homepage as a journey**

Create these connected moments:

**The threshold.** Open with an arresting, full-viewport architectural or exhibition image. A short proposed headline, “Wonder has depth,” sits in a quiet, deliberately placed text area. Include an “Explore the Museum” action and an immediately accessible “Buy Tickets” action. Render the opening scene promptly.

**The approach.** As visitors begin scrolling, a framed exhibition ahead appears to grow closer. Foreground architecture moves past the viewport while the deeper scene advances more slowly. Establish a believable vanishing point and a human walking pace.

**Deep time.** Enter a chapter inspired by Prehistoric Journey. Give a fossil or skeleton commanding scale, with restrained interpretation text and meaningful specimen details. Let the visitor pause and inspect.

**The living world.** Continue into the Wildlife Halls. Use the spatial character of a diorama: foreground habitat, animal subject, distant landscape. The change in depth should feel perceptible without becoming theatrical.

**Beyond Earth.** Transition into Space Odyssey and a pathway to Gates Planetarium. Let imagery expand the perceived scale of the room while the navigation remains grounded and readable.

**Science in progress.** Introduce the museum’s research, collections, and people through an editorial composition that connects the spectacle to real scientific work.

**Your visit begins.** Resolve the journey into a calm, practical planning area with verified hours, directions, accessibility information, tickets, membership, and upcoming experiences.

Give every chapter a readable resting state. Alternate movement with stillness so visitors can absorb the content.

**4. Define a consistent spatial grammar**

Use these relationships throughout the experience:

- Moving deeper into an exhibition advances toward it.
- Returning withdraws toward the previous gallery.
- Moving between neighboring exhibitions travels laterally.
- Opening specimen information brings an interpretation panel forward.
- Persistent navigation remains on a stable foreground plane.

Build depth using CSS perspective, controlled scale, translateZ, layered photography, occlusion, and carefully chosen transform origins. Maintain a consistent horizon and vanishing point within each scene.

Use live DOM layers for continuous spatial effects. View Transition snapshots require their own choreography; do not assume a nested 3D scene retains its depth after snapshot capture.

Choose perspective values by visual testing, starting around 1,000–1,600px. Keep text on stable reading planes. Avoid camera roll, aggressive rotation, extreme zoom, and moving paragraphs.

A single enlarged background image is insufficient. At least one signature scene must demonstrate convincing foreground, middle-ground, and background movement.

**5. Make view transitions central to navigation**

Implement actual transitions between meaningful application states:

| Interaction | Intended choreography |
|---|---|
| Exhibition preview → detail | The selected image becomes the detail hero while its title moves into position. Surrounding content recedes. |
| Detail → previous gallery | Reverse the spatial direction and return to the originating preview and scroll position. |
| Exhibition → next exhibition | Travel sideways through a shared architectural frame. |
| Open specimen information | Bring a reading panel forward while preserving the exhibition as context. |
| Filter exhibitions | Maintain object identity as results rearrange. |
| Open navigation | Reveal a composed wayfinding directory with immediate access to museum destinations. |

Use stable, unique `view-transition-name` values for shared exhibition images, titles, and persistent navigation. Customize the transition pseudo-elements deliberately.

Use `document.startViewTransition()` for same-document updates where appropriate, coordinating DOM commits with the selected framework. For same-origin multi-page navigation, use cross-document transitions when supported.

Feature-detect capabilities and preserve ordinary navigation when unavailable. Coordinate rapid interactions so overlapping transitions cannot leave the interface in an inconsistent state.

Use approximately 650–900ms for major spatial transitions, 300–450ms for panels, and 120–180ms for immediate control feedback. Favor smooth acceleration and settled arrivals. Keep ticket and planning interactions brisk.

**6. Build a useful website around the experience**

Deliver:

- The complete homepage journey.
- A browsable exhibition index.
- A reusable exhibition detail page populated for Prehistoric Journey, Wildlife Halls, and Space Odyssey.
- A practical Plan Your Visit page.
- Working navigation, exhibition filters, information panels, and forward/back navigation.
- Verified links to the museum’s existing ticketing, membership, donation, and other services.

Keep “Buy Tickets” consistently accessible. Provide named chapter links and a “Skip to visit information” link so visitors can choose their own pace.

Every primary control must have a working destination or meaningful behavior. Keep content structured for future updates.

**7. Make the experience comfortable and fast**

Preserve native scrolling. Use at most one concise pinned storytelling sequence on the homepage. Let visitors leave it through ordinary navigation or chapter links.

On mobile, simplify layered scenes, reduce depth travel, remove lengthy pinning, and maintain a comfortable vertical reading flow. Support touch, keyboard navigation, visible focus, readable contrast, and large interaction targets.

Honor `prefers-reduced-motion` and provide a persistent motion preference. Reduced-motion mode must retain all content and functionality while replacing spatial travel with instant changes or brief fades.

Manage focus after navigation and when panels open or close. Preserve browser history, deep links, and scroll restoration. Decorative layers must stay outside the accessibility tree.

Prioritize the opening image, reserve media dimensions, lazy-load later scenes, and animate transforms and opacity wherever practical. Target LCP below 2.5 seconds, INP below 200ms, and CLS below 0.1; report measured results separately from targets.

**8. Implement and verify the complete result**

Use the existing project stack if one exists. For a fresh project, use React, TypeScript, and native CSS. Use native view transitions for navigation and state continuity; add GSAP ScrollTrigger only where scroll choreography needs it. Keep animation ownership clear.

Prefer authentic museum photography and collection imagery with appropriate usage rights and attribution. Any generated imagery must be identified as concept material and must not misrepresent the museum’s architecture or specimens.

Before finishing, verify desktop and mobile layouts, reduced-motion mode, keyboard access, direct links, browser Back/Forward, unsupported-API fallbacks, and every primary action.

Show the implemented result, explain the main design decisions briefly, and identify any asset or integration limitations honestly.

**Success means the visitor remembers the feeling of entering the museum, understands what they can discover there, and can plan a visit immediately.**