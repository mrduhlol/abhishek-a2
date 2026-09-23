import { motion, useScroll, useSpring } from "motion/react";

// 2px cinematic scroll progress hairline at the very top.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6]"
    />
  );
}
