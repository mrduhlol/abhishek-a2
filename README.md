# Abhishek A. — Cinematic Portfolio

A premium, cinematic personal portfolio for Abhishek A. (CSE — Cybersecurity).
React + Vite + Tailwind CSS v4 + Motion + Lenis. No WebGL — the atmosphere is a
lightweight 2D canvas + CSS 3D, so it stays fast on mid-range Android phones.

## Run it

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Add a project

Append one object to `PROJECTS` in `src/data/portfolio.js` — the
`Projects` section renders it automatically (number, preview, tags, links).
Pick a `motif` (`cards` | `transfer` | `terminal`) and an `accent` color.

## Go live with GitHub

`src/components/GithubActivity.jsx` has an API-ready slot. Point
`useGithubRepos` at `https://api.github.com/users/mrduhlol/repos?sort=updated`
(and optionally the events endpoint for activity). No stats are faked meanwhile.

## Living portrait hero

The hero centers `assets-src/portrait-dark-source.png` (dark-navy studio
backdrop blends straight into the page — no keying). Regenerate web assets
after replacing the photo:

```bash
npm install --no-save sharp   # scratch dep, not committed (gitignored)
node scripts/portrait-prepare.mjs --out-dir .tmp-portrait
```

Tune gaze/blink in `src/lib/portrait.js` (`MAX_PUPIL_X`, `MAX_PUPIL_Y`,
`EYE_TRACKING_SMOOTHNESS`, `BLINK_MIN_INTERVAL`, `BLINK_MAX_INTERVAL`).
The face itself never moves — only photo-pixel iris overlays translate inside
static almond eye-opening masks, and lid strips sweep for blinks. Eye geometry
+ lid tones are calibrated from the current photo; re-calibrate if it changes
(the script writes an `eyes-check-dark.png` overlay plus tone samples).

Isolated controllers: `EyeTracker.jsx` (rAF gaze loop, no re-renders),
`BlinkController.jsx` (randomized WAAPI scheduler), `CustomCursor.jsx`
(galaxy cursor + trail; fine pointers only).

## Structure

- `src/data/portfolio.js` — all content (nav, projects, skills, journey, socials)
- `src/components/` — `Navbar`, `Hero`, `Statement`, `About`, `Projects`,
  `ProjectCard`, `Skills`, `Journey`, `Exploring`, `GithubActivity`,
  `Contact`, `Footer`, plus primitives (`SectionHeading`, `Reveal`,
  `MagneticButton`, `ScrollProgress`, `ParticleField`)
- `src/hooks/` — `useSmoothScroll` (Lenis), `useActiveSection`

## Notes

- Smooth scroll (Lenis) is skipped for `prefers-reduced-motion` users.
- Heavy effects (tilt, magnetism, particles) are pointer-only and pause offscreen.
