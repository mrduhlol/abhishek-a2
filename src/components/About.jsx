import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import Reveal from "./Reveal.jsx";
import { ABOUT_INTERESTS } from "../data/portfolio.js";

// Opposite side: lightweight "system diagram" — orbiting nodes on a grid
// with floating code fragments. Pure CSS/SVG + one subtle pointer tilt.
function SystemVisual() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0.5);
  const ry = useMotionValue(0.5);
  const srx = useSpring(rx, { stiffness: 80, damping: 18 });
  const sry = useSpring(ry, { stiffness: 80, damping: 18 });
  const tiltX = useTransform(sry, [0, 1], [6, -6]);
  const tiltY = useTransform(srx, [0, 1], [-8, 8]);

  const onMove = (e) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rx.set((e.clientX - r.left) / r.width);
    ry.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
      className="relative overflow-hidden rounded-2xl border border-line bg-wash"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />
      {/* orbit diagram */}
      <svg viewBox="0 0 400 340" className="relative block h-auto w-full text-muted" role="img" aria-label="Abstract system diagram">
        <circle cx="200" cy="165" r="96" fill="none" style={{ stroke: "var(--color-line)" }} />
        <circle cx="200" cy="165" r="58" fill="none" style={{ stroke: "var(--color-line)" }} />
        <circle cx="200" cy="165" r="96" fill="none" stroke="rgba(91,140,255,0.35)" strokeDasharray="4 10" strokeLinecap="round">
          {!reduce && (
            <animateTransform attributeName="transform" type="rotate" from="0 200 165" to="360 200 165" dur="28s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="200" cy="69" r="4" fill="#5B8CFF" />
        <circle cx="200" cy="165" r="4" fill="#8B5CF6" />
        <circle cx="296" cy="165" r="4" fill="currentColor" opacity="0.7" />
        <line x1="200" y1="165" x2="200" y2="69" style={{ stroke: "var(--color-line)" }} />
        <line x1="200" y1="165" x2="296" y2="165" style={{ stroke: "var(--color-line)" }} />
        <text x="212" y="72" fill="currentColor" fontSize="10" fontFamily="monospace">client</text>
        <text x="212" y="168" fill="currentColor" fontSize="10" fontFamily="monospace">core</text>
        <text x="252" y="158" fill="currentColor" fontSize="10" fontFamily="monospace">edge</text>
      </svg>
      {/* floating fragments */}
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-line bg-surface/90 px-3 py-2 font-mono text-[11px] text-ink/60">
        <span className="text-[#5B8CFF]">$</span> whoami<span className="animate-pulse">_</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md border border-line bg-surface/90 px-3 py-2 font-mono text-[11px] text-ink/60">
        status: <span className="text-emerald-400">building</span>
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-20" aria-label="About me">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <SectionHeading index="01" eyebrow="About me" title="Curious about how systems work." />
        <div className="grid items-start gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Reveal>
              <p className="max-w-xl text-lg leading-relaxed text-ink/85 md:text-xl">
                I&apos;m Abhishek, a CSE — Cybersecurity student who enjoys building
                things with code, experimenting with new technologies, and
                understanding how systems work.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl leading-relaxed text-muted">
                I move between building interfaces, breaking things in labs, and
                automating the boring parts away. If it involves code, networks
                or curiosity — I want to try it.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Interests">
                {ABOUT_INTERESTS.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-line bg-wash px-4 py-2 text-[13px] text-ink/75 transition-colors duration-300 hover:border-[#5B8CFF]/40 hover:text-ink"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.2}>
              <dl className="mt-10 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                {[
                  ["Focus", "Build + Break"],
                  ["Base", "India"],
                  ["Mode", "Open to collab"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-surface px-5 py-4">
                    <dt className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">{k}</dt>
                    <dd className="mt-1 text-sm font-medium text-ink/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.12} y={36}>
              <SystemVisual />
              <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
                fig. 01 — my natural habitat: somewhere between the client and the core.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
