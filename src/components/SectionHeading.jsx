import { motion, useReducedMotion } from "motion/react";

// Minimal editorial heading: eyebrow index + oversized title.
// Keeps hierarchy consistent across sections.
export default function SectionHeading({ index, eyebrow, title, blurb }) {
  const reduce = useReducedMotion();
  return (
    <div className="mb-12 md:mb-16">
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="eyebrow mb-5 flex items-center gap-3"
      >
        <span className="text-white/30">{index}</span>
        <span className="h-px w-8 bg-white/15" aria-hidden="true" />
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="display-tight text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {title}
      </motion.h2>
      {blurb ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-xl text-base leading-relaxed text-[#9CA3AF] md:text-lg"
        >
          {blurb}
        </motion.p>
      ) : null}
    </div>
  );
}
