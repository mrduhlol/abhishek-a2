import SectionHeading from "./SectionHeading.jsx";
import ProjectCard from "./ProjectCard.jsx";
import Reveal from "./Reveal.jsx";
import { PROJECTS } from "../data/portfolio.js";

// Main feature section. To add a project, append to PROJECTS in data/portfolio.js.
export default function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-20" aria-label="Selected work">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <SectionHeading
          index="02"
          eyebrow="Selected work"
          title="Work with intent."
          blurb="A few things I've built to learn — games, tools and terminal apps. Each one taught me something different."
        />
        <div className="space-y-8 md:space-y-12">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} flip={i % 2 === 1} />
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-white/30 uppercase">
            More experiments brewing — check GitHub for the latest
          </p>
        </Reveal>
      </div>
    </section>
  );
}
