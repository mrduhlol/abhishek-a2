---
name: Abhishek's portfolio adventure
description: A continuous illustrated expedition through seven project habitats.
colors:
  paper: "#f4efdf"
  ink: "#29271f"
  muted: "#6b685b"
  olive: "#606b43"
  rule: "#d6d0bd"
  speech-paper: "#fffaf0"
  highlands: "#526d82"
  woods: "#526a48"
  fields: "#64723e"
  dunes: "#875a32"
  tide: "#3f7077"
  grotto: "#73617e"
  ember: "#94503d"
typography:
  display:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "min(24cqw, 17vw)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Barlow Condensed", sans-serif'
    fontSize: "clamp(68px, 7.8vw, 112px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.9
  handwritten:
    fontFamily: '"Kalam", cursive'
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "10px"
    lineHeight: 1.7
    letterSpacing: "0.08em"
  mono:
    fontFamily: '"DM Mono", monospace'
    fontSize: "9px"
    fontWeight: 400
rounded:
  square: "0"
  circle: "50%"
  guide-dialog: "4px 14px 14px 14px"
spacing:
  compact: "8px"
  small: "14px"
  medium: "20px"
  large: "24px"
  generous: "30px"
components:
  navigation-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "0"
  navigation-button-hover:
    textColor: "{colors.olive}"
  source-link:
    textColor: "{colors.ink}"
    padding: "10px 0"
    rounded: "{rounded.square}"
  chapter-badge:
    textColor: "{colors.highlands}"
    rounded: "{rounded.circle}"
    width: "29px"
    height: "29px"
  map-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "25px"
    width: "min(440px, 90vw)"
  guide-dialog:
    backgroundColor: "{colors.speech-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.guide-dialog}"
    padding: "16px"
    width: "min(280px, calc(100vw - 32px))"
---

# Design System: Abhishek's portfolio adventure

## Overview

**Creative North Star: "A continuous illustrated expedition"**

Warm paper, charcoal ink, olive field marks: the portfolio feels like a sketchbook carried through a small living world. Monumental condensed lettering gives the work presence; handwritten marginalia and ASCII landforms bring a curious human voice. The approved portrait stays recognizable, with its chest fading into the page beneath the giant name.

The backpack guide and layered Three.js contour scenery share the same drawn language. Space around the copy keeps seven distinct habitats readable. Motion tells the journey through climbing, swinging, swimming, and arrival; the quiet version retains the same places and information. This world replaces the previous portfolio cards and construction scene.

**Key Characteristics:**

- Warm paper and charcoal linework.
- Monumental condensed names with handwritten marginalia.
- Distinct terrain accents within one continuous world.
- A small expressive guide and a populated town.
- Readable content with static and non-WebGL alternatives.

## Colors

The palette has the warmth of paper and the restraint of field sketches; each habitat adds one muted local accent.

### Primary

- **Field Olive** (`olive`): navigation hover, focus, invitations, and the main editorial accent.

### Secondary

- **Highland Blue**, **Woodland Green**, **Open-field Green**, **Dune Ochre**, **Tidal Teal**, **Grotto Violet**, and **Ember Clay**: the corresponding project marker, scene details, handwritten caption, and link hover. Their frontmatter keys match the seven habitats, in journey order.

### Neutral

- **Warm Paper** (`paper`): the continuous page and map ground.
- **Charcoal Ink** (`ink`): headlines, readable copy, contours, and strong borders.
- **Pencil Grey** (`muted`): descriptions, metadata, coordinates, and secondary notes.
- **Paper Rule** (`rule`): quiet separators and route connections.
- **Speech Paper** (`speech-paper`): the guide's conversation and introductory bubble. Town speech uses a nearby warm tint in its own stylesheet.

**The One World Rule.** Terrain accents change by habitat; the paper ground, ink, and type families continue across the entire expedition.

## Typography

**Display Font:** Barlow Condensed, with sans-serif fallback.
**Body Font:** Manrope, with sans-serif fallback.
**Handwritten Font:** Kalam, with cursive fallback.
**Label/Mono Font:** DM Mono, with monospace fallback, for technical annotations.

These fonts are served locally from `public/fonts/`, with swap loading. The condensed display is dense and assertive; Manrope keeps small factual copy calm; Kalam supplies the guide's informal voice.

### Hierarchy

- **Display:** the oversized portrait name uses the display token; its width follows the portrait container. Mobile uses `min(25cqw, 22vw)`.
- **Headline:** project names use the headline token. The longer github-widgets name has a deliberate line break and smaller scale. Contact and town headings use their own responsive display sizes.
- **Title:** project taglines use semibold Manrope and generous leading.
- **Body:** project descriptions use the body token and a maximum width of 350px on desktop, expanding to 380px on mobile.
- **Handwritten:** invitations, terrain captions, and speech use Kalam; size and small rotations vary with placement.
- **Label / Mono:** uppercase chapter coordinates use spaced labels; stack lists and chapter numbers use DM Mono. Keep these secondary to descriptions.

**The Voice Rule.** Reserve handwritten type for human asides and speech; keep project facts in Manrope and technical annotations in DM Mono.

## Layout

The spatial model is a continuous vertical expedition rather than a card grid. A fixed paper header keeps sound and the map within reach. The opening centers the portrait between marginal notes; its desktop height follows the viewport, with an 800px minimum and 1150px cap.

Project stops occupy a maximum 1600px width. Desktop copy and artwork alternate between 40/60 and 60/40 columns, with 8vw horizontal padding; copy remains no wider than 410px. Art may bleed toward the outer edge, while the text column remains clear. At 1600px and above, project padding becomes 120px. At 1100px and below, terrain and heading sizes reduce. At 760px and below, every stop stacks copy above artwork and uses 8vw side padding; the opening and header simplify, and the journey counter disappears.

The town is intentionally wider than a phone: a local horizontal viewport contains a stage at least 900px wide, with a drag hint and keyboard focus. Keep the page itself free of horizontal overflow. Town arrival centers the couple within that viewport.

Use compact spacing within metadata, larger gaps between copy groups, and broad breathing room between chapters. Additional scene breakpoints at 600px, character sizing below 720px, and town adjustments at 700px belong to those components.

## Elevation & Depth

Depth comes primarily from layered contours, low-opacity color washes, foreground silhouettes, ASCII marks, and a small pointer/scroll response in the orthographic Three.js scenes. The ordinary page stays flat. Shadows identify floating conversations and the open map, rather than lifting every project into a container.

### Shadow Vocabulary

- **Map:** `0 16px 40px #29271f1c`, separating the floating field map from the page.
- **Guide dialog:** `0 10px 30px #29271f17`, giving the conversation a small lift.
- **Intro speech:** `0 5px 13px #29271f12`, keeping the spoken aside close to the character.
- **Town speech:** `0 4px 12px #29271f0c`, a softer lift for local dialogue.

**The Quiet Depth Rule.** Keep ordinary content flat; use contour layers for landscape depth and small shadows for floating conversation or navigation.

## Shapes

Typography and open linework dominate. Links are flat text with a bottom rule; map edges are square; numbered chapter markers are circles. Conversations use uneven rounded corners and speech tails. Characters and town buildings are inline SVG, while terrain strokes use Three.js line batches and restrained translucent fills. Preserve the irregular drawn silhouette rather than imposing one rounded rectangle on every surface.

The portrait is the principal raster image. Preserve the approved cutout and chest mask; record provenance alongside any replacement shipping raster.

## Components

### Buttons

Small, direct controls belong to the paper world. Header sound and map controls have transparent backgrounds, compact labels, inline SVG icons, and at least 44px height. Hover uses Field Olive; keyboard focus uses a visible olive outline with offset. Sound starts off and requires an explicit opt-in. A blocked playback attempt produces an inline status notice with a dismiss action.

The guide and residents are actual buttons drawn as people. Preserve their descriptive accessible names, focus rings, and Escape dismissal. The guide's dialog is nonmodal and offers project and opening navigation.

### Links

Project actions are underlined text with an outward arrow, 10px vertical padding, and an 18px icon gap. Hover adopts the terrain accent and nudges the arrow. Pending live destinations render only “Explore the source”; a confirmed live URL adds “Explore project” and changes the repository label to “Source code.”

### Navigation

The compact fixed header uses a condensed `a.` wordmark and quiet Manrope navigation. The map is a bordered paper panel with numbered rows, local terrain names, and an olive current-location marker. Escape returns focus to its toggle; clicking elsewhere or choosing a stop closes it. Small screens keep sound and map visible while hiding the contact shortcut.

### Chapter Markers and Metadata

A fine circular number, terrain label, and short horizontal rule introduce each project. Technical stacks are plain monospace lists separated by slashes. These are annotations, not interactive filter chips.

### Conversations

Guide and town speech use warm paper, charcoal borders, Kalam lettering, and deliberately uneven corners. Residents pause while speaking or focused; replies are announced in a live region. The couple holds hands with hearts at arrival, then stares when activated. Do not make essential project information depend on a conversation.

### Terrain and Guide

Each terrain combines its own contour drawing with ASCII scenery. Renderers mount near the viewport, render on demand, pause offscreen or when the document is hidden, and dispose resources on unmount. A WebGL failure shows the ASCII alternative. Reduced motion removes parallax and character animation; project text and navigation remain available.

The first qualifying scroll shows the supplied quote once per session. With sound enabled, the line plays before the guide jumps; the silent path preserves the bubble and timing. The guide changes pose by habitat and transfers into the town couple at arrival.

## Do's and Don'ts

### Do:

- **Do** carry the paper, ink, and four font families across new sections.
- **Do** keep copy clear of illustration bleed and preserve the mobile reading order.
- **Do** use habitat accents for local markers, captions, and project-link hover.
- **Do** retain visible keyboard focus, readable text, sound opt-in, and reduced-motion behavior.
- **Do** preserve the approved portrait fade and keep raster provenance with assets.

### Don't:

- **Don't** reintroduce the old portfolio cards or construction scene into this expedition.
- **Don't** place project facts inside decorative scene artwork as their only presentation.
- **Don't** turn technical stack annotations into filter controls without an actual filtering feature.
- **Don't** require audio, parallax, or WebGL to understand the projects or use navigation.
