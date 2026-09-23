import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import ParticleField from "./ParticleField.jsx";
import MagneticButton from "./MagneticButton.jsx";

const LINE = { hidden: { y: "110%" }, show: (i) => ({ y: "0%", transition: { duration: 1, delay: 0.35 + i * 0.12, ease: [0.22, 1, 0.36, 1] } }) };

function useMouseParallax(ref) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  const onMove = (e) => {
    if (reduce || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return { sx, sy, onMove, reduce };
}

export default function Hero() {
  const ref = useRef(null);
  const { sx, sy, onMove, reduce } = useMouseParallax(ref);

  // Layer depths — deliberately tiny. Cinematic, not seasick.
  const bgX = useTransform(sx, (v) => v * 18);
  const bgY = useTransform(sy, (v) => v * 14);
  const gridX = useTransform(sx, (v) => v * -26);
  const gridY = useTransform(sy, (v) => v * -18);
  const textX = useTransform(sx, (v) => v * 10);
  const textY = useTransform(sy, (v) => v * 8);
  const ringX = useTransform(sx, (v) => v * -40);
  const ringY = useTransform(sy, (v) => v * -30);

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Intro"
    >
      {/* atmosphere */}
      <motion.div style={reduce ? undefined : { x: bgX, y: bgY }} className="absolute inset-[-3%]" aria-hidden="true">
        <div className="absolute inset-0 bg-[#08090C]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 42% at 68% 30%, rgba(91,140,255,0.10), transparent 65%), radial-gradient(ellipse 48% 40% at 30% 72%, rgba(139,92,246,0.08), transparent 65%)",
          }}
        />
        {/* faint technical grid */}
        <motion.div
          style={reduce ? undefined : { x: gridX, y: gridY }}
          className="absolute inset-0 opacity-[0.5]"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 75%)",
            }}
          />
        </motion.div>
        <ParticleField />
        {/* abstract geometric ring — CSS 3D, no WebGL needed */}
        <motion.div
          style={reduce ? undefined : { x: ringX, y: ringY }}
          className="absolute right-[-12%] top-[8%] hidden h-[560px] w-[560px] md:block lg:right-[2%]"
        >
          <div
            className="absolute inset-0 rounded-full border border-white/[0.07]"
            style={{ transform: "rotateX(62deg)", transformStyle: "preserve-3d" }}
          />
          <div
            className="absolute inset-[12%] rounded-full border border-white/[0.05]"
            style={{ transform: "rotateX(62deg)" }}
          />
          <div
            className="absolute inset-[26%] rounded-full border border-[#5B8CFF]/15"
            style={{ transform: "rotateX(62deg)" }}
          />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5B8CFF]/70" />
          <div className="absolute left-1/2 top-[6%] h-px w-px rounded-full bg-white/60 shadow-[0_0_12px_2px_rgba(91,140,255,0.8)]" />
        </motion.div>
        <div className="vignette absolute inset-0" />
      </motion.div>

      {/* content */}
      <motion.div
        style={reduce ? undefined : { x: textX, y: textY }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-24 pt-32 md:px-8 md:pb-20"
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow mb-6 flex items-center gap-3"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5B8CFF]" aria-hidden="true" />
          CSE — Cybersecurity
        </motion.p>

        <h1 className="display-tight text-balance text-[17vw] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
          {["BUILDING", "DIGITAL", "EXPERIENCES."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={`block origin-left ${i === 2 ? "text-white/90" : ""}`}
                variants={LINE}
                custom={i}
                initial={reduce ? false : "hidden"}
                animate="show"
              >
                {i === 1 ? (
                  <>
                    <span className="bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] bg-clip-text text-transparent">
                      DIGITAL
                    </span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-sm font-medium tracking-[0.18em] text-white/80"
        >
          Developer&nbsp;&nbsp;•&nbsp;&nbsp;Cybersecurity&nbsp;&nbsp;•&nbsp;&nbsp;Builder
        </motion.p>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-xl text-base leading-relaxed text-[#9CA3AF] md:text-lg"
        >
          I build software, experiment with technology, and explore the intersection
          of development, cybersecurity and AI.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <MagneticButton>
            <a
              href="#projects"
              className="inline-block rounded-full bg-white px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] text-black transition-colors duration-300 hover:bg-white/85"
            >
              VIEW PROJECTS
            </a>
          </MagneticButton>
          <MagneticButton>
            <a
              href="#contact"
              className="inline-block rounded-full border border-white/15 px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
            >
              CONTACT ME
            </a>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.a
        href="#statement"
        aria-label="Scroll to intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] font-semibold tracking-[0.4em] text-white/40">SCROLL</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          {!reduce && (
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-white/70"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </span>
      </motion.a>
    </section>
  );
}
