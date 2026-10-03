import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { SCROLLY_STORY } from "../../data/portfolio.js";

// Scrollytelling 2.0 centerpiece: a 400vh pinned narrative.
// The viewport sticks while scroll scrubs through 4 chapters — each one
// crossfades, rises and scales cinematically, with parallax glow + progress.
// Pure scroll-driven storytelling: no autoplay, no buttons.
function Chapter({ chapter, index, total, progress, reduce }) {
  const start = index / total;
  const end = (index + 1) / total;
  const mid = (start + end) / 2;
  const fade = 0.09 / total + 0.05;

  // Crossfade window around this chapter's slot.
  const opacity = useTransform(progress, [start + 0.015, mid - fade, mid + fade, end - 0.015], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, mid, end], [90, 0, -90]);
  const scale = useTransform(progress, [start, mid, end], [0.94, 1, 1.04]);
  const blur = useTransform(progress, [start + 0.015, mid - fade, mid + fade, end - 0.015], [10, 0, 0, 10]);
  const filter = useTransform(blur, (b) => `blur(${Math.max(0, b).toFixed(1)}px)`);

  if (reduce) return null;

  return (
    <motion.article
      aria-hidden={false}
      style={{ opacity, y, scale, filter }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-transform"
    >
      <p
        className="font-mono text-[11px] font-semibold tracking-[0.42em]"
        style={{ color: chapter.accent }}
      >
        {chapter.index} — {chapter.kink}
      </p>
      <h3 className="display-tight text-balance mt-5 max-w-3xl text-4xl sm:text-5xl md:text-7xl">
        {chapter.title}
      </h3>
      <p className="mt-6 max-w-xl text-balance leading-relaxed text-muted md:text-lg">
        {chapter.text}
      </p>
    </motion.article>
  );
}

function Glow({ progress }) {
  const x = useTransform(progress, [0, 1], ["-12%", "12%"]);
  const hue = useTransform(progress, [0, 0.5, 1], [0, 1, 0]);
  return (
    <motion.div aria-hidden="true" style={{ x }} className="absolute inset-0">
      <div
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(91,140,255,0.16), rgba(139,92,246,0.10) 55%, transparent 75%)",
        }}
      />
      <motion.div style={{ opacity: hue }} className="absolute inset-0" />
    </motion.div>
  );
}

export default function StoryChapters() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const bgY = useTransform(smooth, [0, 1], ["0%", "-8%"]);

  if (reduce) {
    return (
      <section id="story" aria-label="Build, break, learn, repeat" className="relative scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <p className="eyebrow mb-8">The loop</p>
          <div className="space-y-12">
            {SCROLLY_STORY.map((c) => (
              <div key={c.id}>
                <p className="font-mono text-[11px] tracking-[0.42em] text-muted">{c.index} — {c.kink}</p>
                <h3 className="display-tight mt-3 text-3xl md:text-5xl">{c.title}</h3>
                <p className="mt-3 max-w-xl text-muted">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const total = SCROLLY_STORY.length;

  return (
    <section id="story" ref={ref} aria-label="Build, break, learn, repeat" className="relative scroll-mt-20" style={{ height: "420vh" }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* parallax backdrop: grid drifts as chapters scrub */}
        <motion.div aria-hidden="true" style={{ y: bgY }} className="absolute inset-0 -bottom-[10%]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 75%)",
            }}
          />
        </motion.div>
        <Glow progress={smooth} />

        {/* eyebrow stays pinned */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 md:px-8 md:pt-28">
          <p className="eyebrow flex items-center gap-3">
            <span className="text-muted">✦</span> The loop — scroll to play the story
          </p>
        </div>

        {/* chapters crossfade in the pinned stage */}
        <div className="relative z-10 flex-1">
          {SCROLLY_STORY.map((c, i) => (
            <Chapter key={c.id} chapter={c} index={i} total={total} progress={smooth} reduce={reduce} />
          ))}
        </div>

        {/* cinematic chapter dots + progress hairline */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-4 px-5 pb-10 md:px-8">
          <div className="flex items-center gap-2.5" aria-hidden="true">
            {SCROLLY_STORY.map((c, i) => {
              const s = i / total;
              const e = (i + 1) / total;
              return <Dot key={c.id} progress={smooth} range={[s, e]} accent={c.accent} />;
            })}
          </div>
          <div className="relative h-px flex-1 bg-line" aria-hidden="true">
            <motion.div style={{ width: bar }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6]" />
          </div>
          <ChapterCounter progress={smooth} total={total} />
        </div>
      </div>
    </section>
  );
}

function Dot({ progress, range, accent }) {
  const opacity = useTransform(progress, [range[0], (range[0] + range[1]) / 2, range[1]], [0.25, 1, 0.25]);
  const scale = useTransform(progress, [range[0], (range[0] + range[1]) / 2, range[1]], [0.8, 1.35, 0.8]);
  return (
    <motion.span
      style={{ opacity, scale, backgroundColor: accent }}
      className="block h-1.5 w-1.5 rounded-full"
    />
  );
}

function ChapterCounter({ progress, total }) {
  const text = useTransform(progress, (v) => {
    const i = Math.min(total - 1, Math.max(0, Math.floor(v * total)));
    return `0${i + 1} / 0${total}`;
  });
  return (
    <p className="font-mono text-[11px] tabular-nums tracking-[0.25em] text-muted">
      <motion.span>{text}</motion.span>
    </p>
  );
}
