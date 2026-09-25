import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import ParticleField from './ParticleField.jsx';
import InteractivePortrait from './InteractivePortrait.jsx';
import ScrollIndicator from './ScrollIndicator.jsx';
import SocialLinks from './SocialLinks.jsx';
import { HeroLeft, HeroRight, HeroExploring } from './HeroInfo.jsx';

// Composition: label -> portrait -> name (overlapping the chest) ->
// subtitle -> [info | info] -> [03 | scroll | 04] -> footer.
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
      {/* deep base + whisper radial glow */}
      <motion.div
        {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1 } })}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-page" />
        <div
          className="absolute inset-0 hero-void-glow"
          style={{
            background:
              'radial-gradient(ellipse 46% 34% at 50% 46%, rgba(91,92,255,0.10), transparent 70%)',
          }}
        />
        {/* Glacier only: icy alpine front page — sky, sun, ranges, lake, fog */}
        <div className="glacier-scene" aria-hidden="true">
          <div className="glacier-sky" />
          <div className="glacier-sun" />
          <svg className="glacier-mtn glacier-mtn-far" viewBox="0 0 1440 420" preserveAspectRatio="none">
            <path
              d="M0 300 L90 190 L150 240 L230 130 L310 230 L390 170 L470 260 L560 140 L650 250 L740 180 L830 270 L920 150 L1010 250 L1090 190 L1180 280 L1270 170 L1350 240 L1440 200 L1440 420 L0 420 Z"
              fill="url(#gFar)"
              opacity="0.55"
            />
            <path
              d="M0 330 L120 230 L200 290 L300 190 L420 300 L540 210 L660 310 L780 220 L900 310 L1020 210 L1140 300 L1260 220 L1360 290 L1440 250 L1440 420 L0 420 Z"
              fill="#ffffff"
              opacity="0.7"
            />
            <defs>
              <linearGradient id="gFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9d8f2" />
                <stop offset="100%" stopColor="#eef4fc" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="glacier-mtn glacier-mtn-near" viewBox="0 0 1440 340" preserveAspectRatio="none">
            <path
              d="M0 220 L70 120 L130 170 L200 90 L280 200 L340 150 L420 230 L0 340 L0 220 Z"
              fill="url(#gLeft)"
            />
            <path
              d="M1440 210 L1370 110 L1300 170 L1220 80 L1140 190 L1070 140 L990 220 L1440 340 L1440 210 Z"
              fill="url(#gRight)"
            />
            <path
              d="M0 220 L70 120 L110 155 L60 190 L20 175 Z M200 90 L250 150 L220 175 L180 140 Z M1220 80 L1270 140 L1235 165 L1200 130 Z"
              fill="#ffffff"
              opacity="0.95"
            />
            <defs>
              <linearGradient id="gLeft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9db4d8" />
                <stop offset="60%" stopColor="#d5e2f5" />
                <stop offset="100%" stopColor="#f4f8fe" />
              </linearGradient>
              <linearGradient id="gRight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8fa9cf" />
                <stop offset="60%" stopColor="#cfddf1" />
                <stop offset="100%" stopColor="#f2f7fd" />
              </linearGradient>
            </defs>
          </svg>
          <div className="glacier-lake" />
          <div className="glacier-fog" />
        </div>
        <ParticleField />
        <div className="vignette absolute inset-0" />
      </motion.div>

      {/* Glacier only: side rails */}
      <div className="glacier-rail glacier-rail-left" aria-hidden="true">
        <span className="glacier-rail-line" />
        <p>BUILD<br />BREAK<br />LEARN<br />REPEAT</p>
        <span className="glacier-rail-dot" />
        <span className="glacier-rail-tick" />
      </div>
      <div className="glacier-rail glacier-rail-right" aria-hidden="true">
        <p className="glacier-rail-num">02</p>
        <span className="glacier-rail-line" />
        <span className="glacier-rail-dots"><i /><i /><i /><i /><i /></span>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-24 md:px-8 md:pt-28">
        {/* top label — void only; glacier uses side rails instead */}
        <motion.p
          {...rise(0.15)}
          className="hero-top-label text-center font-mono text-[11px] tracking-[0.42em] text-muted"
        >
          BUILD • BREAK • LEARN • REPEAT
        </motion.p>

        {/* portrait — large, seamless, the centerpiece */}
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.985 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] },
              })}
          className="hero-portrait relative mx-auto mt-6 h-[min(72svh,66vw)] aspect-[1448/1086] w-auto shrink-0"
        >
          <div className="portrait-stage" aria-hidden="true" />
          <div className="glacier-halo" aria-hidden="true" />
          {/* faint technical geometry behind the portrait — void only */}
          <motion.svg
            viewBox="0 0 400 400"
            aria-hidden="true"
            style={reduce ? undefined : { y: ringsY }}
            className="hero-rings absolute left-1/2 top-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60"
          >
            <circle cx="200" cy="200" r="150" fill="none" style={{ stroke: 'var(--color-grid)' }} />
            <circle cx="200" cy="200" r="118" fill="none" style={{ stroke: 'var(--color-grid)' }} strokeDasharray="2 7" />
            <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(139,92,246,0.10)" />
            <circle cx="200" cy="50" r="2.5" fill="rgba(91,140,255,0.7)" />
            <circle cx="352" cy="200" r="2" style={{ fill: 'var(--color-ink)' }} fillOpacity="0.4" />
            <circle cx="48" cy="200" r="2" style={{ fill: 'var(--color-ink)' }} fillOpacity="0.25" />
          </motion.svg>
          <InteractivePortrait liveRef={liveRef} scopeRef={sectionRef} className="relative" />
        </motion.div>

        {/* name — overlapping the upper chest, never the face.
            Overlap ≈28% of portrait height, retuned per breakpoint. */}
        <div className="hero-title relative z-10 -mt-[4.5rem] text-center sm:-mt-[7.5rem] lg:-mt-40 xl:-mt-44">
          <motion.p {...rise(0.65)} className="hero-kicker text-center text-[13px] font-semibold tracking-[0.34em]">
            CSE — CYBERSECURITY
          </motion.p>
          <motion.h1
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 44, filter: 'blur(10px)' },
                  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  transition: { duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] },
                })}
            className="hero-name display-tight text-ink text-[clamp(2.5rem,8vw,4.5rem)]"
            style={{
              textShadow:
                '0 0 28px rgba(91,140,255,0.35), 0 0 80px rgba(139,92,246,0.22)',
            }}
          >
            ABHISHEK A.<span className="hero-dot" aria-hidden="true">.</span>
          </motion.h1>
          <div className="glacier-title-rule" aria-hidden="true"><i /></div>
        </div>

        {/* info panels */}
        <div className="mt-12 flex flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          <motion.div
            {...rise(0.9, -24)}
            className="order-2 flex w-full justify-center lg:order-1 lg:justify-end lg:pr-10"
          >
            <HeroLeft />
          </motion.div>
          <motion.div
            {...rise(1.0, 24)}
            className="order-1 flex w-full justify-center lg:order-2 lg:justify-start lg:pl-10"
          >
            <HeroRight />
          </motion.div>
        </div>

        {/* lower row */}
        <div className="mt-12 flex flex-col items-center gap-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <motion.div {...rise(1.05)} className="order-1 flex w-full justify-center lg:justify-end lg:pr-10">
            <HeroExploring />
          </motion.div>
          <div className="order-3 flex w-full justify-center lg:order-2">
            <ScrollIndicator delay={1.25} />
          </div>
          <motion.div {...rise(1.1)} className="order-2 w-full lg:order-3 lg:pl-10">
            <p className="mb-3 font-mono text-[11px] tracking-[0.3em] text-muted lg:text-right">
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
          className="mt-10 flex items-center justify-between border-t border-line pt-5 text-[12px] text-muted"
        >
          <p>Turning ideas into experiences.</p>
          <p>© 2026 Abhishek A.</p>
        </motion.div>
      </div>
    </section>
  );
}
