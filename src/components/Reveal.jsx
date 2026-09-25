import { motion, useReducedMotion } from "motion/react";

// Single scroll-reveal primitive: opacity + translate only (compositor-friendly).
// Use sparingly — not every element needs motion.
export default function Reveal({ children, delay = 0, y = 28, className = "", once = true }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
