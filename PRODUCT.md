# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who visit Abhishek's personal portfolio to see what he has been making.

## Product Purpose

Showcase Abhishek's projects and the enthusiasm he brings to building them. Success means visitors can explore his work and get a sense of his passion.

## Capabilities and Constraints

The portfolio is a React and Vite website with a continuous sketch/ASCII adventure and layered Three.js terrain illustrations. The opening pairs the approved cutout portrait and chest fade with an oversized name and a seated backpack guide. The guide follows the scroll through seven projects, followed by contact information and a populated town with interactive residents and a hand-holding couple ending.

Each project has a distinct terrain and a short, repository-grounded introduction. Project subdomain destinations are still awaiting the user: every `live` value in `src/data/projects.js` is `null`, so the current action is “Explore the source.” A confirmed live destination enables a separate “Explore project” action without replacing the source link.

Audio is off by default. After explicit sound opt-in, the supplied first-scroll line plays once per session before the guide jumps; the speech bubble and silent timing also work without audio. Reduced motion uses static placements, and unavailable WebGL falls back to ASCII scenery. Project descriptions and navigation remain ordinary accessible HTML.

## Project Sources

These repository URLs were supplied by the user. They are source-code links, not the project subdomain destinations. Their READMEs and repository metadata were reviewed on 2026-10-23 to ground the implemented descriptions; scope and caveats are recorded in `docs/project-sources.md`.

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

The complete adventure is implemented in `src/`. The journey order is Orbit / mountain, Voxlink / forest, github-widgets / grassland, Inkora / desert, DocuType / ocean, Stikr / cave, and Black Jack / volcano. Project copy and source links live in `src/data/projects.js`; evidence lives in `docs/project-sources.md`.

The approved portrait is served as `public/abhishek-cutout.webp`, with provenance in its adjacent JSON and `docs/portrait-prompt.txt`. The supplied approximately 2.76-second line is `public/audio/here-we-go-again.mp3`; the shared audio player, session guard, speech bubble, jump sequencing, and terrain poses are implemented in `src/world/AdventureHero.jsx`.

Contact uses `abhishek.a2534@gmail.com`, GitHub `https://github.com/mrduhlol`, and LinkedIn `https://www.linkedin.com/in/duhlol`. The temporary preview deploys to GitHub Pages; a custom-domain Cloudflare deployment is not yet connected. `README.md` records setup, validation, architecture, and maintenance; `DESIGN.md` records the implemented visual system.

## Product Principles

- Put Abhishek's actual work at the center.
- Let visitors explore the projects and understand the care behind them.
- Use only confirmed descriptions, links, and evidence.

## Open Decisions

- Supply and confirm the dedicated project subdomain URLs before setting any `live` destination.
- Expand the personal introduction or refine project details only from user-provided material or recorded source evidence.
- Connect the intended custom-domain hosting when ready; the current GitHub Pages workflow is a temporary preview.
