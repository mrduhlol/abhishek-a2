import { useEffect, useRef } from 'react';

// Animated aurora + starfield + perspective grid wallpaper (canvas, lightweight)
export default function Wallpaper() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let w = 0, h = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random() * 0.75,
      r: Math.random() * 1.4 + 0.3, s: Math.random() * 0.25 + 0.05, p: Math.random() * Math.PI * 2,
    }));
    const particles = Array.from({ length: 34 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006, vy: (Math.random() - 0.5) * 0.0006,
      r: Math.random() * 2.2 + 0.8, hue: 250 + Math.random() * 80,
    }));
    const blobs = [
      { x: 0.22, y: 0.3, r: 0.42, h1: [124, 92, 255], h2: [34, 211, 238], sp: 0.00016, ph: 0 },
      { x: 0.78, y: 0.26, r: 0.38, h1: [244, 114, 182], h2: [124, 92, 255], sp: 0.00021, ph: 2 },
      { x: 0.55, y: 0.62, r: 0.5, h1: [34, 211, 238], h2: [52, 211, 153], sp: 0.00012, ph: 4 },
    ];

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMove);

    let t = 0;
    function frame() {
      t += 1;
      const mx = (mouse.current.x - 0.5) * 26;
      const my = (mouse.current.y - 0.5) * 18;

      // base gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a1028');
      bg.addColorStop(0.55, '#070b16');
      bg.addColorStop(1, '#04060d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // aurora blobs
      ctx.globalCompositeOperation = 'lighter';
      blobs.forEach((b, i) => {
        const bx = (b.x + Math.sin(t * b.sp * 6 + b.ph) * 0.05) * w - mx * (i + 1) * 0.4;
        const by = (b.y + Math.cos(t * b.sp * 5 + b.ph) * 0.04) * h - my * (i + 1) * 0.3;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `rgba(${b.h1[0]},${b.h1[1]},${b.h1[2]},0.34)`);
        g.addColorStop(0.55, `rgba(${b.h2[0]},${b.h2[1]},${b.h2[2]},0.14)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(bx - r, by - r, r * 2, r * 2);
      });
      ctx.globalCompositeOperation = 'source-over';

      // stars
      stars.forEach((s) => {
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.02 * s.s * 10 + s.p));
        ctx.globalAlpha = tw * 0.9;
        ctx.fillStyle = '#dbe4ff';
        ctx.beginPath();
        ctx.arc(s.x * w - mx * 0.5, s.y * h - my * 0.35, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // floating particles
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.5)`;
        ctx.beginPath();
        ctx.arc(p.x * w - mx, p.y * h - my, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // perspective grid floor
      const horizon = h * 0.72;
      ctx.strokeStyle = 'rgba(124,92,255,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(w, horizon);
      ctx.stroke();
      for (let i = 0; i <= 24; i++) {
        const x = (i / 24) * w;
        ctx.strokeStyle = 'rgba(124,92,255,0.12)';
        ctx.beginPath();
        ctx.moveTo(w / 2 + (x - w / 2) * 0.25, horizon);
        ctx.lineTo(w / 2 + (x - w / 2) * 2.2, h);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const p = ((t * 0.0016 + i / 8) % 1);
        const y = horizon + (h - horizon) * p * p;
        ctx.strokeStyle = `rgba(34,211,238,${0.05 + p * 0.16})`;
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.stroke();
      }

      // vignette
      const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="wallpaper-canvas" />;
}
