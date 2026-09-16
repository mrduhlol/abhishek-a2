import { useEffect, useRef } from 'react';

// Warm Ubuntu-palette animated wallpaper: slow drifting gradient blobs + dust
export default function Wallpaper() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let w = 0, h = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const dust = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035, vy: -Math.random() * 0.0004 - 0.00005,
      r: Math.random() * 1.6 + 0.4, a: Math.random() * 0.25 + 0.05,
    }));
    const blobs = [
      { x: 0.25, y: 0.35, r: 0.55, c1: [119, 33, 111], c2: [48, 10, 36], sp: 0.00013, ph: 0 },
      { x: 0.75, y: 0.3, r: 0.5, c1: [233, 84, 32], c2: [120, 30, 10], sp: 0.00017, ph: 2 },
      { x: 0.55, y: 0.75, r: 0.6, c1: [160, 50, 40], c2: [40, 12, 20], sp: 0.0001, ph: 4 },
      { x: 0.15, y: 0.8, r: 0.45, c1: [90, 30, 80], c2: [30, 8, 28], sp: 0.0002, ph: 1 },
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
      const mx = (mouse.current.x - 0.5) * 18;
      const my = (mouse.current.y - 0.5) * 12;

      ctx.fillStyle = '#1e0a18';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      blobs.forEach((b, i) => {
        const bx = (b.x + Math.sin(t * b.sp * 6 + b.ph) * 0.06) * w - mx * (i + 1) * 0.3;
        const by = (b.y + Math.cos(t * b.sp * 5 + b.ph) * 0.05) * h - my * (i + 1) * 0.25;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0, `rgba(${b.c1[0]},${b.c1[1]},${b.c1[2]},0.5)`);
        g.addColorStop(0.6, `rgba(${b.c2[0]},${b.c2[1]},${b.c2[2]},0.25)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(bx - r, by - r, r * 2, r * 2);
      });
      ctx.globalCompositeOperation = 'source-over';

      dust.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        ctx.fillStyle = `rgba(255,220,190,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x * w - mx * 0.6, p.y * h - my * 0.4, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.45)');
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
