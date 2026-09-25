import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Mac-style boot splash: black screen, handwritten "welcome" writes itself
// in, holds, then lifts away to reveal the site. Click / Escape skips.
export default function WelcomeIntro({ onReveal, onDone }) {
  const reduce = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const timers = useRef([]);
  const doneRef = useRef(false);
  const revealRef = useRef(false);
  const onRevealRef = useRef(onReveal);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onRevealRef.current = onReveal;
    onDoneRef.current = onDone;
  });

  const fireReveal = useCallback(() => {
    if (revealRef.current) return;
    revealRef.current = true;
    onRevealRef.current?.();
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    fireReveal();
    setGone(true);
    onDoneRef.current?.();
  }, [fireReveal]);

  const beginExit = useCallback(() => {
    fireReveal(); // mount the site behind the fade so entrances overlap
    setLeaving(true);
  }, [fireReveal]);

  useEffect(() => {
    // Lock scroll behind the splash.
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (reduce) {
      fireReveal();
      const t = window.setTimeout(finish, 60);
      timers.current.push(t);
    } else {
      // Mac-like pacing: write on (~1.2s) -> hold -> lift away.
      timers.current.push(window.setTimeout(beginExit, 2100));
      timers.current.push(window.setTimeout(finish, 2900));
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        beginExit();
        window.setTimeout(finish, 350);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [reduce, beginExit, finish, fireReveal]);

  if (gone) return null;

  const skip = () => {
    beginExit();
    window.setTimeout(finish, 350);
  };

  const letters = "welcome".split("");

  return (
    <motion.div
      role="status"
      aria-label="Welcome"
      onClick={skip}
      onTouchStart={skip}
      className="fixed inset-0 z-[180] flex cursor-pointer items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={leaving ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="px-6 text-center">
        <h1
          aria-label="welcome"
          className="welcome-script text-white"
          style={{
            fontSize: "clamp(4.5rem, 15vw, 10rem)",
            lineHeight: 1,
            textShadow: "0 0 60px rgba(255,255,255,0.25)",
          }}
        >
          {letters.map((ch, i) =>
            reduce ? (
              <span key={i}>{ch}</span>
            ) : (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 26, filter: "blur(14px)", rotate: -5 }}
                animate={
                  leaving
                    ? { opacity: 0, y: -22, filter: "blur(10px)" }
                    : { opacity: 1, y: 0, filter: "blur(0px)", rotate: 0 }
                }
                transition={
                  leaving
                    ? { duration: 0.45, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }
                    : {
                        duration: 0.75,
                        delay: 0.25 + i * 0.09,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
              >
                {ch}
              </motion.span>
            ),
          )}
          {/* brand dot, like your A. mark */}
          {reduce ? (
            <span style={{ color: "#8B5CF6" }}>.</span>
          ) : (
            <motion.span
              className="inline-block"
              style={{ color: "#8B5CF6" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                leaving
                  ? { opacity: 0, scale: 0.6 }
                  : { opacity: 1, scale: 1 }
              }
              transition={
                leaving
                  ? { duration: 0.35, ease: "easeIn" }
                  : {
                      duration: 0.5,
                      delay: 0.25 + letters.length * 0.09,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
            >
              .
            </motion.span>
          )}
        </h1>
        {!reduce && !leaving && (
          <motion.p
            className="mt-8 font-mono text-[11px] tracking-[0.34em] text-white/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            CLICK ANYWHERE TO SKIP
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
