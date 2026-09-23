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
          className="text-center font-mono text-[11px] tracking-[0.42em] text-muted"
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
          className="relative mx-auto mt-6 w-[min(88vw,430px)] shrink-0 sm:w-[430px] lg:w-[460px] xl:w-[500px]"
        >
          {/* faint technical geometry behind the portrait */}
          <motion.svg
            viewBox="0 0 400 400"
            aria-hidden="true"
            style={reduce ? undefined : { y: ringsY }}
            className="absolute left-1/2 top-1/2 w-[135%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60"
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

        {/* name — overlapping the upper chest, never the face */}
        <div className="relative z-10 -mt-14 text-center sm:-mt-[4.5rem] lg:-mt-24 xl:-mt-28">
          <motion.h1
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 44, filter: 'blur(10px)' },
                  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  transition: { duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] },
                })}
            className="display-tight text-ink text-[clamp(2.5rem,8vw,4.5rem)]"
            style={{
              textShadow:
                '0 0 28px rgba(91,140,255,0.35), 0 0 80px rgba(139,92,246,0.22)',
            }}
          >
            ABHISHEK A.
          </motion.h1>
        </div>
        <motion.p {...rise(0.75)} className="mt-3 text-center text-[13px] font-medium tracking-[0.34em] text-muted">
          CSE — CYBERSECURITY
        </motion.p>

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
