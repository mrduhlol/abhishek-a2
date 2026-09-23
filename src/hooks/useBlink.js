import { useEffect } from 'react';
import { PORTRAIT } from '../lib/portrait.js';

// Natural randomized blinking via the Web Animations API — compositor-driven,
// no React state, no React re-renders. Occasional long + double blinks so it
// never feels metronomic. Skips when the hero is offscreen or tab is hidden.
export function useBlink(lidRefs, scopeRef, liveRef, reduce) {
  useEffect(() => {
    if (reduce) return;
    let timer = 0;
    let followup = 0;
    let alive = true;
    let inView = true;

    const obs = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    if (scopeRef.current) obs.observe(scopeRef.current);

    const lids = () => lidRefs.map((r) => r.current).filter(Boolean);

    const sweep = (duration) => {
      for (const el of lids()) {
        el.animate(
          [
            { transform: 'scaleY(0)' },
            { transform: 'scaleY(1)', offset: 0.38 },
            { transform: 'scaleY(1)', offset: 0.55 },
            { transform: 'scaleY(0)' },
          ],
          { duration, easing: 'ease-in-out' }
        );
      }
    };

    const schedule = () => {
      if (!alive) return;
      const wait =
        PORTRAIT.BLINK_MIN_INTERVAL +
        Math.random() * (PORTRAIT.BLINK_MAX_INTERVAL - PORTRAIT.BLINK_MIN_INTERVAL);
      timer = window.setTimeout(fire, wait);
    };

    const fire = () => {
      if (!alive) return;
      if (liveRef.current && inView && !document.hidden) {
        const roll = Math.random();
        if (roll < 0.12) {
          sweep(PORTRAIT.BLINK_LONG_DURATION); // slow, thoughtful blink
        } else if (roll < 0.24) {
          sweep(PORTRAIT.BLINK_DURATION); // double blink
          followup = window.setTimeout(() => {
            if (alive && liveRef.current && inView && !document.hidden) {
              sweep(PORTRAIT.BLINK_DURATION);
            }
          }, 300);
        } else {
          sweep(PORTRAIT.BLINK_DURATION);
        }
      }
      schedule();
    };

    schedule();
    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.clearTimeout(followup);
      obs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);
}
