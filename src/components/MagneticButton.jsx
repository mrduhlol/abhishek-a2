import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

// Subtle magnetic pull on pointer devices only. Disabled on touch / reduced motion.
// Rect is cached on enter (no layout read per move); position updates ride rAF via springs.
// Adds a gentle press-down (whileTap) microinteraction for tactile CTA feedback.
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
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy, display: "inline-block" }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.span>
  );
}
