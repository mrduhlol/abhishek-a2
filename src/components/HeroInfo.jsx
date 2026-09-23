import { motion, useReducedMotion } from "motion/react";
import MagneticButton from "./MagneticButton.jsx";

const PILLS = ["Cybersecurity", "AI", "Cloud", "Web Development", "Robotics"];

const fade = (delay) => ({
  initial: { opacity: 0, x: 0, y: 18 },
  whileInView: { opacity: 1, x: 0, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
});

function PanelLabel({ index }) {
  return (
    <div aria-hidden="true" className="mb-4">
      <div className="h-px w-full bg-line" />
      <p className="mt-3 font-mono text-[11px] tracking-[0.3em] text-muted">{index}</p>
    </div>
  );
}

// 01 — left of the portrait
export function HeroLeft() {
  const reduce = useReducedMotion();
  const a = reduce ? {} : fade(0.9);
  return (
    <motion.div {...a} className="max-w-[260px]">
      <PanelLabel index="01" />
      <ul className="space-y-1.5 text-[15px] font-semibold leading-snug text-ink/90">
        <li>Developer</li>
        <li>Cybersecurity Enthusiast</li>
        <li>Problem Solver</li>
      </ul>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        I build software, experiment with technology, and explore the
        intersection of development, cybersecurity and AI.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <MagneticButton strength={0.2}>
          <a
            href="#projects"
            className="inline-block rounded-full bg-btn px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] text-btnink transition-colors duration-300 hover:bg-btn/85"
          >
            VIEW PROJECTS →
          </a>
        </MagneticButton>
        <MagneticButton strength={0.2}>
          <a
            href="#contact"
            className="inline-block rounded-full border border-line px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] text-ink transition-colors duration-300 hover:border-ink/30 hover:bg-wash"
          >
            CONTACT ME
          </a>
        </MagneticButton>
      </div>
      <p className="mt-5 flex items-center gap-2 text-[12px] text-muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
        Based in India
      </p>
    </motion.div>
  );
}

const INFO_ROWS = [
  ["Degree", "CSE — Cybersecurity"],
  ["Base", "Mysuru, Karnataka"],
  ["Status", "Building Projects"],
  ["Beyond code", "Anime • Shows • Tech • Creativity"],
];

// 02 — right of the portrait
export function HeroRight() {
  const reduce = useReducedMotion();
  const a = reduce ? {} : fade(1.0);
  return (
    <motion.div {...a} className="max-w-[260px]">
      <PanelLabel index="02" />
      <h2 className="text-[15px] font-semibold text-ink/90">A bit about me</h2>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        A CSE — Cybersecurity student interested in cybersecurity, web
        development, AI, cloud computing and building useful things.
      </p>
      <dl className="mt-5 space-y-2.5">
        {INFO_ROWS.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-3 text-[12px]">
            <dt className="w-20 shrink-0 font-mono tracking-wider text-muted uppercase">{k}</dt>
            <dd className="text-ink/75">{v}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

// 03 — lower left: currently exploring pills
export function HeroExploring() {
  const reduce = useReducedMotion();
  const a = reduce ? {} : fade(1.1);
  return (
    <motion.div {...a}>
      <PanelLabel index="03" />
      <p className="mb-3 font-mono text-[11px] tracking-[0.3em] text-muted">
        CURRENTLY EXPLORING
      </p>
      <ul className="flex max-w-[280px] flex-wrap gap-2" aria-label="Currently exploring">
        {PILLS.map((p) => (
          <li
            key={p}
            className="rounded-full border border-line bg-wash px-3.5 py-1.5 text-[12px] text-ink/70 transition-colors duration-300 hover:border-[#5B8CFF]/40 hover:text-ink"
          >
            {p}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
