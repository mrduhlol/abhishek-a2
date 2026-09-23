import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import ParticleField from './ParticleField.jsx';
import InteractivePortrait from './InteractivePortrait.jsx';
import ScrollIndicator from './ScrollIndicator.jsx';
import SocialLinks from './SocialLinks.jsx';
import { HeroLeft, HeroRight, HeroExploring } from './HeroInfo.jsx';

// Reference composition:
//   label -> name -> subtitle -> [info | portrait | info] -> [03 | scroll | 04] -> footer
// The portrait never moves after entrance; only pupils + lids are alive.
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
    }, 1500);
    return () => window.clearTimeout(t);
  }, [reduce]);

  // Background geometry drifts almost imperceptibly on scroll. Nothing else moves.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const ringsY = useTransform(scrollYProgress, [0, 1], [0, 46]);

  const rise = (delay, x = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20, x },
          animate: { opacity: 1, y: 0, x: 0 },
          transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative overflow-hidden"
      aria-label="Intro"
    >
      {/* deep base + whisper radial glow, per reference */}
      <motion.div
        {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1 } })}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#05060A]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 46% 34% at 50% 46%, rgba(91,92,255,0.10), transparent 70%)',
          }}
        />
        <ParticleField />
        <div className="vignette absolute inset-0" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-24 md:px-8 md:pt-28">
        {/* top label */}
        <motion.p
          {...rise(0.15)}
          className="text-center font-mono text-[11px] tracking-[0.42em] text-white/40"
        >
          BUILD • BREAK • LEARN • REPEAT
        </motion.p>

        {/* name — the largest element, never behind the portrait */}
        <div className="mt-5 overflow-hidden">
          <motion.h1
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 44, filter: 'blur(10px)' },
                  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  transition: { duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] },
                })}
            className="display-tight text-center text-[clamp(3rem,9vw,6.5rem)] text-white"
            style={{
              textShadow:
                '0 0 28px rgba(91,140,255,0.35), 0 0 80px rgba(139,92,246,0.22)',
            }}
          >
            ABHISHEK A.
          </motion.h1>
        </div>
        <motion.p {...rise(0.45)} className="mt-3 text-center text-[13px] font-medium tracking-[0.34em] text-[#8B8FA3]">
          CSE — CYBERSECURITY
        </motion.p>

        {/* middle: info | portrait | info */}
        <div className="mt-8 flex flex-col items-center gap-10 md:mt-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
          <motion.div
            {...rise(0.8, -24)}
            className="order-3 flex w-full justify-center lg:order-1 lg:justify-end"
          >
            <HeroLeft />
          </motion.div>

          <motion.div
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.985 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
                })}
            className="relative order-1 w-[min(74vw,340px)] shrink-0 sm:w-[340px] lg:order-2 lg:w-[320px] xl:w-[350px]"
          >
            {/* faint technical geometry behind the portrait */}
            <motion.svg
              viewBox="0 0 400 400"
              aria-hidden="true"
              style={reduce ? undefined : { y: ringsY }}
              className="absolute left-1/2 top-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60"
            >
              <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.06)" />
              <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 7" />
              <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(139,92,246,0.10)" />
              <circle cx="200" cy="50" r="2.5" fill="rgba(91,140,255,0.7)" />
              <circle cx="352" cy="200" r="2" fill="rgba(255,255,255,0.4)" />
              <circle cx="48" cy="200" r="2" fill="rgba(255,255,255,0.25)" />
            </motion.svg>
            <InteractivePortrait liveRef={liveRef} scopeRef={sectionRef} className="relative" />
          </motion.div>

          <motion.div
            {...rise(0.9, 24)}
            className="order-2 flex w-full justify-center lg:order-3 lg:justify-start"
          >
            <HeroRight />
          </motion.div>

          {/* lower row */}
          <motion.div {...rise(1.0)} className="order-4 flex w-full justify-center lg:justify-end">
            <HeroExploring />
          </motion.div>
          <div className="order-6 flex w-full justify-center lg:order-5 lg:col-start-2 lg:row-start-2">
            <ScrollIndicator delay={1.25} />
          </div>
          <motion.div
            {...rise(1.1)}
            className="order-5 w-full lg:order-6 lg:col-start-3 lg:row-start-2"
          >
            <p className="mb-3 font-mono text-[11px] tracking-[0.3em] text-white/45 lg:text-right">
              04 — FIND ME ON
            </p>
            <div className="flex justify-start lg:justify-end">
              <SocialLinks />
            </div>
          </motion.div>
        </div>

        {/* footer row */}
        <motion.div
          {...rise(1.2)}
          className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-5 text-[12px] text-white/35"
        >
          <p>Turning ideas into experiences.</p>
          <p>© 2026 Abhishek A.</p>
        </motion.div>
      </div>
    </section>
  );
}
