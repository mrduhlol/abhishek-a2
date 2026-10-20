// Under-construction front page: the camel-caravan-dusk halftone scene runs
// full-bleed behind a quiet overlay. The scene module paints every pixel;
// this component only clocks frames at the scene's fps and draws one dot per
// cell, sized by tone (meta.dots) and coloured by the scene's own palette.
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import createScene, { meta } from "../art/camel-caravan-dusk.js";
import { SOCIALS } from "../data/portfolio.js";

const COLS = meta.cols;
const ROWS = meta.rows;
const FPS = meta.fps;
const { gamma, floor, sat } = meta.dots.tone;
const TAU = Math.PI * 2;
const BG = "#140c1c"; // the scene's ink — gaps between dots read as night

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// One draw colour + dot radius per palette entry, precomputed once.
const COLORS = Object.values(meta.palette).map((h) => {
  const [r, g, b] = hexToRgb(h);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const tone = Math.pow(lum, gamma); // gamma lifts dusk mids so the sky keeps texture
  const grey = lum * 255;
  const soft = (c) => Math.round(grey + (c - grey) * sat);
  return {
    css: `rgb(${soft(r)},${soft(g)},${soft(b)})`,
    radius: floor + (1 - floor) * Math.sqrt(tone), // dot area ~ tone
  };
});

// colour character -> palette index (the scene writes KEYS[k] per cell)
const CODE = new Int16Array(128).fill(-1);
Object.keys(meta.palette).forEach((k, i) => {
  CODE[k.charCodeAt(0)] = i;
});

const LINKS = [
  { label: "GitHub", href: SOCIALS.github, note: `@${SOCIALS.githubHandle}` },
  { label: "LinkedIn", href: SOCIALS.linkedin, note: "connect" },
  { label: "Email", href: SOCIALS.email, note: SOCIALS.emailLabel },
];

export default function UnderConstruction() {
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frame = createScene();

    let vw = 0, vh = 0, ox = 0, oy = 0, cell = 0, coverMode = true;

    // Wide screens cover the viewport; tall ones fit the width so the sun and
    // the full caravan stay in frame (a centred cinematic band instead).
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      coverMode = w / h >= 1.5;
      cell = coverMode ? Math.max(w / COLS, h / ROWS) : w / COLS;
      vw = w;
      vh = h;
      ox = (w - COLS * cell) / 2;
      oy = (h - ROWS * cell) * (coverMode ? 0.5 : 0.58);
    };

    const render = (t) => {
      const { color } = frame(t);
      const rows = color.split("\n");
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, vw, vh);
      // batch dots by palette colour: one Path2D + one fill per colour
      const buckets = COLORS.map(() => []);
      for (let y = 0; y < ROWS; y++) {
        const row = rows[y];
        const py = oy + (y + 0.5) * cell;
        for (let x = 0; x < COLS; x++) {
          const idx = CODE[row.charCodeAt(x)];
          if (!(idx >= 0)) continue;
          const r = (COLORS[idx].radius * cell) / 2;
          if (r < 0.35) continue;
          buckets[idx].push(ox + (x + 0.5) * cell, py, r);
        }
      }
      for (let i = 0; i < buckets.length; i++) {
        const b = buckets[i];
        if (b.length === 0) continue;
        const path = new Path2D();
        for (let j = 0; j < b.length; j += 3) {
          const px = b[j], py = b[j + 1], r = b[j + 2];
          path.moveTo(px + r, py);
          path.arc(px, py, r, 0, TAU);
        }
        ctx.fillStyle = COLORS[i].css;
        ctx.fill(path);
      }
      // band mode: melt the strip's hard top/bottom edges into the night bg
      if (!coverMode) {
        const fade = Math.min(72, cell * 5);
        let g = ctx.createLinearGradient(0, oy, 0, oy + fade);
        g.addColorStop(0, BG);
        g.addColorStop(1, "rgba(20,12,28,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, oy, vw, fade);
        g = ctx.createLinearGradient(0, oy + ROWS * cell - fade, 0, oy + ROWS * cell);
        g.addColorStop(0, "rgba(20,12,28,0)");
        g.addColorStop(1, BG);
        ctx.fillStyle = g;
        ctx.fillRect(0, oy + ROWS * cell - fade, vw, fade);
      }
    };

    // any resize clears the backing store, so the static frame must redraw
    const onResize = () => {
      resize();
      if (reduce) render(2.5);
    };
    window.addEventListener("resize", onResize);
    resize();

    // reduced motion: one still frame, camels mid-crossing
    if (reduce) {
      render(2.5);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    let last = -Infinity;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 1000 / FPS - 1) return;
      last = now;
      render(now / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return (
    <div className="grain relative min-h-dvh overflow-hidden bg-[#140c1c] text-[#fff6d8]">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full"
      />
      {/* legibility scrims: sky above, dune below, and a soft wash where the text sits */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-44 bg-gradient-to-b from-[#140c1c]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#140c1c]/90 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 w-[64%] max-w-3xl bg-gradient-to-r from-[#140c1c]/65 via-[#140c1c]/35 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-6 md:px-8 md:py-9">
        <header className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.28em] text-[#e8a478]">
          <span>Abhishek A.</span>
          <span className="flex items-center gap-2">
            rebuilding
            <span
              aria-hidden="true"
              className="inline-block h-3 w-[7px] animate-pulse bg-[#ffc8a0]"
            />
          </span>
        </header>

        <main className="mb-auto max-w-2xl pt-16 md:pt-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffc8a0]">
            Pardon the dust
          </p>
          <h1
            className="display-tight mt-4 text-[12vw] leading-[0.92] sm:text-7xl md:text-8xl"
            style={{ textShadow: "0 2px 28px rgba(20,12,28,0.6)" }}
          >
            UNDER
            <br />
            CONSTRUCTION
          </h1>
          <p
            className="mt-5 max-w-md text-sm leading-relaxed text-[#ffe3b8]/95 md:text-base"
            style={{ textShadow: "0 1px 14px rgba(20,12,28,0.55)" }}
          >
            Something new is crossing the desert. The site is being rebuilt — the
            caravan should arrive soon.
          </p>
        </main>

        <footer className="mt-auto flex flex-col gap-5 pb-1 md:flex-row md:items-end md:justify-between">
          <nav aria-label="Contact links" className="flex flex-wrap gap-3">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                className="group inline-flex items-center gap-2 rounded-full border border-[#e8a478]/35 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#ffd88a] transition-colors duration-300 hover:border-[#ffd88a] hover:bg-[#ffd88a] hover:text-[#140c1c]"
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            ))}
          </nav>
          <p
            className="font-mono text-[11px] text-[#e8a478]/80"
            style={{ textShadow: "0 1px 10px rgba(20,12,28,0.6)" }}
          >
            © {new Date().getFullYear()} Abhishek A. — the caravan keeps moving.
          </p>
        </footer>
      </div>
    </div>
  );
}
