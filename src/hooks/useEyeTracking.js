import { useEffect } from 'react';
import { PORTRAIT } from '../lib/portrait.js';

// Gaze + proximity tracking. Zero React state — a single rAF loop writes
// transforms straight to refs. Both eyes share one vector (no cartoon wobble).
//
// frameRef: portrait frame | eyeRefs: [leftPatch, rightPatch]
// liveRef:  { current: bool } — flipped true once the entrance completes
// reduce:   prefers-reduced-motion — disables everything
export function useEyeTracking(frameRef, eyeRefs, liveRef, reduce) {
  useEffect(() => {
    if (reduce) return;
    const frame = frameRef.current;
    if (!frame) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight * 0.35, inside: true };
    const gaze = { x: 0, y: 0 }; // smoothed, px at current frame width
    let visible = true;
    let raf = 0;
    let lastGazeAttr = '';

    const onMove = (e) => {
      // Touch drags also steer the gaze; harmless and cheap.
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    const obs = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && liveRef.current && !raf) raf = requestAnimationFrame(tick);
    });
    obs.observe(frame);
    const onVis = () => {
      if (!document.hidden && visible && liveRef.current && !raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = 0;
      if (!liveRef.current || !visible || document.hidden) return;

      const r = frame.getBoundingClientRect();
      const W = r.width || 1;

      // Gaze origin: midpoint between the pupils, in screen space.
      const ex = r.left + ((PORTRAIT.eyes.left.x + PORTRAIT.eyes.right.x) / 2) * W;
      const ey = r.top + PORTRAIT.eyes.left.y * (r.height || W / (PORTRAIT.aspectW / PORTRAIT.aspectH));

      let tx = 0;
      let ty = 0;
      if (pointer.inside) {
        const dx = pointer.x - ex;
        const dy = pointer.y - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const mag = PORTRAIT.MAX_EYE_OFFSET * W * Math.min(1, dist / PORTRAIT.GAZE_FULL_DIST);
        tx = (dx / dist) * mag;
        ty = (dy / dist) * mag * PORTRAIT.EYE_Y_DAMP;
      }
      const k = PORTRAIT.GAZE_LERP;
      gaze.x += (tx - gaze.x) * k;
      gaze.y += (ty - gaze.y) * k;
      if (Math.abs(gaze.x) < 0.02) gaze.x = 0;
      if (Math.abs(gaze.y) < 0.02) gaze.y = 0;

      const gx = gaze.x.toFixed(2);
      const gy = gaze.y.toFixed(2);
      for (const ref of eyeRefs) {
        if (ref.current) ref.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      }

      // Proximity: drift + breathe toward a nearby cursor, else settle home.
      let fx = 0;
      let fy = 0;
      let s = 1;
      if (pointer.inside) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const pdx = pointer.x - cx;
        const pdy = pointer.y - cy;
        const pdist = Math.hypot(pdx, pdy);
        const near = Math.max(r.width, r.height) * 1.1;
        if (pdist < near) {
          const pull = 1 - pdist / near; // 0 far -> 1 on top
          fx = pdx * PORTRAIT.PARALLAX_STRENGTH * pull * 4;
          fy = pdy * PORTRAIT.PARALLAX_STRENGTH * pull * 4;
          s = 1 + (PORTRAIT.PORTRAIT_SCALE - 1) * pull;
        }
      }
      frame.style.transform =
        `translate3d(${fx.toFixed(2)}px, ${fy.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;

      // Test hook: readable gaze state for automated checks.
      const attr = `${gx},${gy}`;
      if (attr !== lastGazeAttr) {
        lastGazeAttr = attr;
        frame.setAttribute('data-gaze', attr);
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      obs.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);
}
