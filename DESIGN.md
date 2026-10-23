---
name: Abhishek's dimensional expedition
description: A shaded miniature world with a winding trail, a rigged adventurer, and discoverable work.
colors:
  canopy: "#2e493a"
  canopy-hover: "#21392b"
  exp-gold: "#e8c986"
  exp-paper: "#f6f0df"
  exp-ink: "#262e29"
  scene-text: "#f7f1df"
  place-text: "#fff4da"
  place-backing: "#243c32f2"
  panel-text: "#2d3e32"
  speech-paper: "#fff8e4"
  chart-paper: "#e9ddbc"
  chart-ink: "#38382b"
  chart-muted: "#71664e"
typography:
  display:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "clamp(76px, 13.7vw, 230px)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "52px"
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "12px"
  handwritten:
    fontFamily: '"Kalam", cursive'
    fontSize: "19px"
    fontWeight: 400
  mono:
    fontFamily: '"DM Mono", monospace'
    fontSize: "10px"
    fontWeight: 400
rounded:
  square: "0"
  circle: "50%"
  chart: "3px"
spacing:
  compact: "8px"
  small: "18px"
  medium: "20px"
  large: "24px"
  generous: "30px"
components:
  entry-button:
    backgroundColor: "{colors.canopy}"
    textColor: "#fff5dd"
    rounded: "{rounded.square}"
    padding: "18px 23px"
  entry-button-hover:
    backgroundColor: "{colors.canopy-hover}"
  header-navigation:
    backgroundColor: "transparent"
    textColor: "{colors.scene-text}"
    padding: "10px 2px"
  place-label:
    backgroundColor: "{colors.place-backing}"
    textColor: "{colors.place-text}"
    rounded: "3px"
    padding: "17px 23px 16px"
    width: "max-content"
  discovery-action:
    backgroundColor: "#f4ebd5"
    textColor: "#253d31"
    rounded: "{rounded.square}"
    padding: "15px 21px"
  detail-panel:
    backgroundColor: "{colors.exp-paper}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.square}"
    padding: "60px 45px 45px"
    width: "440px"
  map-stop:
    backgroundColor: "#f6ecd1"
    textColor: "{colors.chart-ink}"
    rounded: "{rounded.circle}"
    width: "29px"
    height: "29px"
  conversation:
    backgroundColor: "{colors.speech-paper}"
    textColor: "#2c3e32"
    rounded: "{rounded.square}"
    padding: "18px 24px"
---

# Design System: Abhishek's dimensional expedition

## Overview

**Creative North Star: "A living miniature expedition"**

Sculpted terrain, warm sunlight, shaded objects, and an animated backpack adventurer make the portfolio feel like a small world to walk through. The character has an authored skeleton, modeled clothing and boots, and a gait tied to actual travel. The world uses faceted low-poly geometry and physically shaded materials; photorealism is not its visual claim.

The approved portrait and monumental name remain the opening identity. During exploration, restrained HTML controls leave room for the landscape. Scene identity sits on a dependable dark local backing. Warm paper belongs to details, conversations, and the treasure chart; scenery gets depth from real geometry, light, shadows, atmosphere, and an oblique perspective camera. This replaces the rejected sketch/ASCII world and flat illustrated guide.

**Key Characteristics:**

- Dimensional terrain and objects with natural material color and readable light.
- A skinned adventurer with adult proportions, a visible backpack, and grounded movement.
- Condensed display lettering, calm factual copy, and handwritten human asides.
- Small scene controls, warm paper details, and a spatial treasure chart.
- Equivalent HTML navigation, explicit sound opt-in, and a quiet motion mode.

## Colors

Natural greens and warm paper connect the interface to the landscape. The frontmatter captures shared interface colors; rock, foliage, water, sky, and town material palettes stay in their scene modules.

### Primary

- **Canopy** and **Canopy Hover**: the entry action and its darker hover state.
- **Expedition Gold**: the exploring wordmark accent and text selection. Related warm gold shades identify focus, progress, and invitations over the scene; keep these as component treatments.

### Neutral

- **Expedition Paper**: project/contact details and the unavailable-world project list.
- **Expedition Ink**: the root ink custom property and selection text.
- **Scene Text**: pale navigation and HUD text over the landscape.
- **Place Text** and **Place Backing**: warm pale identity/helper text on a near-opaque dark green backing, retaining contrast across bright and shaded habitats.
- **Panel Text**: dark green factual copy on paper panels.
- **Speech Paper**: introductory notices and resident dialogue.
- **Chart Paper**, **Chart Ink**, and **Chart Muted**: the map's local parchment, labels, and supporting instructions. Fold shading and geographic fills belong to that component.

**The Material Rule.** Shade scenery through materials and lights. Keep local terrain colors in geometry modules instead of expanding the shared interface palette for every prop.

## Typography

**Display Font:** Barlow Condensed, sans-serif fallback. Bold condensed forms anchor the opening name, place names, and panel headings.

**Body Font:** Manrope, sans-serif fallback, for project descriptions, navigation, actions, and technical stack lists.

**Handwritten Font:** Kalam, cursive fallback, for invitations, place captions, and dialogue. **Label/Mono Font:** DM Mono, monospace fallback, for numbered map markers and chart annotations.

All four families are served locally from `public/fonts/` with swap loading. The frontmatter records representative roles, not every responsive heading size. The opening name becomes 24vw on phones; project place names use `clamp(40px, 4.8vw, 68px)` and reduce to 38px on phones (the town heading uses 40px); panel headings reduce to 42px. Place helper copy uses 12px on desktop and 11px on phones. Body copy has generous leading, while labels stay compact. The invitation paragraph is limited to 36ch; scene helper copy to 38ch.

**The Voice Rule.** Keep factual project content in Manrope. Use handwriting for the guide's voice and place atmosphere, and monospace sparingly for chart annotations.

## Layout

The world fills one viewport (`100dvh`); the document itself does not scroll. Wheel movement, touch drags, and arrow keys advance or reverse a winding horizontal route. World X increases while Y and Z undulate. The following perspective camera changes elevation and viewing offset between habitats. Project details open as HTML overlays.

The opening uses a 57/43 portrait/invitation split. At 750px and below it becomes a single column with 52/48 portrait/invitation rows. Preserve the approved portrait's transparent cutout and chest fade. Exploration places identity near the upper left on a padded dark backing, capped at 520px and the available screen width, with travel/discovery controls along the bottom. The narrow HUD becomes a two-column grid with the instruction beneath it.

Details align right in a shaded overlay: a 440px paper panel with bounded height and internal scrolling. On phones it becomes a bottom-aligned sheet, full available width, with a 78dvh height cap. The modal treasure chart is up to 1400px wide, with an intentionally wide 1180px minimum geography stage inside a local horizontal viewport. At 700px and below the chart frame/padding contract; at 1320px and below its scroll hint appears. Keep chart overflow local and the page within the screen.

## Elevation & Depth

The scene uses a perspective camera, rough matte materials, directional sunlight, hemisphere fill, a cooler rim light, fog, and cast/received shadows. Snow shelves, tree trunks, dunes, basalt, buildings, and the adventurer occupy real scene volume. Water, crystals, lamps, and lava have local reflectance, transparency, or emission. The shaded SVG treasure chart is an alternate navigation surface, not a substitute for dimensional world geometry.

Interface shadows identify overlays: conversation (`0 10px 30px #142b2533`), details (`0 20px 80px #10231955`), and map (`0 28px 100px #0e110ed9`). A scene vignette and restrained text shadows support pale controls without enclosing the world in cards.

**The Grounding Rule.** Keep feet, trail, and terrain on the shared route surface, including the coast's deck lift. Scale walking cadence from actual movement; camera smoothing must not create a floating or sliding guide.

Normal motion includes environmental updates and damped camera/character movement; destination jumps over 52 world units can snap the guide. Captures at low quality are visibly softer, so do not infer full-resolution detail from the art style alone. Reduced motion snaps travel and camera placement, freezes ambient scene animation, removes CSS transitions/unfolding, and renders scene changes as needed. Sound remains separate and starts off. Cave activation uses a short fade: world swap at 300ms, transition end at 850ms; reduced motion removes the opacity transition.

Maintain visual depth at the runtime's adaptive quality levels: high caps DPR at 1.25 with a 1024px shadow map, balanced uses 0.8/512px, and low uses 0.6/512px. Sustained slow rendered frames lower quality. Scene culling and visible-neighbour updates control cost without replacing the geometry with drawings.

## Shapes

Scene silhouettes are sculpted and faceted: irregular rock masses, layered foliage, worked timber, pitched roofs, masonry, and a fully modeled character. Keep volume legible from the oblique view. Reuse geometry and instancing for repeated details.

The interface uses square paper panels and rectangular actions. Circular previous/next controls and map numbers orient the visitor; the chart and place label have only a slight corner radius. Conversations are square paper blocks with triangular tails. Preserve the six original project marks and their colors. Orbit uses a name-bearing landmark because no verified logo was found. Sources are recorded in `docs/expedition-logos.md` and `docs/expedition-character-assets.md`.

## Components

### Entry and Discovery Actions

The primary entry action uses Canopy with pale text and an inline arrow; its quiet alternative is an underlined button. Entry with sound is explicit consent. Discovery reverses to warm paper with dark text. Preserve the current hover treatments and visible gold keyboard outline. Disabled terrain arrows fade and stop accepting actions.

### Header and Travel Navigation

The condensed `a.` wordmark, sound state, map, and contact stay in a compact top strip. Text shifts from dark over the opening to pale over the world. Previous/next buttons, arrow keys, map travel, and discovery provide HTML access alongside scene interactions. Place identity, contextual discovery, the map marker, cave proximity, and the progress line follow the rendered guide’s actual position. Requested progress remains separate as route intent, so changing route intent does not immediately relabel the departing habitat. The place/helper region keeps its dark backing over every habitat. If WebGL fails, HTML navigation uses requested progress because no scene position is available.

### Project and Contact Details

Paper panels keep descriptions, technology lists, source links, and contact outside the canvas. They are labeled dialogs with initial focus, a focus loop, Escape/close dismissal, and focus restoration. Source actions remain available while `live` is null; a confirmed destination adds a separate live action. Technology labels are plain text lists.

### Treasure Chart

Parchment folds, shaded miniature habitats, a winding route, numbered markers, and a traveler pin give a spatial overview. A marker's 29px visual circle sits inside a 44px button. Current, hovered, and focused stops gain a dark olive fill and pale text. The native modal dialog contains focus, closes with Escape/backdrop activation, restores its opener, and centers the local viewport near progress. The final cave marker travels to the cave; entering town still requires activation.

### Conversations

Notices and resident speech share warm paper, dark text, a modest lift, and Kalam lettering. Names use Manrope. Captions work without sound; recorded reactions accompany interactions after opt-in. Residents pause briefly on interaction. “People nearby” provides keyboard access to the same conversations.

### Landmarks and Actors

Physical plaques sit within the landscape. Hover raises them; leaving reverses the reveal. Click/tap opens details; the HUD discovery action supplies keyboard access. Preserve raycast occlusion so foreground solids block hidden targets.

The Quaternius Adventurer is a low-poly skinned GLB with a modeled backpack and authored animation clips. Residents reuse the rig with age scale, material/clothing variations, and working/walking behavior. Workers share a generic upper-body interaction clip; bespoke sweeping, building, watering, and held-tool gestures are not established. Town arrival brings the guide beside a companion with hearts and a joined-hands pose using the existing rig. Their shared palm target preserves contact while activation turns both toward the viewer. Reduced motion presents the completed pose without a reaching tween. Facial animation is absent; the supplied captures do not establish finger articulation. Phone arrival framing emphasizes the pair; the resident controls keep offscreen conversations reachable without reframing the camera. Keep town behind the explicitly activated cave, with return travel restoring the saved trail progress.

## Do's and Don'ts

### Do:

- **Do** build terrain, props, and characters as shaded dimensional objects with readable silhouettes and contact shadows.
- **Do** preserve the approved portrait cutout, chest fade, and local font families.
- **Do** keep route, terrain placement, character movement, and camera framing coordinated.
- **Do** keep project facts, navigation, contact, and dialogue available through HTML controls.
- **Do** retain sound opt-in, visible focus, reduced motion, resource cleanup, and asset provenance.

### Don't:

- **Don't** restore the rejected sketch/ASCII scenery or flat illustrated guide as the main world.
- **Don't** describe faceted low-poly geometry or the fixed character face as photorealistic.
- **Don't** require hover, audio, or working WebGL to reach project source links.
- **Don't** invent a project logo or live destination without verified source material.
- **Don't** enter town merely because the traveler reaches the final cave.
