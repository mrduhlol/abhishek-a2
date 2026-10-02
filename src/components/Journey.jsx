import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import { JOURNEY } from "../data/portfolio.js";

// Cinematic vertical timeline — the rail draws itself as you scroll,
// milestones fade in as the line reaches them.
// Faux-3D: items swing in with a slight rotateY + skew, like cards
// turning toward the viewer as the rail reaches them. Heading pins on desktop
// so the story reads as narration over the scrolling milestones.
export default function Journey() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="journey" className="relative scroll-mt-20" aria-label="The journey">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading index="04" eyebrow="Path so far" title="The journey." />
              <p className="mt-4 hidden max-w-sm leading-relaxed text-muted lg:block">
                Scroll — the rail draws the path while each milestone steps into the light.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
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
          <ol className="faux3d-stage space-y-10 md:space-y-14">
            {JOURNEY.map((m, i) => (
              <motion.li
                key={m.id}
                initial={reduce ? false : { opacity: 0, y: 32, rotateY: -9, skewY: 1.5, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0, skewY: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                style={reduce ? undefined : { transformPerspective: 900, transformOrigin: "left center" }}
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
        </div>
      </div>
    </section>
  );
}
