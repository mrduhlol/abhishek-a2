import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import ProjectCard from "./ProjectCard.jsx";
import Reveal from "./Reveal.jsx";
import { PROJECTS } from "../data/portfolio.js";

// Scrollytelling stack: cards pin and layer like film frames — each new
// project slides over the last with parallax + cinematic scale-down.
// Falls back to plain stacked reveals for reduced motion.
function StickyCard({ project, index, total, flip }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const y = useTransform(scrollYProgress, [0, 1], [70, 0]);
  const previewY = useTransform(scrollYProgress, [0, 1], [-28, 28]);

  if (reduce) {
    return (
      <div ref={ref}>
        <ProjectCard project={project} flip={flip} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `${96 + index * 18}px`, zIndex: index + 1 }}
    >
      <motion.div style={{ y, scale: 1 }} className="will-change-transform">
        <motion.div style={{ y: previewY }} className="will-change-transform">
          <ProjectCard project={project} flip={flip} />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Main feature section. To add a project, append to PROJECTS in data/portfolio.js.
export default function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-20" aria-label="Selected work">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <SectionHeading
          index="02"
          eyebrow="Selected work"
          title="Work with intent."
          blurb="A few things I've built to learn — games, tools and terminal apps. Scroll: each one takes the frame."
        />
        <div className="space-y-8 md:space-y-12">
          {PROJECTS.map((p, i) => (
            <StickyCard key={p.id} project={p} index={i} total={PROJECTS.length} flip={i % 2 === 1} />
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            More experiments brewing — check GitHub for the latest
          </p>
        </Reveal>
      </div>
    </section>
  );
}
