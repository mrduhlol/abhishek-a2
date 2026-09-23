import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

const LINES = ["I don't just learn technology.", "I like building with it."];

function ScrollLine({ children, progress, range, dim }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const blur = useTransform(progress, range, [10, 0]);
  const y = useTransform(progress, range, [36, 0]);
  const filter = useTransform(blur, (b) => `blur(${b.toFixed(1)}px)`);
  return (
    <motion.span
      style={{ opacity, filter, y }}
      className={`block ${dim ? "text-white/45" : ""}`}
    >
      {children}
    </motion.span>
  );
}

export default function Statement() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.35"] });

  return (
    <section id="statement" ref={ref} className="relative" aria-label="Statement">
      <div className="mx-auto max-w-6xl px-5 py-28 md:px-8 md:py-44">
        <p className="eyebrow mb-8">The short version</p>
        <p className="display-tight text-balance text-4xl sm:text-5xl md:text-7xl">
          {reduce ? (
            <>
              <span className="block">{LINES[0]}</span>
              <span className="block text-white/45">{LINES[1]}</span>
            </>
          ) : (
            <>
              <ScrollLine progress={scrollYProgress} range={[0, 0.55]} dim>
                {LINES[0]}
              </ScrollLine>
              <ScrollLine progress={scrollYProgress} range={[0.4, 1]}>
                {LINES[1]}
              </ScrollLine>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
