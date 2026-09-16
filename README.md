# abhiOS — About Me, OS-style 🖥️

A fake **custom Linux-style operating system** that runs in your browser — built with **React + Vite**.
It has a boot screen, draggable windows, a dock, an app launcher, an animated wallpaper,
an About Me app, a photo gallery, and two playable games: **Minesweeper** and **2048**.

## ✨ What's inside

| App | What it does |
|---|---|
| 🧑‍💻 About Me | Placeholder bio, skills, socials — make it yours |
| 🖼️ Gallery | Photo grid with lightbox — drop in your own pics |
| 💣 Minesweeper | Full game: 3 difficulties, flags, timer, flood-fill |
| 🔢 2048 | Slide & merge with keyboard, swipe, buttons + best score |
| 💻 Terminal | Fake `zsh-lite` with `help`, `neofetch`, `open <app>` |

**OS chrome:** boot sequence, animated aurora + starfield canvas wallpaper,
top bar with live clock, left dock with running indicators, fullscreen app launcher,
drag / focus / minimize / maximize / resize window manager, mobile-responsive layout.

## 🚀 Run it

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

## 🛠️ Tech

- React 19 + Vite (no extra dependencies)
- Canvas-animated wallpaper (aurora blobs, stars, particles, grid floor)
- Pure CSS glassmorphism Linux-style desktop

## 📁 Project layout

```
src/
  App.jsx            # OS manager: windows, dock, launcher state
  main.jsx           # entry
  index.css          # whole OS theme
  os/
    Wallpaper.jsx    # animated canvas wallpaper
    BootScreen.jsx   # boot log + progress
    Window.jsx       # draggable / resizable window
    chrome.jsx       # TopBar, Dock, Launcher, WidgetClock
    apps/
      AboutMe.jsx    # ← edit PROFILE here for your real info
      Gallery.jsx    # ← point PHOTOS at your own images
      Minesweeper.jsx
      Game2048.jsx
      Terminal.jsx
```

## 📝 Make it yours

1. **About Me** — edit `PROFILE` in `src/os/apps/AboutMe.jsx`
   (name, role, bio, skills, links).
2. **Gallery** — put photos in `public/photos/` (e.g. `you1.jpg`),
   then update `PHOTOS` in `src/os/apps/Gallery.jsx` to `/photos/you1.jpg` etc.
3. **Wallpaper colors** — tweak `blobs` in `src/os/Wallpaper.jsx`.
4. **Title** — change `<title>` in `index.html`.

## 📜 Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with Oxlint |

---
Built with 💜 as a portfolio you can *play* with.
