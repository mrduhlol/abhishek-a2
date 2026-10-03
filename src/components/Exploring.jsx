import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import { EXPLORING } from "../data/portfolio.js";

// Smaller curiosity grid — gentle float, staggered, never distracting.
// Faux-3D: perspective stage, skew/rotate entrance, hover lift + ground
// shadow; icon floats near-depth over the card face.
export default function Exploring() {
  const reduce = useReducedMotion();
  return (
    <section className="relative" aria-label="Currently exploring">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <SectionHeading
          index="05"
          eyebrow="Right now"
          title="Currently exploring."
          blurb="Where my attention is going these days."
        />
        <div className="faux3d-stage grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORING.map((c, i) => (
            <motion.div
              key={c.title}
              initial={reduce ? false : { opacity: 0, y: 28, rotateX: 9, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: (i % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={reduce ? undefined : { transformPerspective: 950 }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={reduce ? undefined : { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                whileHover={reduce ? undefined : { scale: 1.025, rotateX: -2 }}
                className="faux3d-ground h-full rounded-2xl border border-line bg-surface p-6 transition-colors duration-500 hover:border-ink/25"
              >
                <p className="faux3d-layer font-mono text-[11px] tracking-[0.25em] text-[#5B8CFF]/80" style={{ "--faux-z": "30px" }}>◌</p>
                <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
