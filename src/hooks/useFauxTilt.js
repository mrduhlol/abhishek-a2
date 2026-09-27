import { useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "motion/react";

// Faux-3D tilt primitive — Day 1 (Sep 27) core.
// Simulates depth on flat cards via perspective + rotateX/Y + cursor glare.
// Transform-only (compositor path), springs for inertia, pointer-only.
export function useFauxTilt({
  maxX = 7,
  maxY = 9,
  stiffness = 140,
  damping = 17,
} = {}) {
  const ref = useRef(null);
  const rectRef = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spx = useSpring(px, { stiffness, damping });
  const spy = useSpring(py, { stiffness, damping });

  const rotateX = useTransform(spy, [0, 1], [maxX, -maxX]);
  const rotateY = useTransform(spx, [0, 1], [-maxY, maxY]);

  // Glare position in % + opacity driven by distance from center.
  const glareX = useTransform(spx, (v) => v * 100);
  const glareY = useTransform(spy, (v) => v * 100);

  const onPointerEnter = (e) => {
    if (e.pointerType === "touch" || !ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };
  const onPointerMove = (e) => {
    if (e.pointerType === "touch") return;
    const r = rectRef.current ?? ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  const onPointerLeave = () => {
    rectRef.current = null;
    px.set(0.5);
    py.set(0.5);
  };

  return {
    ref,
    rotateX,
    rotateY,
    glareX,
    glareY,
    handlers: { onPointerEnter, onPointerMove, onPointerLeave },
    reset: onPointerLeave,
  };
}

// Mouse parallax group — maps cursor over a stage to -1..1 motion values.
// Layers multiply by their depth for faux perspective (far moves less).
export function useParallaxGroup({ stiffness = 60, damping = 18 } = {}) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness, damping });
  const smy = useSpring(my, { stiffness, damping });

  const onPointerMove = (e) => {
    if (e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return { ref, mx: smx, my: smy, handlers: { onPointerMove, onPointerLeave } };
}
