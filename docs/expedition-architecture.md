# Expedition architecture — implementation handoff

Status: proposed replacement, 2026-10-23. Scope: this document only; parent owns core implementation. Use the existing `docs/expedition-contract.md` factory contract below so independently authored biomes plug into one world. This document adds route, interaction, and lifecycle requirements; it does not introduce a second terrain API.

## Interface first: terrain ownership

Each delegate owns exactly `src/expedition/biomes/<name>.js`. Its only runtime dependency is Three.js, supplied as `THREE`; `kit` is a parent-provided object, not another package. No React, renderer, camera, light, loader, DOM, audio, scroll listener, animation loop, shared-file changes, or imports from sibling modules.

```js
export default function buildBiome({ THREE, kit, index }) {
  kit.ground('#61764b');
  // Build dimensional, lit objects using THREE and kit.
  return {
    group: kit.group,
    update(time, dt) { /* optional; seconds; mutate existing objects */ },
    dispose() { /* optional; release only non-scene extras */ },
  };
}
```

The parent creates `kit.group` at identity; the returned group must be that exact object. Parent sets `group.position.x = index * 48`; delegates must not apply that translation themselves. Local bounds: X `[-24,24]`, Z `[-20,20]`; Y is elevation, with one unit approximately one metre. Positive X is forward/right, positive Y up, positive Z toward the viewing side. Ground geometry may touch boundaries; decorative geometry must stay inside them. Parent blends habitat seams centrally.

Required `kit` methods, matching the implementation contract:

```js
kit.group                         // THREE.Group, supplied by parent
kit.height(x, z)                   // local x/z -> world elevation y
kit.pathZ(x)                       // local x -> trail centre z
kit.random()                       // deterministic, per-biome seed
kit.material(color, options = {})  // MeshStandardMaterial
kit.ground(color, options = {})    // added mesh; roughness, segments=64
kit.mesh(geometry, materialOrColor,
  position = [0,0,0], scale = [1,1,1], rotation = [0,0,0])
kit.box(color, position, scale, rotation)
kit.rock(color, position, scale, seed)
```

`mesh`, `box`, and `rock` return an already-added mesh with cast/receive shadows enabled; do not add it twice. Rotation values are Euler XYZ radians. `height` takes local coordinates and returns elevation relative to the common world Y origin; `group.position.y` stays zero. `ground` samples this same height function. Keep `abs(z - kit.pathZ(x)) < 1.6` free of props, with at least 3 units of vertical clearance above the route. The parent supplies the visible trail, character, project logo objects, and portals. Reserve clear sightlines to them.

Use shaded solid ground, rock volumes, trunks, foliage, buildings, and props. MeshStandardMaterial, a parent sun/sky rig, and visible contact shadows establish real depth. Flat SVG scenery, ASCII, and stacked line drawings are not substitutes for this replacement. Use InstancedMesh for repeated details. Per-biome ceiling: fewer than 45,000 triangles and 150 mesh objects; parent measures actual draw calls and may request reductions. Low quality reduces detail without changing route geometry or landmarks. No module-global mutable state; factories must tolerate repeated construction.

## Route contract: one source for ground, guide, camera, and map

Parent owns `src/expedition/route.js`, the biome registry, and all route sampling. Route X spans `[-24,312]` through the seven modules; a parent-owned approach continues beyond X=312 to the final cave, nominally X=324. Each module receives wrappers over the same global functions:

```js
kit.pathZ = localX => routeZ(index * 48 + localX);
kit.height = (localX, z) => groundY(index * 48 + localX, z);

// Parent API; s is cumulative route distance, in world units.
sampleRoute(s) => ({
  position,   // THREE.Vector3: feet on the traversal surface
  tangent,    // normalized derivative toward increasing s
  biomeIndex, // 0..6, clamped on the final approach
});
seekRoute(s, { immediate: false });
```

Author one ordered set of global X/Y/Z knots. X must strictly increase; winding comes from deliberate Z excursions and Y climbs/descents. Interpolate Y and Z as continuous functions of X, with matching first derivatives at biome boundaries. Derive terrain elevation around that centreline so `groundY(x, routeZ(x))` equals route Y. Use an arc-length lookup to convert distance `s` into X; never treat spline parameter or local X as constant-speed distance. Clamp endpoints and avoid independently fitted per-biome splines. At every seam, both neighbouring kits must return the same height and path Z.

Parent draws the trail from the same samples, with only a small render offset to avoid z-fighting. The character's feet use the traversal surface; a bridge or boardwalk adds its explicitly recorded deck offset to both character and trail samples. The ocean route crosses shore/islets on a boardwalk, never walks underwater. Route motion is reversible and deterministic: scrolling backwards retraces the same samples. Walking phase comes from distance travelled; idle motion uses time. Orient the guide along the tangent, with bounded body pitch and stable upright orientation.

Native vertical scroll maps to clamped progress `p` over a dedicated expedition scroll range, then `s = p * routeLength`. Resize preserves `p`. Map navigation and direct links update that same scroll position; do not create competing progress stores. Wheel/touch scroll remains native; dialogs temporarily suspend journey input and restore it on close.

Use one perspective camera for the 2.5D composition, starting near a 35-degree field of view with a fixed viewing-side offset. Its target follows the route with modest forward lookahead; camera X increases as the guide moves right in world space, making the scenery pass mainly leftward. Keep the guide around the left third with the next destination visible. Smooth and damp Y/Z camera movement more strongly than X, and avoid camera roll or terrain-specific camera resets. In reduced motion, use immediate chapter placements with static framing and no continuous tracking. On narrow screens adjust distance/framing, not world geometry or route coordinates.

## Seven independently authored habitats

Registry order and project IDs must match `src/data/projects.js`:

1. `mountain`, index 0, `orbit`: faceted alpine mass, snow shelves, rising switchback in Z and Y, rope-bridge crossing.
2. `forest`, index 1, `voxlink`: substantial trunks, layered canopy, suspended bridges and a clearing for the logo.
3. `grassland`, index 2, `github-widgets`: rolling contribution-like planted plots, wind-driven grass, a low hill traverse.
4. `desert`, index 3, `inkora`: dune volumes, sandstone and an oasis; a curved dune-ridge trail with visible crest/descent.
5. `ocean`, index 4, `docutype`: dimensional shore/islets, shaded moving water, connected boardwalk with a readable horizon.
6. `cave`, index 5, `stikr`: cutaway cavern, crystals, stalactites and elevated ledges; keep roof/foreground clear of the guide and logo.
7. `volcano`, index 6, `black-jack`: basalt, crater, emissive lava channels and a safe ridge route. The exit cave belongs to the parent beyond this biome.

Habitat proposals are art direction, not licence to change project facts. All modules get their final route through `kit` and must fit it; route-shape requests go to the parent rather than being independently hardcoded. Keep the Stikr cavern distinct from the expedition-to-town portal.

## Landmarks, HUD, and detail navigation

Parent owns a landmark registry keyed by existing project ID: `{ projectId, biomeIndex, s, anchor, hitObject }`. `s` selects the map destination; `anchor` is a world-space logo position after parent placement; `hitObject` is the raycast target. Parent creates the project emblem as a physical sign, carved object, or inset plaque inside its habitat, using verified logo assets when available. An authored temporary symbol must not be presented as a verified project logo.

Hover or keyboard focus reveals the project name and a short prompt next to its projected anchor. Click/Enter opens an accessible HTML detail dialog populated from `PROJECTS`; touch opens it on a single tap. Closing with Escape, close button, or browser Back restores focus and route position. The dialog contains existing description, technologies, source link, and a live action only when `live` is non-null. Hide projected overlays behind the camera or occluded by scenery; provide equivalent controls in the map so every project stays reachable.

The fixed HUD has a treasure-map toggle, sound toggle, current stop, and contact access. The map is a winding miniature route with seven named stops, a guide marker, and the final cave; its semantic HTML buttons use the same `seekRoute` API. A “Read projects” option presents the factual content without entering the animated journey. Use at least 44px touch targets, visible focus, and readable labels; essential navigation must not require raycasting or hover.

For static hosting, use hash routes: `#expedition`, `#project/<id>`, and `#town`. Detail/history entries store `{ world, s, returnFocusId }`; passive scrolling does not create history entries. Legacy `#project-<id>` links resolve to the corresponding new landmark and `#projects` selects the expedition start. Keep `#top` and `#contact` working. A direct project link initializes its stop before opening the dialog. Unknown IDs return to the expedition. A cold `#town` load supplies the expedition return position at the final cave.

## Separate Abhishek town world

State machine: `expedition -> entering-town -> town -> leaving-town -> expedition`. Only activating the final clickable cave begins entry; merely reaching it by scrolling does not. Save expedition distance, camera framing, and focus. Disable duplicate transition activation; use a brief fade or immediate cut under reduced motion. Reuse the renderer while swapping scene roots, with separate town route/camera state. Return cave activation restores the saved expedition position and focuses its entrance control; browser Back follows the same transition handling. A failed town load leaves the expedition usable.

Town is a second dimensional world, with small homes, medium shops/workshops, and a taller civic landmark at visibly different scales. Include children, adults, and older residents with distinct silhouettes and appropriate activities: playing, carrying supplies, repairing, gardening, selling, and resting. Distribute work areas, plazas, and paths; avoid identical buildings and synchronized NPC animation. The return cave is visible on arrival and also available through the HUD.

Parent owns NPC records `{ id, ageGroup, activity, position, greetingText, voiceAsset }`, animation, proximity checks, and interaction. Greetings and vendor calls have caption equivalents. Sound defaults off; a deliberate Sound action unlocks audio. Parent mixes approved/local voice assets, limits simultaneous speech to one voice, attenuates by distance, and applies per-NPC cooldowns. Interaction greetings take priority over ambient calls. Missing/blocked audio still shows text; no external speech service or additional dependency is required. Leaving town, muting, hiding the tab, or disposing the scene stops speech and ambient loops.

## Integration and acceptance

The current app is React/Vite with `three` already installed. `TerrainScene.jsx` creates separate orthographic contour canvases; `AdventureHero.jsx` drives a DOM/SVG character and `Town.jsx` implements the current town. Replace those runtime responsibilities with one parent-owned expedition renderer; preserve factual `PROJECTS`, confirmed contact links, and existing approved assets as applicable. Parent owns changes to App, styles, core modules, design records, dependency files, and tests. This document changes none of them.

One parent RAF loop updates active biomes and the guide with `time` in seconds and `dt` clamped to 0.05 seconds after pauses. Stop work while hidden; skip ambient updates for reduced motion. Keep the current biome and its neighbours mounted, preload the next needed module, and release others. Cap DPR (initially 1.5), bound shadow resolution, and measure desktop/mobile frame cost before adding more detail. Parent deduplicates geometry/material/texture disposal by identity; shared resources require ownership/refcounts. Module `dispose` must not dispose group geometry/materials a second time. Factory failures and WebGL loss must leave the HTML project view available.

Before integration, each delegate checks syntax, deterministic construction, group identity, bounds, a clear walking corridor, budgets, and repeated create/dispose behavior. Parent checks adjacent seam positions and tangents; forward/reverse route travel; feet/trail alignment through Y/Z changes; predominantly leftward scene travel; all seven logo hover/focus/click flows; map and direct links; dialogs; town entry/return/history; sound-off, opt-in, captions, and mute; narrow viewport, reduced motion, and unavailable WebGL. Real meshes must visibly respond to lighting and cast/receive shadows. This is an acceptance checklist for the future implementation, not a claim that it already passes.

Commit only the owned file under `flock .git/adventure-commit.lock`; do not stage another worker's edits. The parent can delegate all seven habitats immediately against the factory/kit contract, while retaining sole ownership of route and integration decisions.
