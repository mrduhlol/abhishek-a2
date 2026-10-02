import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const QUICK_LINKS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
];

let rippleId = 0;

export default function NotFound({ attemptedPath = "", onHome, onSection }) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState([]);
  const titleRef = useRef(null);

  // Pointer currents: blobs drift toward the cursor like water.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 16 });
  const sy = useSpring(my, { stiffness: 45, damping: 16 });

  useEffect(() => {
    document.title = "404 — Lost in the liquid | Abhishek A.";
    titleRef.current?.focus?.({ preventScroll: true });
    return () => {
      document.title = "Abhishek A. — Developer • Cybersecurity • Builder";
    };
  }, []);

  const spawnRipple = useCallback(
    (e) => {
      if (reduce) return;
      // Don't ripple when clicking actionable controls — let them do their job.
      if (e.target.closest?.("a,button")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++rippleId;
      setRipples((r) => [...r.slice(-5), { id, x, y }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((rip) => rip.id !== id));
      }, 1100);
    },
    [reduce],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (reduce) return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mx.set(nx * 46);
      my.set(ny * 36);
    },
    [mx, my, reduce],
  );

  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else onHome?.();
  }, [onHome]);

  const shortPath =
    attemptedPath.length > 42 ? `…${attemptedPath.slice(-41)}` : attemptedPath || "/unknown";

  return (
    <section
      aria-label="Page not found"
      onPointerDown={spawnRipple}
      onPointerMove={onPointerMove}
      className="liquid-404 relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* SVG defs: goo merger for blobs + wobble displacement for the 404 text */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter id="liquid-wobble" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise">
              {!reduce && (
                <animate
                  attributeName="baseFrequency"
                  values="0.012 0.02;0.018 0.028;0.012 0.02"
                  dur="7s"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={reduce ? 0 : 26} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* shifting gradient sea */}
      <div aria-hidden="true" className="liquid-sea absolute inset-0" />
      <div aria-hidden="true" className="vignette absolute inset-0" />

      {/* morphing goo blobs — merge like liquid through the goo filter */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x: sx, y: sy }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-[-6%]"
          style={reduce ? undefined : { filter: "url(#liquid-goo)" }}
        >
          {!reduce ? (
            <>
              <motion.div
                className="liquid-blob liquid-blob-a"
                animate={{ x: [0, 70, -40, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.92, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="liquid-blob liquid-blob-b"
                animate={{ x: [0, -80, 50, 0], y: [0, 60, -45, 0], scale: [1, 0.9, 1.12, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="liquid-blob liquid-blob-c"
                animate={{ x: [0, 50, -60, 0], y: [0, 45, -55, 0], scale: [1, 1.1, 0.95, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          ) : (
            <>
              <div className="liquid-blob liquid-blob-a" />
              <div className="liquid-blob liquid-blob-b" />
              <div className="liquid-blob liquid-blob-c" />
            </>
          )}
        </div>
      </motion.div>

      {/* click ripples */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3]">
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="liquid-ripple"
            style={{ left: r.x, top: r.y }}
            initial={{ scale: 0, opacity: 0.85 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      {/* minimal top bar */}
      <header className="relative z-[5] mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 md:px-8">
        <button
          type="button"
          onClick={onHome}
          aria-label="Back to home"
          className="text-xl font-extrabold tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-[#5B8CFF]"
        >
          A<span className="text-[#8B5CF6]">.</span>
        </button>
        <p className="font-mono text-[11px] tracking-[0.32em] text-muted">ERROR — 404</p>
      </header>

      {/* center stage */}
      <div className="relative z-[5] mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-14 text-center md:px-8">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow"
        >
          Lost in the liquid
        </motion.p>

        <motion.h1
          ref={titleRef}
          tabIndex={-1}
          aria-label="404 — page not found"
          initial={reduce ? false : { opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-title display-tight mt-4 text-ink outline-none"
          style={
            reduce
              ? undefined
              : { filter: "url(#liquid-wobble)" }
          }
        >
          404
        </motion.h1>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-balance mt-3 text-lg font-semibold text-ink md:text-xl">
            This tide drifted somewhere else.
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            The page you’re looking for dissolved — it may have moved, been
            renamed, or never existed. The current is fine though; let’s get
            you back to shore.
          </p>

          <p className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-wash px-4 py-2 font-mono text-xs text-muted">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
            <span className="truncate" title={attemptedPath}>
              {shortPath}
            </span>
            <span aria-hidden="true">·</span>
            <span>not found</span>
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onHome}
              className="group relative w-full overflow-hidden rounded-full bg-btn px-7 py-3 text-[13px] font-bold tracking-[0.14em] text-btnink outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#5B8CFF] sm:w-auto"
            >
              <span className="relative z-[1]">
                BACK TO SHORE{" "}
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <span aria-hidden="true" className="liquid-btn-sheen" />
            </button>
            <button
              type="button"
              onClick={goBack}
              className="w-full rounded-full border border-line px-7 py-3 text-[13px] font-bold tracking-[0.14em] text-ink outline-none transition-colors duration-300 hover:border-ink/30 hover:bg-wash focus-visible:ring-2 focus-visible:ring-[#5B8CFF] sm:w-auto"
            >
              ← GO BACK
            </button>
          </div>

          <nav aria-label="Site sections" className="mt-9">
            <p className="font-mono text-[11px] tracking-[0.3em] text-muted">OR DIVE TO</p>
            <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onSection?.(l.id)}
                    className="rounded-full border border-line bg-page/60 px-4 py-1.5 text-[13px] font-medium text-muted outline-none backdrop-blur-md transition-colors duration-200 hover:border-[#8B5CF6]/50 hover:text-ink focus-visible:ring-2 focus-visible:ring-[#5B8CFF]"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {!reduce && (
            <p className="mt-8 font-mono text-[11px] tracking-[0.22em] text-muted/70">
              TIP — CLICK ANYWHERE FOR RIPPLES · MOVE FOR CURRENTS
            </p>
          )}
        </motion.div>
      </div>

      <footer className="relative z-[5] mx-auto flex w-full max-w-6xl items-center justify-between px-5 pb-6 text-[12px] text-muted md:px-8">
        <p>Even dead ends can look good.</p>
        <p className="font-mono">© 2026 Abhishek A.</p>
      </footer>
    </section>
  );
}
