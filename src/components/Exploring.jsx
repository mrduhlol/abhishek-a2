import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import { EXPLORING } from "../data/portfolio.js";

// Smaller curiosity grid — gentle float, staggered, never distracting.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORING.map((c, i) => (
            <motion.div
              key={c.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={reduce ? undefined : { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                className="h-full rounded-2xl border border-white/[0.08] bg-[#0B0D12] p-6 transition-colors duration-500 hover:border-white/[0.16]"
              >
                <p className="font-mono text-[11px] tracking-[0.25em] text-[#5B8CFF]/80">◌</p>
                <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{c.text}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
