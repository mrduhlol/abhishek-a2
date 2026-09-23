import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

// Abstract preview per project — no stock imagery, pure CSS/SVG.
function Preview({ motif, accent }) {
  if (motif === "transfer") {
    return (
      <div className="relative flex h-full items-center justify-center gap-6" aria-hidden="true">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-xs text-white/60">A</div>
        <div className="relative h-px w-24 bg-white/15">
          <span className="absolute inset-y-[-2px] left-0 w-1/2 bg-gradient-to-r from-transparent to-[#8B5CF6]" />
          <span className="absolute -top-[3px] left-1/2 h-[7px] w-[7px] rounded-full border border-white/40 bg-[#0B0D12]" />
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-mono text-xs text-white/60">B</div>
      </div>
    );
  }
  if (motif === "terminal") {
    return (
      <div className="flex h-full items-center justify-center p-8" aria-hidden="true">
        <div className="w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#0A0C10]">
          <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="space-y-2.5 p-5 font-mono text-[11px]">
            <p className="text-white/70"><span style={{ color: accent }}>$</span> cricket-dude --live</p>
            <div className="h-2 w-11/12 rounded bg-white/10" />
            <div className="h-2 w-8/12 rounded bg-white/[0.07]" />
            <div className="h-2 w-10/12 rounded bg-white/[0.07]" />
            <p className="text-emerald-400/80">✓ synced 12 matches</p>
          </div>
        </div>
      </div>
    );
  }
  // default: cards
  return (
    <div className="relative flex h-full items-center justify-center" aria-hidden="true">
      <div className="absolute h-36 w-24 -rotate-12 rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02]" />
      <div className="absolute h-36 w-24 rotate-6 rounded-xl border border-white/20 bg-gradient-to-b from-white/[0.10] to-white/[0.03]" />
      <div
        className="relative flex h-36 w-24 -rotate-3 flex-col items-center justify-center rounded-xl border bg-[#0D1017]"
        style={{ borderColor: `${accent}55` }}
      >
        <span className="text-3xl font-extrabold" style={{ color: accent }}>7</span>
        <span className="mt-1 font-mono text-[10px] tracking-widest text-white/40">FLIP</span>
      </div>
    </div>
  );
}

export default function ProjectCard({ project, flip = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  // cursor-follow tilt — tiny, desktop pointers only
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spx = useSpring(px, { stiffness: 120, damping: 18 });
  const spy = useSpring(py, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(spy, [0, 1], [2.5, -2.5]);
  const rotateY = useTransform(spx, [0, 1], [-3, 3]);

  const onMove = (e) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      initial={reduce ? false : { opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
      className="group grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0D12] transition-colors duration-500 hover:border-white/[0.16] md:grid-cols-2"
    >
      {/* preview */}
      <div className={`relative min-h-[260px] overflow-hidden md:min-h-[380px] ${flip ? "md:order-2" : ""}`}>
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${project.accent}14, transparent 70%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black, transparent 85%)",
          }}
        />
        <div className="relative h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          <Preview motif={project.motif} accent={project.accent} />
        </div>
        <span className="absolute left-5 top-5 font-mono text-[11px] tracking-[0.3em] text-white/30">
          {project.index}
        </span>
      </div>

      {/* body */}
      <div className={`flex flex-col justify-center p-7 md:p-12 ${flip ? "md:order-1" : ""}`}>
        <p className="font-mono text-[11px] tracking-[0.28em] text-white/35 uppercase">{project.tagline}</p>
        <h3 className="display-tight mt-3 text-3xl md:text-5xl">{project.name}</h3>
        <p className="mt-4 max-w-md leading-relaxed text-[#9CA3AF]">{project.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.name} technologies`}>
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={project.links.live}
            aria-label={`View ${project.name}`}
            className="rounded-full bg-white px-6 py-3 text-xs font-bold tracking-[0.14em] text-black transition-colors duration-300 hover:bg-white/85"
          >
            VIEW PROJECT →
          </a>
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.name} on GitHub`}
            className="rounded-full border border-white/15 px-6 py-3 text-xs font-bold tracking-[0.14em] text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
          >
            GITHUB
          </a>
        </div>
      </div>
    </motion.article>
  );
}
