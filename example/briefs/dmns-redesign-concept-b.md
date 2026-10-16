Act as an art director, motion designer, and senior frontend engineer. Design and build a complete website redesign for the **Denver Museum of Nature & Science**: https://www.dmns.org/.

Create an artistic, slightly whimsical experience built around an **interactive bento grid that reads like a living comic strip**. Visitors should feel drawn from one discovery to the next as panels expand, illustrations come alive, and shared elements travel between views.

The creative concept is **“Wonder, panel by panel.”**

Balance the museum’s scientific authority and institutional prestige with curiosity, humor, and visual surprise. Make the experience engaging for adults, families, students, and first-time visitors.

**1. Interpret the reference**

Study the attached `bento-grid-example.mp4`.

Carry forward its strongest qualities: bold ink borders, tightly connected panels, expressive condensed headlines, limited punchy colors, playful illustrated subjects, and moments of animated surprise alongside stable reading areas.

Extend that visual language into a responsive website with scroll choreography, interactive panel transformations, and substantial native View Transitions API interactions.

Treat the reference as visual inspiration. Create original artwork, compositions, and motion appropriate to the museum.

**2. Establish the art direction**

Imagine an artist-designed science publication whose panels have become interactive windows into the museum.

Use a consistent ink-and-paper visual system:

- Soft paper backgrounds, near-black typography, and confident panel outlines.
- The museum’s existing green as the primary accent, sampled from its assets.
- A small, coordinated set of secondary illustration colors.
- Distinctive condensed display typography paired with a highly readable body face.
- Cutout specimen photography, expressive illustrations, restrained halftone shading, and occasional handwritten annotations.
- Minimal corner rounding, consistent gutters, and deliberate alignment.

Preserve the museum’s real logo and recognizable identity. Let whimsy come from composition, timing, and illustration.

Keep textures subtle and static. Keep body text crisp. Use comic devices such as caption boxes, reveal windows, occasional speech bubbles, and subjects crossing a panel boundary selectively.

Art direction should feel cohesive across every panel. Every decorative detail should contribute to a discovery or a story.

**3. Make the grid the storytelling structure**

Begin the bento composition in the first viewport. Integrate the opening headline and primary actions into the grid itself.

Use a 12-column desktop grid with asymmetric arrangements of large scenes, tall specimen portraits, compact discoveries, and practical information panels. Maintain consistent gutters, approximately 6–10px, with substantial visual boundaries.

Create a readable sequence of illustrated spreads:

**Opening spread: “Follow your curiosity.”** A large illustrated or photographic museum scene anchors the composition. Smaller neighboring panels introduce a fossil, an astronomical discovery, and a clear visit-planning action. Establish personality immediately.

**Deep time.** Use Prehistoric Journey as the narrative anchor. A fossil fragment in one panel connects to a larger skeleton in another. Opening a discovery reveals a verified fact and an exhibition link. A restrained illustrated dinosaur reaction provides a moment of humor.

**Life all around us.** Draw on the Wildlife Halls. Use a habitat panorama, an animal close-up, and a specimen detail. Create visual connections across neighboring panels through a shared landscape or illustrated trail.

**Beyond Earth.** Introduce Space Odyssey and Gates Planetarium through orbital diagrams, celestial imagery, and an expanding circular aperture. Let a small planet become the visual anchor of a larger view.

**Science is something we do.** Show research, collections, and people at work. Use a scientist’s portrait, a real research story, and a small interactive observation. Connect the imaginative presentation to the museum’s scientific purpose.

**Come discover it in person.** Finish with a beautifully composed practical spread containing hours, directions, accessibility, tickets, membership, and upcoming experiences.

Give each spread a different arrangement and one memorable interaction. Keep its reading order obvious. Each panel should have a clear role: scene, story, discovery, or action.

**4. Choreograph scroll and interaction**

Give panels a consistent behavior vocabulary:

- **Reveal:** an illustrated flap, aperture, or mask uncovers a scene.
- **Expand:** a selected panel grows while neighboring panels settle into a complementary arrangement.
- **Connect:** an object or visual motif links two neighboring panels.
- **Inspect:** a specimen advances slightly toward the visitor and reveals interpretation.
- **Return:** the expanded view resolves into its original panel and restores context.

On scroll, reveal scenes progressively and introduce occasional changes of emphasis. Use controlled sequences: the panel frame appears, the subject becomes visible, then supporting interpretation settles into place.

Keep important titles, exhibition status, and actions readable from the initial panel state. Essential information must remain available without hovering, completing an animation, or discovering a hidden interaction.

Make surprises finite and purposeful: a dinosaur glances toward a neighboring panel, an illustrated orbit completes once, or a fossil drawing resolves into specimen photography. Provide resting states between these moments.

Preserve native scrolling. Reserve stable space for changing compositions so the page does not jump when panels expand. Avoid rearranging content while someone is reading it or interacting with a control.

Use hover for optional previews; provide equivalent focus and touch behavior. Make clickable panels visibly identifiable.

**5. Use real view transitions throughout**

Implement actual continuity between application states using the native View Transitions API.

| Interaction | Intended transition |
|---|---|
| Panel → expanded story | The panel’s frame enlarges; its image and title move into their new positions. Neighboring panels reposition coherently. |
| Exhibition preview → detail | The same specimen or scene becomes the detail hero, preserving visual identity. |
| Expanded story → grid | Reverse the transition and restore the originating panel, focus, and scroll position. |
| Exhibition filter change | Retained panels move smoothly into their new positions while results enter and leave. |
| Discovery drawing → specimen | Preserve a shared silhouette or frame as the illustration reveals authentic photography. |
| Next story | Carry one connecting object or motif into the adjacent narrative view. |

Assign stable, unique `view-transition-name` values to shared frames, images, and titles. Coordinate updates with the framework’s DOM commit lifecycle.

Use native transitions for discrete state changes. Use CSS scroll-driven animation or GSAP ScrollTrigger for continuous scroll choreography. Keep these responsibilities separate.

Start with 500–750ms for major panel transformations, 250–400ms for smaller reveals, and 120–180ms for control feedback. Use expressive easing with a settled finish; keep reading surfaces stable.

Coordinate rapid clicks and interrupted transitions. Feature-detect support and provide immediate, fully functional state changes when the API is unavailable.

Consult the [official View Transitions documentation](https://developer.chrome.com/docs/web-platform/view-transitions) for the implementation.

**6. Ground the content in the real museum**

Review the [current website](https://www.dmns.org/), [permanent exhibitions](https://www.dmns.org/exhibitions/permanent-exhibitions/), and [museum mission](https://www.dmns.org/about/) before building.

Use real exhibition names, accurate scientific facts, and verified visitor information. Check current closures, dates, hours, and admission details. Preserve existing navigation labels and destination URLs where available.

Use authentic museum photography and collection imagery with appropriate usage rights and attribution. Create original illustrations to support the storytelling. Keep generated concept artwork distinguishable from documentary images of actual specimens or galleries.

Write concise, curious copy. Pair an intriguing question with a satisfying explanation. Use accurate facts as the reward for exploration.

Keep “Buy Tickets” and “Plan Your Visit” consistently accessible. Include direct navigation to exhibitions, films and shows, programs, school resources, science, and support.

**7. Build and verify the complete experience**

Deliver the homepage, a filterable exhibition index, a reusable exhibition detail experience populated with at least three real exhibitions, and a practical visit-planning page. Connect ticketing, membership, and donation actions to verified museum destinations.

Use the existing project stack. If starting fresh, use React, TypeScript, CSS Grid, native view transitions, and a clearly scoped animation layer.

On tablets, simplify to a six-column composition. On phones, use a deliberate one- or two-column reading sequence with full-width expanded stories. Preserve logical document order, readable text, comfortable touch targets, and freedom from horizontal overflow.

Honor `prefers-reduced-motion` and offer a persistent motion preference. Reduced-motion mode must retain every discovery and action through static presentation or brief fades.

Support keyboard access, visible focus, accessible disclosure controls, focus restoration, browser history, deep links, and Back/Forward navigation.

Optimize imagery, reserve media dimensions, lazy-load later spreads, and avoid unnecessary full-page animation work. Keep animated elements isolated and clean up their lifecycle correctly.

Verify the finished experience on desktop and mobile, with keyboard navigation, reduced motion, unsupported-API fallbacks, rapid interactions, and every primary action.

**The result should invite visitors to explore “just one more panel,” reward their curiosity with something meaningful, and make visiting the museum feel like the natural next discovery.**