import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import { SKILL_GROUPS } from "../data/portfolio.js";

// Editorial skill map — grouped, no fake percentages, no icon wall.
// Faint connective traces sit behind the grid for a technical feel.
export default function Skills() {
  const reduce = useReducedMotion();
  return (
    <section id="skills" className="relative scroll-mt-20" aria-label="Skills">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <SectionHeading
          index="03"
          eyebrow="Capabilities"
          title="What I work with."
          blurb="Grouped by where I spend my time — not ranked, not scored."
        />
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 520"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-40 lg:block"
          >
            <path d="M500 0 V120 M0 260 H1000 M500 120 C500 200 240 200 240 300 M500 120 C500 200 760 200 760 300" fill="none" style={{ stroke: "var(--color-line)" }} strokeWidth="1" />
            <circle cx="500" cy="120" r="3" fill="rgba(91,140,255,0.5)" />
            <circle cx="240" cy="300" r="3" fill="rgba(139,92,246,0.5)" />
            <circle cx="760" cy="300" r="3" fill="rgba(91,140,255,0.4)" />
          </svg>
          <div className="relative grid gap-5 sm:grid-cols-2">
            {SKILL_GROUPS.map((g, gi) => (
              <motion.div
                key={g.id}
                initial={reduce ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: gi * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-2xl border border-line bg-surface p-7 transition-colors duration-500 hover:border-ink/25 md:p-8"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[13px] font-bold tracking-[0.28em] uppercase">{g.title}</h3>
                  <span className="font-mono text-[11px] text-muted">0{gi + 1}</span>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-line bg-wash px-4 py-2 text-[13px] text-ink/75 transition-colors duration-300 group-hover:border-ink/20 hover:!border-[#5B8CFF]/40 hover:!text-ink"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
