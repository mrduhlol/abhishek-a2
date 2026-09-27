import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useFauxTilt } from "../hooks/useFauxTilt.js";

// Faux-3D kit — layering + perspective simulation + scale/skew/rotate.
// All depth is an illusion: nested translateZ + cursor tilt + glare.
// Disabled on touch / reduced-motion; transform-only for 60fps.

// Generic tilt wrapper with cursor glare + inner preserve-3d stage.
export function TiltCard({
  children,
  maxX = 7,
  maxY = 9,
  perspective = 1100,
  scale = 1.015,
  glare = true,
  className = "",
  innerClassName = "",
  ...rest
}) {
  const reduce = useReducedMotion();
  const tilt = useFauxTilt({ maxX, maxY });
  const glareBg = useTransform(
    [tilt.glareX, tilt.glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.14), transparent 55%)`
  );

  if (reduce) return <div className={className} {...rest}>{children}</div>;

  return (
    <motion.div
      ref={tilt.ref}
      {...tilt.handlers}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale }}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: perspective }}
      className={`faux3d-stage ${className}`}
      {...rest}
    >
      <div className={`faux3d-preserve relative h-full ${innerClassName}`}>
        {children}
        {glare ? (
          <motion.span aria-hidden="true" className="faux3d-glare" style={{ background: glareBg }} />
        ) : null}
      </div>
    </motion.div>
  );
}

// A child that floats above its parent — depth in px becomes translateZ.
// Pair with a TiltCard / perspective parent to read as real layering.
export function DepthLayer({ depth = 34, className = "", children, ...rest }) {
  return (
    <div
      className={`faux3d-layer ${className}`}
      style={{ "--faux-z": `${depth}px` }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Mouse-parallax layer: translates by shared mx/my * depth.
// Far layers (small/negative depth) drift less — classic 2.5D backdrop trick.
// Hooks stay unconditional; reduced-motion falls back to a static div.
export function ParallaxLayer({ mx, my, depth = 12, className = "", children, ...rest }) {
  const reduce = useReducedMotion();
  const fallback = useMotionValue(0);
  const srcX = mx ?? fallback;
  const srcY = my ?? fallback;
  const x = useTransform(srcX, (v) => v * depth);
  const y = useTransform(srcY, (v) => v * depth);
  if (reduce || !mx || !my) return <div className={className} {...rest}>{children}</div>;
  return (
    <motion.div style={{ x, y }} className={`will-change-transform ${className}`} {...rest}>
      {children}
    </motion.div>
  );
}

// Scroll-skew wrapper: subtle rotateX entrance that settles flat,
// like a card rising off the page toward the viewer.
export function SkewReveal({ children, className = "", delay = 0, y = 30 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y, rotateX: 10, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
