import { useEffect } from 'react';
import { PORTRAIT } from '../lib/portrait.js';

// Pupil-only gaze. The portrait, frame, glasses and lids never move —
// only the iris-texture layers translate, clamped to an elliptical radius
// (MAX_PUPIL_X / MAX_PUPIL_Y) so travel stays anatomically believable.
// Zero React state: one rAF loop writes transforms straight to refs.
// Touch pointers are ignored (no reliable hover); blinking still runs.
export function useEyeTracking(frameRef, irisRefs, liveRef, reduce) {
  useEffect(() => {
    if (reduce) return;
    const frame = frameRef.current;
    if (!frame) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight * 0.35, inside: true };
    const gaze = { x: 0, y: 0 }; // smoothed, px at current frame width
    let visible = true;
    let raf = 0;
    let lastAttr = '';

    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    const obs = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    obs.observe(frame);
    const onVis = () => {
      if (!document.hidden && visible && liveRef.current && !raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = 0;
      // Always reschedule first: the loop must never die.
      raf = requestAnimationFrame(tick);
      if (!liveRef.current || !visible || document.hidden) return;

      const r = frame.getBoundingClientRect();
      const W = r.width || 1;
      const H = r.height || 1;

      // Gaze origin: midpoint between the irises, in screen space.
      const ex = r.left + ((PORTRAIT.eyes.left.iris.x + PORTRAIT.eyes.right.iris.x) / 2) * W;
      const ey = r.top + ((PORTRAIT.eyes.left.iris.y + PORTRAIT.eyes.right.iris.y) / 2) * H;

      let tx = 0;
      let ty = 0;
      if (pointer.inside) {
        const dx = pointer.x - ex;
        const dy = pointer.y - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / PORTRAIT.GAZE_FULL_DIST);
        // Elliptical clamp: independent X/Y maxima, eased by distance.
        let nx = (dx / dist) * reach;
        let ny = (dy / dist) * reach;
        const flat = Math.hypot(nx, ny);
        if (flat > 1) {
          nx /= flat;
          ny /= flat;
        }
        tx = nx * PORTRAIT.MAX_PUPIL_X * W;
        ty = ny * PORTRAIT.MAX_PUPIL_Y * H;
      }
      const k = PORTRAIT.EYE_TRACKING_SMOOTHNESS;
      gaze.x += (tx - gaze.x) * k;
      gaze.y += (ty - gaze.y) * k;
      if (Math.abs(gaze.x) < 0.02) gaze.x = 0;
      if (Math.abs(gaze.y) < 0.02) gaze.y = 0;

      const t = `translate3d(${gaze.x.toFixed(2)}px, ${gaze.y.toFixed(2)}px, 0)`;
      for (const ref of irisRefs) {
        if (ref.current) ref.current.style.transform = t;
      }

      // Test hook: readable gaze state for automated checks.
      const attr = `${gaze.x.toFixed(2)},${gaze.y.toFixed(2)}`;
      if (attr !== lastAttr) {
        lastAttr = attr;
        frame.setAttribute('data-gaze', attr);
      }
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
