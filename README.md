# Abhishek's dimensional expedition

A React portfolio inside a dimensional 2.5D map adventure. The approved portrait opens over a shaded landscape; a rigged backpack adventurer follows a winding horizontal trail through seven project habitats. Hover raises project artifacts, click/tap or the discovery control opens details, and an explicitly activated final cave leads to a separate populated town. Scenery and characters are faceted low-poly 3D with lighting and shadows. Sound is opt-in; reduced motion and a WebGL failure view keep project information accessible.

Temporary preview: [mrduhlol.github.io/abhishek-a2](https://mrduhlol.github.io/abhishek-a2/). Custom-domain Cloudflare hosting is not yet connected.

## Run locally

Use Node.js 22.12+ and npm; the deployment workflow uses Node 22.

```sh
npm ci
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. Build and preview production output with:

```sh
npm run build
npm run preview
```

Output is `dist/`. The default asset base is `/`. For the existing GitHub Pages subpath preview:

```sh
SITE_BASE=/abhishek-a2/ npm run build
```

`.github/workflows/deploy.yml` builds with that base and publishes Pages on pushes to `main`. Keep asset URLs base-aware; replace the temporary workflow when intended hosting is connected.

## Controls

Choose “Enter with sound” or “Explore quietly,” or begin traveling with the wheel, touch drag, or arrow keys. Desktop wheel movement advances/reverses route progress instead of scrolling a vertical document. Previous/next terrain buttons and the treasure map offer direct travel; destination changes over 52 world units snap the guide rather than walking the whole leg. Project artifacts react to hover and open on click/tap; “Discover” opens the same details through an HTML button.

Sound starts off. Explicit opt-in enables a terrain ambient bed, surface footsteps, and recorded interaction cues. Ambient transitions follow the rendered guide's actual chapter. Footsteps follow measured guide travel rather than input alone. Button and wheel/touch/arrow entry trigger the introductory caption, with the supplied line audible only when sound is already enabled. Direct map-first travel currently bypasses that introduction. Its guard lasts for the mounted app; reload to replay. There is no session-storage replay key.

The final cave is beyond Black Jack's volcano, separate from Stikr's cave habitat. Reaching it does not enter town: click the portal or use “Enter the cave.” The crossing swaps worlds at 300ms and ends at 850ms. Town has working/walking residents, captioned conversations, a keyboard-accessible “People nearby” menu, and a handholding companion arrival that preserves contact through the click-to-look response. Use the return cave or HUD action to restore saved trail progress. Map travel can also return to a project on the trail.

## Check changes

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:browser
```

Playwright starts Vite at `127.0.0.1:5174`. It selects `CHROMIUM_PATH`, then `/usr/bin/chromium` when present, then Playwright's installed Chromium. The configuration uses SwiftShader. To select another executable:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

The suite contains **nine Node checks**: project content/destinations; route clamping, continuity, chapter targets, and ground alignment; and seven actual biome construction checks. Biome checks inspect finite geometry/transforms, run update calls and a sparse raycast smoke check of the walking corridor, then invoke cleanup. They do not establish complete collision coverage or visual quality.

The **six Chromium flows** cover real opt-in audio, intro guarding, and UI/map alignment during normal adjacent travel and reversal; all seven map destinations and source/detail content with reduced-motion composition captures; deliberate cave entry, pointer/keyboard conversations, actual town/shout audio playback, physical hand contact through the couple’s look response, and return progress; a 390×844 touch viewport with map/contact/town and the same couple checks; reduced-motion keyboard travel; and unavailable WebGL with project/map/contact access. Captures are written under `.impeccable/review/`; failure artifacts use `test-results/`. Both are ignored by Git. Desktop Chromium and emulated touch coverage do not certify every browser or physical device.

Validation on frozen runtime `24ee8ac`, with test definitions committed as `20862fd`: **nine Node checks and all six Chromium flows passed**; the full browser run took about 5.5 minutes. Parent-confirmed lint and production build passed; Vite retains its large-chunk advisory. The expanded run verifies actual-position UI/map semantics during normal travel/reversal and final-cave approach, normal desktop/mobile town arrival, measured hand contact before/during/after the look response, actual town ambience/worker-shout playback, return travel, reduced motion, and WebGL fallback. The independent second review returned **ship** in `7f4fe92`, resolving all three first-round findings; see [`docs/ui-review.md`](docs/ui-review.md). That reviewer inspected source, all 20 refreshed PNGs and their context JSON, two audio telemetry files, and two journey traces; they did not rerun tests, a browser, or the detector.

The local `.impeccable/review/` evidence includes the 20 captures with same-basename JSON, `expedition-actual-audio-play-recording.json`, `expedition-town-audio-play-recording.json`, `expedition-adjacent-travel-reversal.json`, and `expedition-final-cave-approach.json`. The adjacent/reversal trace has 31 semantic observations, 25 including map state; the cave-approach trace has 13. Position updates are normally sampled about every 250ms, plus intent/world changes. These observations establish chapter/proximity behavior, not frame-perfect state or exact arrival at every artifact center.

Preserved review limits:

- The seven terrain, map, and Inkora hover captures use reduced motion for composition. Opening/town/mobile/couple images use normal motion but are stills. Captured normal town/mobile quality is low/DPR 0.6, openings balanced/DPR 0.8, and the static tour high/DPR 1. These are not sustained full-resolution or real-device performance results.
- The tour primarily exercises HTML discovery; only Inkora's physical hover/reset triplet is individually demonstrated. Couple activation in the look-response check uses the HTML guide action. Fresh visual detail/contact captures, all seven physical artifact clicks/reversals, physical phones, mobile Safari, and comprehensive accessibility/performance audits are outside this review.
- Workers share a generic upper-body interaction animation; distinct working gestures and held tools are not established. Phone arrival framing emphasizes the facade and pair; “People nearby” reaches offscreen residents without reframing the camera. Facial animation is absent; the supplied captures do not establish finger articulation. The forest chime overlap and coast framing remain nonblocking composition limitations.
- Audio JSON records fulfilled playback promises, unmuted volume and media-time advancement, not speaker/microphone recordings. The reviewer did not audition output; remaining terrain mixes, loop seams, greetings, and subjective balance are unassessed.

## Architecture and content

- `src/main.jsx` mounts `src/expedition/ExpeditionApp.jsx` directly. The former `src/App.jsx` and `src/world/` runtime have been removed.
- `ExpeditionApp.jsx` owns opening/trail/town state, requested route progress and actual rendered progress, wheel/touch/keyboard input, HUD, project/contact dialogs, cave timing, sound consent, and HTML failure access. Place headings, discovery, map position, cave proximity, and the progress bar follow actual progress from the scene callback; input/map destinations retain separate route intent. If WebGL fails, displayed progress falls back to requested progress because no rendered-position callback can arrive.
- `ExpeditionScene.jsx` owns one perspective Three.js renderer, lighting/fog, continuous trail and boardwalk, physical project landmarks/logos, raycasting, camera follow, actor travel, town arrival, and projected interaction diagnostics. Its `onPosition` callback reports actual guide position/chapter for audio.
- `route.js` is the shared authority for route X/Y/Z, ground height, chapter selection, and map project progress. `kit.js` supplies seeded geometry/material helpers and traversal-based disposal.
- `biomes/*.js` contains seven independent dimensional terrain factories. Each receives `{ THREE, kit, index }`, returns its group and optional `update(time, dt)`/`dispose()`, and uses local coordinates; the scene positions it at `index * 48`. Keep a clear corridor around `kit.pathZ(x)` and place objects using `kit.height(x, z)`.
- `avatar.js` loads the skinned Quaternius GLB, clones rigs/materials/geometry per actor, adapts age/clothing, samples posed sole height, and scales walking cadence to actual travel speed. A bounded two-bone arm solve applies the couple’s shared palm target after animation and root rotation, preserving limb lengths. `town.js` builds architecture/props and supplies resident descriptors/routes. The scene integrates residents and the companion ending.
- `TreasureMap.jsx` and `treasure-map.css` implement the native modal parchment chart, route spline, current marker, seven destinations, final cave, focus handling, and local horizontal viewport.
- `soundscape.js` owns eight ambient beds, a 1.4-second crossfade, surface-specific steps, supplied intro, and NPC/portal/discovery cues. It pauses media while hidden and releases players on disposal.
- `expedition.css` owns the full-viewport interface, portrait mask, responsive overlays, focus, and reduced-motion rules; `src/fonts.css` defines local fonts.
- `src/data/projects.js` owns factual copy, technical stacks, project order, source links, and pending `live` URLs. Its `accent` fields are project metadata, not the complete new scene palette.

Journey order: Orbit → mountain; Voxlink → forest; github-widgets → grassland; Inkora → desert; DocuType → ocean; Stikr → cave; Black Jack → volcano; final cave → town.

All biome modules and town are prepared on scene startup. On the trail, only the current biome and neighbours are visible and receive environmental updates; inactive world roots are hidden. Town actor roots are culled with conservative bounds; ordinary meshes use Three.js frustum culling, while skinned limbs and changing particle bounds intentionally bypass per-mesh culling. Rendering pauses while hidden/offscreen. Normal mode runs a continuous animation loop. Reduced motion freezes ambient motion, snaps placement/camera, and skips GPU rendering when unchanged. These are culling/update controls, not unload-on-travel behavior.

Scene diagnostics distinguish completed arrival (`data-town-arrived`) from physical hand contact (`data-hand-holding`, measured palm gap below 0.01 world units) and the actual look response (`data-staring`, both facing within 0.12 radians of the camera). Keep these separate when changing tests; a completed walk does not prove hand contact.

Renderer quality falls after sustained slow rendered frames: high caps DPR at 1.25 with a 1024px shadow map; balanced uses 0.8/512px; low uses 0.6/512px. Simulation delta is capped at 0.25 seconds, with avatar substeps no larger than 0.1 seconds to preserve gait synchronization on slow frames. This adaptive policy is not a measured frame-rate guarantee. Keep listener/observer/timer/RAF cancellation and geometry/material/texture/skeleton cleanup when extending the scene.

## Maintenance

Every project currently has `live: null`. Until Abhishek supplies confirmed URLs, details offer “Explore the source.” Add a confirmed HTTPS `live` URL to enable the separate “Explore project” action. Keep factual edits grounded in [`docs/project-sources.md`](docs/project-sources.md); do not infer live destinations from repository names.

Keep project order aligned across `src/data/projects.js`, the scene habitat registry, and the map's habitat/waypoint arrays. Map targets use `projectProgress()` from `route.js`. Route changes must preserve terrain sampling, visible trail, boardwalk lift, guide grounding, camera framing, and map progress. Update geometry/content checks and relevant browser flows when those contracts change.

Six verified marks ship in `public/expedition/logos/`, mapped by `manifest.json`. Orbit has no verified mark and uses its name on a physical landmark. Three viewBox-only SVGs have explicit 256×256 dimensions for WebGL texture loading; preserve their viewBox/artwork and the preparation record. Keep source colors, provenance, and notices in [`docs/expedition-logos.md`](docs/expedition-logos.md).

The portrait remains `public/abhishek-cutout.webp`; preserve its adjacent JSON and [`docs/portrait-prompt.txt`](docs/portrait-prompt.txt). [`docs/asset-provenance.md`](docs/asset-provenance.md) records the original portrait/font/supplied-line acquisition; its old character-art description predates this replacement. Current rig source/license/checksum and inspection evidence are in [`docs/expedition-character-assets.md`](docs/expedition-character-assets.md) and `public/expedition/character/`. The character is CC0 low-poly art with skeletal animation and no facial morph animation.

Audio sources, transforms, hashes, and per-file licenses are in [`docs/expedition-audio-assets.md`](docs/expedition-audio-assets.md) and `public/expedition/audio/provenance.json`. Keep [`public/expedition/audio/ATTRIBUTION.txt`](public/expedition/audio/ATTRIBUTION.txt) in distributions and reachable through the contact panel's “Sound credits & licenses” link. The bundle mixes CC0 and CC BY recordings; the pre-existing supplied intro is separate and must not be relabeled as part of those licenses. Local fonts and OFL files remain in `public/fonts/`.

[`PRODUCT.md`](PRODUCT.md) records product truth and pending decisions. [`DESIGN.md`](DESIGN.md) and its schema-v2 [sidecar](.impeccable/design.json) capture shared tokens, six representative components, and visual rules. The authorized replacement contract is [`.impeccable/surfaces/expedition.md`](.impeccable/surfaces/expedition.md). [`docs/expedition-contract.md`](docs/expedition-contract.md) records terrain factory ownership. [`docs/expedition-architecture.md`](docs/expedition-architecture.md) is an earlier proposal; its suggested history/deep-link and loading behavior must not be treated as shipped functionality.
