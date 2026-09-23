import { useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import ParticleField from './ParticleField.jsx';
import MagneticButton from './MagneticButton.jsx';
import InteractivePortrait from './InteractivePortrait.jsx';

const LINE = {
  hidden: { y: '110%' },
  show: (i) => ({
    y: '0%',
    transition: { duration: 0.9, delay: 0.6 + i * 0.11, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Cinematic entrance (~1.6s): ambient -> portrait reveal -> type lines.
// Eye tracking + blinking arm only after the entrance settles.
export default function Hero() {
  const sectionRef = useRef(null);
  const liveRef = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      liveRef.current = true;
      return;
    }
    const t = window.setTimeout(() => {
      liveRef.current = true;
    }, 1650);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const portraitX = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const anim = (delay, extra = {}) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1], ...extra },
        };

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Intro"
    >
      {/* ambient atmosphere — deliberately quiet so the portrait leads */}
      <motion.div
        {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.2 } })}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#08090C]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 52% 40% at 70% 28%, rgba(91,140,255,0.08), transparent 65%), radial-gradient(ellipse 44% 36% at 28% 74%, rgba(139,92,246,0.06), transparent 65%)',
          }}
        />
        <ParticleField />
        <div className="vignette absolute inset-0" />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-6 px-5 pb-24 pt-28 md:grid-cols-12 md:gap-0 md:px-8 md:pb-16 md:pt-24">
        {/* portrait — the character. first on mobile, right on desktop */}
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, y: 40, scale: 0.97 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 1.15, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
              })}
          style={reduce ? undefined : { y: portraitY, x: portraitX, scale: portraitScale }}
          className="mx-auto w-full max-w-[520px] md:order-2 md:col-span-7 md:col-start-6 md:row-start-1 md:mx-0 md:max-w-none md:-mt-6"
        >
          <InteractivePortrait liveRef={liveRef} scopeRef={sectionRef} />
          <p className="mt-1 text-center font-mono text-[11px] tracking-[0.2em] text-white/25 md:text-right">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400/80" aria-hidden="true" />
            LIVE PORTRAIT — IT WATCHES THE CURSOR
          </p>
        </motion.div>

        {/* text — secondary, overlapping the portrait's quiet side */}
        <motion.div
          style={reduce ? undefined : { y: textY, opacity: textOpacity }}
          className="relative z-10 md:order-1 md:col-span-6 md:col-start-1 md:row-start-1 md:-mt-4"
        >
          <motion.p {...anim(0.5)} className="text-[13px] font-bold tracking-[0.3em] text-white">
            ABHISHEK A.
          </motion.p>
          <motion.p {...anim(0.58)} className="eyebrow mb-6 mt-2">
            CSE — Cybersecurity
          </motion.p>

          <h1 className="display-tight text-balance text-[11vw] sm:text-7xl md:text-6xl lg:text-[5.2rem]">
            {['BUILDING', 'DIGITAL', 'EXPERIENCES.'].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block origin-left"
                  variants={LINE}
                  custom={i}
                  initial={reduce ? false : 'hidden'}
                  animate="show"
                >
                  {i === 1 ? (
                    <span className="bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] bg-clip-text text-transparent">
                      DIGITAL
                    </span>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            {...anim(1.05)}
            className="mt-6 text-[13px] font-medium tracking-[0.18em] text-white/80"
          >
            Developer&nbsp;&nbsp;•&nbsp;&nbsp;Cybersecurity&nbsp;&nbsp;•&nbsp;&nbsp;AI&nbsp;&nbsp;•&nbsp;&nbsp;Builder
          </motion.p>

          <motion.div {...anim(1.15)} className="mt-8 flex flex-wrap items-center gap-4">
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
      </div>

      {/* scroll cue */}
      <motion.a
        href="#statement"
        aria-label="Scroll to intro"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? {} : { delay: 1.8, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] font-semibold tracking-[0.4em] text-white/40">SCROLL</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          {!reduce && (
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-white/70"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </span>
      </motion.a>
    </section>
  );
}
