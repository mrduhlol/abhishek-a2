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
