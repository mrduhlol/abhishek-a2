import { useEffect, useRef } from "react";

// Extremely subtle drifting particle atmosphere on a 2D canvas.
// Lightweight by design: capped DPR, few particles, pauses offscreen,
// static single-frame render for reduced-motion users, no animation loops otherwise.
export default function ParticleField({ className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 26 : 64;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const parts = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.0003,
      a: 0.12 + Math.random() * 0.4,
      tw: Math.random() * Math.PI * 2,
      ts: 0.002 + Math.random() * 0.006,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width * dpr));
      h = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    // Star tint follows the theme (icy slate on Glacier, starlight on void).
    const tint = { rgb: "200, 214, 255", dim: 1 };
    const syncTint = () => {
      if (document.documentElement.dataset.theme === "glacier") {
        tint.rgb = "35, 70, 135";
        tint.dim = 0.75;
      } else {
        tint.rgb = "200, 214, 255";
        tint.dim = 1;
      }
    };
    syncTint();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        const twinkle = 0.7 + 0.3 * Math.sin(p.tw);
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${tint.rgb}, ${(p.a * twinkle * tint.dim).toFixed(3)})`;
        ctx.fill();
      }
    };

    const step = () => {
      if (!running) return;
      for (const p of parts) {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        p.tw += p.ts * 16;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    draw();
    if (!reduce) raf = requestAnimationFrame(step);

    const onVis = () => {
      const hidden = document.hidden;
      if (reduce) return;
      if (hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!hidden && !running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("aa:theme", syncTint);

    // Pause when hero is offscreen.
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (reduce) return;
        if (entry.isIntersecting && !running && !document.hidden) {
          running = true;
          raf = requestAnimationFrame(step);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    obs.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("aa:theme", syncTint);
      document.removeEventListener("visibilitychange", onVis);
      obs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
