import { motion, useReducedMotion } from "motion/react";

// Bottom-center scroll cue: thin arrow + spaced label, gentle pulse.
export default function ScrollIndicator({ delay = 1.4 }) {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href="#statement"
      aria-label="Scroll to explore"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduce ? {} : { delay, duration: 0.9 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.span
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
        transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm text-ink/60"
      >
        ↓
      </motion.span>
      <span className="font-mono text-[10px] tracking-[0.32em] text-muted">
        SCROLL DOWN
      </span>
    </motion.a>
  );
}
