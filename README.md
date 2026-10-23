
# Abhishek's portfolio adventure

A React portfolio presented as a continuous illustrated expedition: an approved portrait and giant name, a backpack guide, seven project habitats, contact, and a small interactive town. Terrain art combines Three.js contour drawings with ASCII scenery. Sound is opt-in; reduced motion and non-WebGL alternatives preserve the content.

Temporary preview: [mrduhlol.github.io/abhishek-a2](https://mrduhlol.github.io/abhishek-a2/). Custom-domain Cloudflare hosting is not yet connected.

## Run locally

Use Node.js 22.12+ (the deployment workflow uses Node 22) and npm. Install the locked dependencies and start Vite:

```sh
npm ci
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. For a production build and local preview:

```sh
npm run build
npm run preview
```

The build writes `dist/`. The default asset base is `/`, suitable for a custom-domain root. For the GitHub Pages subpath preview, build with:

```sh
SITE_BASE=/abhishek-a2/ npm run build
```

The temporary workflow in `.github/workflows/` builds with that base and publishes Pages on pushes to `main`. Remove or replace it when the intended hosting is connected.

## Check changes

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:browser
```

The Playwright config starts a Vite server on `127.0.0.1:5174`. It uses `CHROMIUM_PATH` when set, otherwise `/usr/bin/chromium` if present, then Playwright's installed Chromium. To use another local executable:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The eight Node tests validate project destinations and all seven terrain geometry/disposal contracts. Four Chromium workflows cover opening and guide dialogue, map navigation, actual once-per-session audio and jump sequencing, all seven WebGL terrains, town conversations and the couple, a narrow mobile viewport, and reduced-motion/WebGL fallback. Chromium desktop and emulated mobile checks do not certify every browser or physical device.

Browser runs save screenshots under `.impeccable/review/` and failures under `test-results/`; these local artifacts are ignored by Git. The tests exercise opt-in audio playback, so a browser with usable media decoding is required. Existing design review artifacts are separate from the automated tests.

## Architecture and content

- `src/App.jsx`: semantic page structure, fixed header, map and chapter tracking, portrait opening, project stops, lazy terrain mounting, sound state, contact and town composition.
- `src/data/projects.js`: the seven project records, journey order, terrain, factual descriptions, technical stacks, source links, and pending live URLs.
- `src/world/AdventureHero.jsx`, `Character.jsx`, `hero.css`: shared audio priming and playback, once-per-session first-scroll introduction, scroll-relative guide placement, poses, rope, dialog, and town arrival. Sound starts off; the clip runs after opt-in at the first qualifying scroll. The bubble also appears on the silent path. Reduced motion removes the animated jump and poses.
- `src/world/TerrainScene.jsx`: orthographic Three.js rendering, pointer/scroll depth response, resizing, visibility handling, context fallback, and resource cleanup. Scenes mount near the viewport and render on demand; they do not keep an idle animation loop running.
- `src/world/terrain.js`, `terrains/*.js`: seeded drawing helpers, batched contour geometry, seven specific drawings, disposal, and ASCII fallback data. The eager terrain registry is bundled into the lazily imported terrain chunk.
- `src/world/AsciiScenery.jsx`, `ascii.css`, `terrain.css`: decorative ASCII objects and terrain presentation. Essential project text stays in HTML outside the canvas.
- `src/world/Town.jsx`, `town.css`: SVG village, resident conversations, live announcements, offscreen animation pause, local horizontal exploration on phones, and the hand-holding/stare ending.
- `src/world/Contact.jsx`, `Footer.jsx`, `Icon.jsx`: contact and social links, clipboard success/failure feedback, footer, and inline icons.
- `src/index.css`, `fonts.css`: shared paper/ink/olive tokens, layout, responsive behavior, focus treatment, reduced-motion rules, and locally served fonts.

Journey order: Orbit → mountain; Voxlink → forest; github-widgets → grassland; Inkora → desert; DocuType → ocean; Stikr → cave; Black Jack → volcano.

## Maintenance

Every project currently has `live: null`. Until Abhishek supplies the project subdomains, the site intentionally links to source repositories with “Explore the source.” Set a confirmed HTTPS `live` URL to add “Explore project”; do not infer a destination from a repository name or README. Keep description changes grounded in the evidence and caveats in [`docs/project-sources.md`](docs/project-sources.md).

Keep project order synchronized with the terrain captions and background words in `App.jsx`; terrain-specific guide lines and poses live in `AdventureHero.jsx`. New terrain identifiers need matching drawing, ASCII scenery/fallback, data, and verification. Preserve cleanup when changing renderers, listeners, timers, or observers.

The first-scroll introduction uses session storage key `abhishek-adventure-intro`; open a fresh tab/session or clear that key to replay it during development. Enabling sound silently primes the shared audio element; the spoken line waits for scroll. Browsers that refuse playback show a recoverable sound notice.

Portrait assets live in `public/`; retain `abhishek-cutout.webp.json` and `docs/portrait-prompt.txt` when maintaining the approved cutout. Fonts and their OFL licenses are in `public/fonts/`. The supplied line is in `public/audio/`. All asset URLs must continue to honor Vite's configured base for subpath previews.

[`PRODUCT.md`](PRODUCT.md) records product truth and pending decisions. [`DESIGN.md`](DESIGN.md) captures the implemented visual tokens and rules; `.impeccable/design.json` extends it with motion, elevation, breakpoints, and renderable component snippets. The approved surface contract is `.impeccable/surfaces/adventure.md`.
