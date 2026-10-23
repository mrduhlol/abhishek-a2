## Disposition

**ship** — bounded follow-up verdict, 2026-10-23, against implementation commit `f8f2cca`. Both material findings from the initial review are resolved and the requested mobile evidence is valid. This verdict covers the scored fixes and recaptured states, together with the unchanged scope supported by the initial review; it is not a new exhaustive audit.

## Material findings

1. **Resolved — Opening speech precedes the jump.** `src/world/AdventureHero.jsx` now holds the guide in the seated pose while the intro plays. The audio `ended` event starts the jump, with a duration-based timeout for silent or failed playback. Reduced motion bypasses the animated hold/jump. `tests/adventure.spec.js` now asserts the seated pose after successful playback begins and the subsequent jump. Once-per-session handling and cleanup remain in place.
2. **Resolved — Reported small accent text exceeds 4.5:1.** Against paper `#f4efdf`, the revised olive `#606b43` in `src/index.css` measures **4.96:1**. Inkora's `#875a32` and Black Jack's `#94503d` in `src/data/projects.js` measure **5.16:1** and **5.26:1** respectively. These values resolve the previously identified small-text failures.

**Resolved — Mobile evidence is complete.** Reopened `.impeccable/review/mobile-project-orbit.png`, `mobile-project-github-widgets.png`, and `mobile-project-docutype.png`: terrain and guide are rendered. `mobile-contact.png` has clear contact content without the introductory quote. `mobile-town.png` shows the settled, fully visible couple in the horizontally scrollable village. No substantive regression is evident in these corrected states. Remaining material findings: **none**.

## Requirement coverage

- The opening preserves the approved large cutout portrait, chest fade, monumental name, seated backpack guide, sound control, and scroll invitation.
- All seven projects have distinct terrain illustrations, factual introductions, and source links. `docs/project-sources.md` supports the copy. Dedicated live subdomains intentionally remain pending; no invented live destinations are present.
- The journey implements climbing, ropes, swinging, walking, sliding, swimming, and jumping poses. The intro sequencing finding is resolved.
- Contact includes mail, copy-email feedback and recovery, and social links. Town residents have contextual replies, walking/working behavior, and keyboard-operable buttons. Either member of the couple triggers the stare response.
- Source and supplied tests support reduced-motion handling, readable content without WebGL, semantic buttons, focus styles, Escape dismissal, and live response announcements. These do not constitute full assistive-technology certification.

## Visual assessment

The reviewed desktop opening, all seven desktop project scenes, desktop town, and reduced-motion fallback are valid viewport captures. Their warm paper ground, self-hosted condensed display type, handwritten notes, restrained terrain colors, and authored linework follow the code-led direction. The sketch/ASCII and SVG artwork is explicitly requested and is not a style violation. The terrain illustrations remain clear of project text in the final desktop captures; project hierarchy and source actions are readable. The opening has a recognizable portrait/name composition, and the town provides a coherent ending.

Mobile opening, project copy, and contact typography reflow coherently at 390 pixels. The town deliberately scrolls horizontally inside its labeled region and supplies a drag instruction. The refreshed mobile terrain/guide and couple captures now support the intended composition. The fixes preserve the portrait blend, distinct terrains, quiet paper ground, and guide's character.

The detector's reported `border-accent-on-rounded` finding at `.town-held-hands` is a false positive: that border draws joined hands, rather than decorating a card.

## Validation limits

This independent reviewer inspected the supplied screenshot files and relevant application, character-motion, terrain-rendering, town, contact, CSS, content, and test sources. The follow-up inspected the changed timing and color code, recalculated the three contrast ratios, and reopened the five mobile captures listed above. No application source was edited and no browser or second detector was run by this reviewer. The builder reports four passing browser flows, eight passing geometry/content tests, clean lint, and a passing production build; those results are reported evidence, not independently rerun here. The tests exercise successful audio playback once, seated-then-jump ordering, navigation/dialogue, all seven WebGL scenes, town replies/couple, mobile overflow, and reduced-motion/WebGL fallback.

The build is code-led with an explicit direction contract; no approved raster comp or quality-board input was supplied. No full-page canvas capture is required because offscreen terrain scenes intentionally unmount. Browser coverage is local Chromium; other engines, real mobile audio policy, screen-reader behavior, and live project applications remain unverified. The follow-up is a bounded resolution pass over the initial findings, not an expansion of browser or accessibility certification.
