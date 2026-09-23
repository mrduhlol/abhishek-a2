import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import { JOURNEY } from "../data/portfolio.js";

// Cinematic vertical timeline — the rail draws itself as you scroll,
// milestones fade in as the line reaches them.
export default function Journey() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="journey" className="relative scroll-mt-20" aria-label="The journey">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <SectionHeading index="04" eyebrow="Path so far" title="The journey." />
        <div ref={ref} className="relative mx-auto max-w-2xl">
          {/* rail */}
          <div aria-hidden="true" className="absolute bottom-4 left-[7px] top-2 w-px bg-line md:left-[9px]" />
          {!reduce && (
            <motion.div
              aria-hidden="true"
              style={{ scaleY }}
              className="absolute bottom-4 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-[#5B8CFF] to-[#8B5CF6] md:left-[9px]"
            />
          )}
          <ol className="space-y-10 md:space-y-14">
            {JOURNEY.map((m, i) => (
              <motion.li
                key={m.id}
                initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-10 md:pl-14"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border md:h-[19px] md:w-[19px] ${
                    i === JOURNEY.length - 1 ? "border-[#8B5CF6]/60" : "border-ink/20 bg-page"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-[#5B8CFF]" : "bg-ink/50"}`} />
                </span>
                <p className="font-mono text-[11px] tracking-[0.3em] text-muted">0{i + 1}</p>
                <h3 className="display-tight mt-1 text-2xl md:text-3xl">{m.title}</h3>
                <p className="mt-2 max-w-md leading-relaxed text-muted">{m.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
