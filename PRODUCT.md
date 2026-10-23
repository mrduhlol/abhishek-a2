# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who visit Abhishek's personal portfolio to see what he has been making.

## Product Purpose

Showcase Abhishek's projects and the enthusiasm he brings to building them. Success means visitors can explore his work and get a sense of his passion.

## Capabilities and Constraints

The portfolio is a React/Vite website with a full-viewport dimensional 2.5D map adventure. The user explicitly authorized this replacement after rejecting the sketch/ASCII world and flat character. The approved portrait and oversized name remain the opening. A skinned backpack adventurer travels along a winding horizontal route with elevation changes, through seven project habitats with shaded 3D objects and discoverable artifacts. Characters and scenery use faceted low-poly art, believable body proportions, skeletal animation, lighting, and shadows; they are not photorealistic.

Wheel movement, touch drags, arrow keys, previous/next controls, and a treasure map control requested route progress. Place identity, contextual discovery, map location, cave proximity, and the progress bar follow the rendered guide’s actual position. A dark local backing keeps identity/helper text legible over bright terrain. Hover raises project plaques and reverses on pointer leave; click/tap or the HTML discovery action opens details. Descriptions, stacks, source links, contact, map controls, and resident conversations remain HTML. Every project's `live` value in `src/data/projects.js` is still `null`, so details offer “Explore the source.” A confirmed live URL enables a separate “Explore project” action.

Audio starts off and requires explicit opt-in. Terrain ambient beds follow the rendered guide's actual chapter; surface steps follow actual movement. Button and wheel/touch/arrow entry trigger the supplied introductory caption, with audio only when sound is already enabled; direct map-first travel currently bypasses it. Its guard lasts for the mounted app. Recorded NPC reactions, discovery, and cave cues also respect consent. Audio sources and credits are recorded and exposed through the contact panel.

The final cave beyond the volcano enters a separate town only on activation; Stikr's cave is an earlier project habitat. Town includes dimensional buildings, children/adults/elders, workers and walking residents, captioned reactions, keyboard conversation controls, and a handholding companion arrival with hearts, preserving palm contact while the pair turn toward the visitor. A return cave/HUD action restores saved trail progress. Reduced motion uses immediate placement and stable framing with frozen ambient animation. Unavailable WebGL preserves a project list, details, map, and contact; navigation then uses requested progress because the scene cannot report a position.

The runtime prepares all habitats/town, hides inactive world roots, culls scene objects, and updates nearby trail habitats. It adapts rendering quality to sustained slow frames, pauses hidden/offscreen work, and disposes scene/media resources. Reduced-motion captures establish composition only, not normal-motion performance.

## Project Sources

These repositories were supplied by the user. They are source-code links, not confirmed live destinations. Their READMEs and metadata were reviewed on 2026-10-23; scope and caveats are recorded in `docs/project-sources.md`.

| Project | Source repository |
| --- | --- |
| github-widgets | https://github.com/mrduhlol/github-widget |
| Stikr | https://github.com/mrduhlol/stikr |
| Inkora | https://github.com/mrduhlol/Inkora |
| DocuType | https://github.com/mrduhlol/DocuType |
| Voxlink | https://github.com/mrduhlol/Voxlink |
| Orbit | https://github.com/mrduhlol/Orbit |
| Black Jack | https://github.com/mrduhlol/black-jack |

## Evidence on Hand

The runtime is in `src/expedition/`, mounted directly from `src/main.jsx`; old `src/world/` and `src/App.jsx` have been removed. Project data is in `src/data/projects.js`. Journey order: Orbit / mountain, Voxlink / forest, github-widgets / grassland, Inkora / desert, DocuType / ocean, Stikr / cave, Black Jack / volcano, then the final town portal. The replacement brief is `.impeccable/surfaces/expedition.md`.

The portrait is `public/abhishek-cutout.webp`, with adjacent provenance and `docs/portrait-prompt.txt`. The supplied approximately 2.76-second line remains `public/audio/here-we-go-again.mp3`. The Quaternius CC0 Adventurer rig, license, checksum, and inspection records are under `public/expedition/character/`, documented in `docs/expedition-character-assets.md`. Six original project marks and a manifest live under `public/expedition/logos/`; `docs/expedition-logos.md` records their sources and Orbit's absent logo. Audio recordings, provenance, and public credits are under `public/expedition/audio/`, documented in `docs/expedition-audio-assets.md`. Contact links the public sound attribution and credits Quaternius.

Contact uses `abhishek.a2534@gmail.com`, GitHub `https://github.com/mrduhlol`, and LinkedIn `https://www.linkedin.com/in/duhlol`. The preview is `https://mrduhlol.github.io/abhishek-a2/`; custom-domain Cloudflare deployment is not connected. `README.md` records setup, controls, actual validation scope, architecture, and maintenance. `DESIGN.md` and `.impeccable/design.json` capture the replacement's shared visual system.

Frozen runtime `24ee8ac`, tested with `20862fd`, passes all nine Node geometry/content checks and six expanded Chromium flows (about 5.5 minutes for the browser run); lint and production build also pass, with Vite’s large-chunk advisory remaining. The run includes actual-position UI/map traces, normal desktop/mobile town arrival, measured palm contact through the look response, and real town/shout media playback. Independent review round two returned **ship** in `7f4fe92`, resolving all three earlier findings. [`docs/ui-review.md`](docs/ui-review.md) records inspection of source, all 20 fresh images/context records, and saved audio/journey telemetry; the reviewer did not rerun browser/tests/detector.

The review remains bounded: static tour/hover evidence uses reduced motion; normal town/mobile captures use low/DPR 0.6 and remain soft. Worker animation is generic, phone town framing emphasizes the pair rather than the wider population, and facial animation is absent; the captures do not establish finger articulation. Only Inkora’s individual hover reversal is visually demonstrated; detail/contact stills, all physical artifact interactions, real devices/mobile Safari, continuous-motion evidence, comprehensive accessibility/performance audits, and subjective audio assessment remain outside this review. README records the full scope and limits.

## Product Principles

- Put Abhishek's actual work at the center.
- Let visitors explore the projects and understand the care behind them.
- Use only confirmed descriptions, links, and asset evidence.
- Preserve usable navigation and factual content without sound, continuous motion, or WebGL.

## Open Decisions

- Supply and confirm dedicated project URLs before setting any `live` destination.
- Expand personal/project copy only from user-provided material or recorded source evidence.
- Connect intended custom-domain hosting; GitHub Pages remains the temporary preview.
