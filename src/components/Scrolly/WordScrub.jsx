import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// Scroll-scrubbed word reveal: each word fades from dim to full as the
// container travels through the viewport. The signature Apple-style
// scrollytelling text effect, compositor-friendly (opacity only).
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block will-change-transform">
      {children}
    </motion.span>
  );
}

export default function WordScrub({ text, className = "", align = "left" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.88", "end 0.42"],
  });

  const words = text.split(" ");
  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => {
        const start = i / words.length;
        const end = Math.min(1, start + 1.5 / words.length);
        return (
          <span key={`${w}-${i}`} aria-hidden="true">
            <Word progress={scrollYProgress} range={[start, end]}>
              {w}
            </Word>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
