import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import WordScrub from "./Scrolly/WordScrub.jsx";

const LINES = ["I don't just learn technology.", "I like building with it."];
const SCRUB_TEXT =
  "I don't just learn technology — I like building with it. Scroll, and the story builds itself.";

function ScrollLine({ children, progress, range, dim }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const blur = useTransform(progress, range, [10, 0]);
  const y = useTransform(progress, range, [36, 0]);
  // Faux-3D: lines tilt up off the page (rotateX + scale) as they scrub in.
  const rotateX = useTransform(progress, range, [12, 0]);
  const scale = useTransform(progress, range, [0.97, 1]);
  const filter = useTransform(blur, (b) => `blur(${b.toFixed(1)}px)`);
  return (
    <motion.span
      style={{ opacity, filter, y, rotateX, scale, transformPerspective: 900 }}
      className={`block origin-center ${dim ? "text-muted" : "faux3d-text"}`}
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
        <p className="eyebrow mb-8">The short version — keep scrolling</p>
        {/* Scrollytelling lead: word-by-word scrub, then the classic two-line reveal */}
        <WordScrub
          text={SCRUB_TEXT}
          className="display-tight text-balance max-w-4xl text-3xl sm:text-4xl md:text-6xl"
        />
        <p className="display-tight text-balance mt-10 text-2xl text-muted sm:text-3xl md:text-4xl">
          {reduce ? (
            <>
              <span className="block">{LINES[0]}</span>
              <span className="block text-muted">{LINES[1]}</span>
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
