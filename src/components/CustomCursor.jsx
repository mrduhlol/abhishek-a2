import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

// Eye-moment cursor: the portrait's 6 gaze frames follow the pointer.
// center = idle, look-left/right/up/down = movement direction,
// blink = click + natural auto-blink.
// Fine pointers only; touch and reduced-motion keep the native cursor.
const BASE = import.meta.env.BASE_URL;
const FRAMES = {
  center: `${BASE}cursor-eyes/center.png`,
  left: `${BASE}cursor-eyes/look-left.png`,
  right: `${BASE}cursor-eyes/look-right.png`,
  up: `${BASE}cursor-eyes/look-up.png`,
  down: `${BASE}cursor-eyes/look-down.png`,
  blink: `${BASE}cursor-eyes/blink.png`,
};

// Swap look-left / look-right here if they ever feel mirrored.
const TRAIL = [
  { size: 7, opacity: 0.5, lag: 0.24, color: '#8B5CF6' },
  { size: 5, opacity: 0.38, lag: 0.17, color: '#7A6FF5' },
  { size: 4, opacity: 0.28, lag: 0.12, color: '#5B8CFF' },
  { size: 3, opacity: 0.18, lag: 0.08, color: '#5B8CFF' },
];

function directionFor(vx, vy, speed) {
  if (speed < 5) return 'center';
  const angle = (Math.atan2(vy, vx) * 180) / Math.PI; // -180..180, +y = down
  if (angle >= -45 && angle < 45) return 'right';
  if (angle >= 45 && angle < 135) return 'down';
  if (angle >= -135 && angle < -45) return 'up';
  return 'left';
}

export default function CustomCursor() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const faceRef = useRef(null);
  const faceImgRef = useRef(null);
  const labelRef = useRef(null);
  const dotRefs = useRef([]);

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const root = rootRef.current;
    if (!root) return;
    document.body.classList.add('has-custom-cursor');

    // Preload so frame swaps never flash.
    Object.values(FRAMES).forEach((src) => {
      const im = new Image();
      im.src = src;
    });

    const pos = { x: -100, y: -100 };
    const head = { x: -100, y: -100 };
    const prev = { x: -100, y: -100 };
    const vel = { x: 0, y: 0 };
    const trail = TRAIL.map(() => ({ x: -100, y: -100 }));
    let shown = false;
    let raf = 0;
    let hovering = false;
    let onPortrait = false;
    let pressing = false;
    let blinking = false;
    let blinkTimer = 0;
    let current = 'center';
    let candidate = 'center';
    let candidateHits = 0;
    let lastMove = performance.now();
    let lastBlink = performance.now();
    let nextBlinkIn = 2600 + Math.random() * 2400;

    const setShown = (v) => {
      if (shown === v) return;
      shown = v;
      root.style.opacity = v ? '1' : '0';
    };

    const setFrame = (name) => {
      if (current === name) return;
      current = name;
      const img = faceImgRef.current;
      if (img) img.src = FRAMES[name];
      root.setAttribute('data-cursor-frame', name);
    };

    const scheduleBlink = (now) => {
      if (pressing || blinking) return;
      if (now - lastBlink < nextBlinkIn) return;
      blinking = true;
      setFrame('blink');
      blinkTimer = window.setTimeout(() => {
        blinking = false;
        lastBlink = performance.now();
        nextBlinkIn = 2600 + Math.random() * 2600;
        setFrame(candidate === 'blink' ? 'center' : candidate);
      }, 170);
    };

    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      lastMove = performance.now();
      setShown(true);
      const t = e.target;
      const interactive = t?.closest?.('a, button, [role="button"]');
      const portrait = t?.closest?.('.portrait-frame');
      if (!!interactive !== hovering) {
        hovering = !!interactive;
        faceRef.current?.classList.toggle('cursor-hot', hovering);
      }
      if (!!portrait !== onPortrait) {
        onPortrait = !!portrait;
        labelRef.current?.classList.toggle('cursor-label-on', onPortrait);
      }
    };
    const onDown = () => {
      pressing = true;
      blinking = true;
      window.clearTimeout(blinkTimer);
      setFrame('blink');
      faceRef.current?.classList.add('cursor-press');
    };
    const onUp = () => {
      pressing = false;
      faceRef.current?.classList.remove('cursor-press');
      blinkTimer = window.setTimeout(() => {
        blinking = false;
        lastBlink = performance.now();
        nextBlinkIn = 2600 + Math.random() * 2600;
      }, 160);
    };
    const onLeave = () => setShown(false);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      head.x += (pos.x - head.x) * 0.4;
      head.y += (pos.y - head.y) * 0.4;

      // Smoothed cursor velocity -> gaze direction.
      const ivx = head.x - prev.x;
      const ivy = head.y - prev.y;
      prev.x = head.x;
      prev.y = head.y;
      vel.x += (ivx - vel.x) * 0.35;
      vel.y += (ivy - vel.y) * 0.35;
      const speed = Math.hypot(vel.x, vel.y);
      const idle = now - lastMove > 420;
      const wanted = idle ? 'center' : directionFor(vel.x, vel.y, speed);

      if (wanted === candidate) {
        candidateHits += 1;
      } else {
        candidate = wanted;
        candidateHits = 0;
      }
      // 2-frame hysteresis kills flicker on direction borders.
      if (!pressing && !blinking && candidateHits >= 2) setFrame(candidate);
      scheduleBlink(now);

      // Subtle lean into the move; settles flat when idle.
      const tilt = Math.max(-12, Math.min(12, vel.x * 1.6));
      faceRef.current.style.transform =
        `translate3d(${head.x.toFixed(1)}px, ${head.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
      labelRef.current.style.transform =
        `translate3d(${(head.x + 26).toFixed(1)}px, ${(head.y + 28).toFixed(1)}px, 0)`;
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
      window.clearTimeout(blinkTimer);
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [reduce]);

  if (reduce) return null;
  return (
    <div ref={rootRef} aria-hidden="true" className="custom-cursor" data-cursor-frame="center">
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
      <div ref={faceRef} className="cursor-face">
        <img
          ref={faceImgRef}
          src={FRAMES.center}
          alt=""
          draggable={false}
          width={96}
          height={96}
        />
      </div>
      <div ref={labelRef} className="cursor-label">
        LOOK HERE :)
      </div>
    </div>
  );
}
