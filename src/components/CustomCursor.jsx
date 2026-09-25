import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

// Galaxy cursor: small gradient arrow + lagging nebula trail.
// Fine pointers only; touch and reduced-motion keep the native cursor.
// The eyes follow the same pointer this cursor draws — one source of truth.
const TRAIL = [
  { size: 7, opacity: 0.5, lag: 0.24, color: '#8B5CF6' },
  { size: 5, opacity: 0.38, lag: 0.17, color: '#7A6FF5' },
  { size: 4, opacity: 0.28, lag: 0.12, color: '#5B8CFF' },
  { size: 3, opacity: 0.18, lag: 0.08, color: '#5B8CFF' },
];

export default function CustomCursor() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const arrowRef = useRef(null);
  const labelRef = useRef(null);
  const dotRefs = useRef([]);

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const root = rootRef.current;
    if (!root) return;
    document.body.classList.add('has-custom-cursor');

    const pos = { x: -100, y: -100 };
    const head = { x: -100, y: -100 };
    const trail = TRAIL.map(() => ({ x: -100, y: -100 }));
    let shown = false;
    let raf = 0;
    let hovering = false;
    let onPortrait = false;

    const setShown = (v) => {
      if (shown === v) return;
      shown = v;
      root.style.opacity = v ? '1' : '0';
    };

    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      setShown(true);
      const t = e.target;
      const interactive = t?.closest?.('a, button, [role="button"]');
      const portrait = t?.closest?.('.portrait-frame');
      if (!!interactive !== hovering) {
        hovering = !!interactive;
        arrowRef.current?.classList.toggle('cursor-hot', hovering);
      }
      if (!!portrait !== onPortrait) {
        onPortrait = !!portrait;
        labelRef.current?.classList.toggle('cursor-label-on', onPortrait);
      }
    };
    const onDown = () => arrowRef.current?.classList.add('cursor-press');
    const onUp = () => arrowRef.current?.classList.remove('cursor-press');
    const onLeave = () => setShown(false);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      head.x += (pos.x - head.x) * 0.4;
      head.y += (pos.y - head.y) * 0.4;
      arrowRef.current.style.transform =
        `translate3d(${head.x.toFixed(1)}px, ${head.y.toFixed(1)}px, 0)`;
      labelRef.current.style.transform =
        `translate3d(${(head.x + 18).toFixed(1)}px, ${(head.y + 22).toFixed(1)}px, 0)`;
      let px = head.x;
      let py = head.y;
      for (let i = 0; i < trail.length; i++) {
        const d = trail[i];
        d.x += (px - d.x) * TRAIL[i].lag;
        d.y += (py - d.y) * TRAIL[i].lag;
        const el = dotRefs.current[i];
        if (el) el.style.transform = `translate3d(${d.x.toFixed(1)}px, ${d.y.toFixed(1)}px, 0)`;
        px = d.x;
        py = d.y;
      }
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce]);

  if (reduce) return null;
  return (
    <div ref={rootRef} aria-hidden="true" className="custom-cursor">
      {TRAIL.map((d, i) => (
        <span
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          className="cursor-dot"
          style={{ width: d.size, height: d.size, opacity: d.opacity, background: d.color, color: d.color }}
        />
      ))}
      <div ref={arrowRef} className="cursor-arrow">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <defs>
            <linearGradient id="cursor-g" x1="3" y1="2" x2="17" y2="18">
              <stop offset="0" stopColor="#B7A6FF" />
              <stop offset="0.5" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#5B8CFF" />
            </linearGradient>
          </defs>
          <path
            d="M4 2.5 16.5 10 11 11.5 9.5 17 4 2.5Z"
            fill="url(#cursor-g)"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div ref={labelRef} className="cursor-label">
        LOOK HERE :)
      </div>
    </div>
  );
}
