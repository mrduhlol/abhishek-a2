import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

// Subtle magnetic pull on pointer devices only. Disabled on touch / reduced motion.
// Rect is cached on enter (no layout read per move); position updates ride rAF via springs.
export default function MagneticButton({ children, strength = 0.25, className = "", ...rest }) {
  const ref = useRef(null);
  const rectRef = useRef(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 16, mass: 0.4 });

  const onEnter = (e) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };
  const onMove = (e) => {
    if (reduce || e.pointerType === "touch" || !rectRef.current) return;
    const r = rectRef.current;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    rectRef.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy, display: "inline-block" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.span>
  );
}
