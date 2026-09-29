import { motion, useReducedMotion, useTransform } from "motion/react";
import { useFauxTilt } from "../hooks/useFauxTilt.js";

function BlackjackArt({ accent }) {
  return (
    <div className="relative flex h-full items-center justify-center" aria-hidden="true">
      <div className="absolute h-36 w-24 -rotate-12 rounded-xl border border-line bg-gradient-to-b from-wash to-transparent" />
      <div className="absolute h-36 w-24 rotate-6 rounded-xl border border-ink/20 bg-gradient-to-b from-wash to-transparent" />
      <div
        className="relative flex h-36 w-24 -rotate-3 flex-col items-center justify-center rounded-xl border bg-surface"
        style={{ borderColor: `${accent}55` }}
      >
        <span className="text-3xl font-extrabold" style={{ color: accent }}>21</span>
        <span className="mt-1 font-mono text-[10px] tracking-widest text-muted">BLACK</span>
        <span className="-mt-0.5 font-mono text-[10px] tracking-widest text-muted">JACK</span>
      </div>
      <div
        className="relative ml-[-12px] flex h-36 w-24 rotate-6 flex-col items-center justify-center rounded-xl border bg-surface"
        style={{ borderColor: `${accent}33` }}
      >
        <span className="text-2xl font-extrabold text-ink">A♠</span>
        <span className="mt-1 font-mono text-[10px] tracking-widest text-muted">HIT</span>
      </div>
    </div>
  );
}

// Abstract preview per project — no stock imagery, pure CSS/SVG.
// If project.image is set, the front-page screenshot is shown as the preview pic.
function Preview({ motif, accent, image }) {
  if (image) {
    return (
      <div className="relative h-full" aria-hidden="true">
        <BlackjackArt accent={accent} />
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="max-h-[220px] w-full max-w-md rounded-xl border border-ink/20 object-cover object-top shadow-2xl md:max-h-[300px]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
    );
  }
  if (motif === "blackjack") {
    return <BlackjackArt accent={accent} />;
  }
  if (motif === "transfer") {
    return (
      <div className="relative flex h-full items-center justify-center gap-6" aria-hidden="true">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-wash font-mono text-xs text-ink/60">A</div>
        <div className="relative h-px w-24 bg-line">
          <span className="absolute inset-y-[-2px] left-0 w-1/2 bg-gradient-to-r from-transparent to-[#8B5CF6]" />
          <span className="absolute -top-[3px] left-1/2 h-[7px] w-[7px] rounded-full border border-ink/30 bg-surface" />
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-wash font-mono text-xs text-ink/60">B</div>
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
      <div className="absolute h-36 w-24 -rotate-12 rounded-xl border border-line bg-gradient-to-b from-wash to-transparent" />
      <div className="absolute h-36 w-24 rotate-6 rounded-xl border border-ink/20 bg-gradient-to-b from-wash to-transparent" />
      <div
        className="relative flex h-36 w-24 -rotate-3 flex-col items-center justify-center rounded-xl border bg-surface"
        style={{ borderColor: `${accent}55` }}
      >
        <span className="text-3xl font-extrabold" style={{ color: accent }}>7</span>
        <span className="mt-1 font-mono text-[10px] tracking-widest text-muted">FLIP</span>
      </div>
    </div>
  );
}

export default function ProjectCard({ project, flip = false }) {
  const reduce = useReducedMotion();

  // Faux-3D: stronger cursor tilt + scale lift + cursor glare.
  // Preview art floats (translateZ) above the card face; body copy
  // sits mid-depth so the card reads as layered glass, not flat.
  const tilt = useFauxTilt({ maxX: 6, maxY: 8 });
  const glareBg = useTransform(
    [tilt.glareX, tilt.glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.13), transparent 58%)`
  );

  return (
    <motion.article
      ref={reduce ? undefined : tilt.ref}
      onPointerEnter={reduce ? undefined : tilt.handlers.onPointerEnter}
      onPointerMove={reduce ? undefined : tilt.handlers.onPointerMove}
      onPointerLeave={reduce ? undefined : tilt.handlers.onPointerLeave}
      initial={reduce ? false : { opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { scale: 1.012 }}
      style={reduce ? undefined : { rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 1100 }}
      className="group faux3d-stage faux3d-ground grid overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-500 hover:border-ink/25 md:grid-cols-2"
    >
      {/* preview — floats above face */}
      <div className={`faux3d-preserve relative min-h-[260px] overflow-hidden md:min-h-[380px] ${flip ? "md:order-2" : ""}`}>
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
              "linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black, transparent 85%)",
          }}
        />
        <div className="faux3d-layer relative h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" style={{ "--faux-z": "42px" }}>
          <Preview motif={project.motif} accent={project.accent} image={project.image} />
        </div>
        {!reduce && (
          <motion.span aria-hidden="true" className="faux3d-glare" style={{ background: glareBg }} />
        )}
        <span className="faux3d-layer absolute left-5 top-5 font-mono text-[11px] tracking-[0.3em] text-muted" style={{ "--faux-z": "60px" }}>
          {project.index}
        </span>
      </div>

      {/* body — mid-depth layer */}
      <div className={`faux3d-layer flex flex-col justify-center p-7 md:p-12 ${flip ? "md:order-1" : ""}`} style={{ "--faux-z": "24px" }}>
        <p className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">{project.tagline}</p>
        <h3 className="display-tight mt-3 text-3xl md:text-5xl">{project.name}</h3>
        <p className="mt-4 max-w-md leading-relaxed text-muted">{project.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${project.name} technologies`}>
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line bg-wash px-3.5 py-1.5 text-xs text-ink/70"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={project.links.live}
            aria-label={`View ${project.name}`}
            className="rounded-full bg-btn px-6 py-3 text-xs font-bold tracking-[0.14em] text-btnink transition-colors duration-300 hover:bg-btn/85"
          >
            VIEW PROJECT →
          </a>
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.name} on GitHub`}
            className="rounded-full border border-line px-6 py-3 text-xs font-bold tracking-[0.14em] text-ink transition-colors duration-300 hover:border-ink/30 hover:bg-wash"
          >
            GITHUB
          </a>
        </div>
      </div>
    </motion.article>
  );
}
