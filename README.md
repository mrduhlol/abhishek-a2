# abhiOS — About Me, OS-style

A custom Linux-style operating system that runs in the browser, built with React + Vite.
It includes a boot screen, draggable windows, a dock, an app launcher, an animated
wallpaper, an About Me app, a photo gallery, and two playable games: Minesweeper and 2048.

## Contents

| App | Description |
|---|---|
| About Me | Bio, skills, and links — ready to personalize |
| Gallery | Photo grid with lightbox — use your own photos |
| Minesweeper | Full game: three difficulties, flags, timer, flood-fill reveal |
| 2048 | Slide and merge with keyboard, swipe, or buttons, plus best score |
| Terminal | Demo shell with help, neofetch, and open commands |

OS features: boot sequence, animated aurora and starfield canvas wallpaper,
top bar with live clock, dock with running indicators, fullscreen app launcher,
drag / focus / minimize / maximize / resize window manager, responsive layout.

## Run it

```bash
npm install
npm run dev
```

Then open the printed `http://127.0.0.1:<port>/` in your browser.

Build for production:

```bash
npm run build
npm run preview
```

## Tech

- React 19 + Vite (no extra dependencies)
- Canvas-animated wallpaper (aurora blobs, stars, particles, grid floor)
- CSS glassmorphism Linux-style desktop

## Project layout

```
src/
  App.jsx            # OS manager: windows, dock, launcher state
  main.jsx           # entry
  index.css          # OS theme
  os/
    Wallpaper.jsx    # animated canvas wallpaper
    BootScreen.jsx   # boot log and progress
    Window.jsx       # draggable and resizable window
    chrome.jsx       # TopBar, Dock, Launcher, WidgetClock
    apps/
      AboutMe.jsx    # edit PROFILE here for your real info
      Gallery.jsx    # point PHOTOS at your own images
      Minesweeper.jsx
      Game2048.jsx
      Terminal.jsx
```

## Make it yours

1. **About Me** — edit `PROFILE` in `src/os/apps/AboutMe.jsx`
   (name, role, bio, skills, links).
2. **Gallery** — put photos in `public/photos/` (for example `you1.jpg`),
   then update `PHOTOS` in `src/os/apps/Gallery.jsx` to `/photos/you1.jpg`.
3. **Wallpaper colors** — adjust `blobs` in `src/os/Wallpaper.jsx`.
4. **Title** — change `<title>` in `index.html`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with Oxlint |
