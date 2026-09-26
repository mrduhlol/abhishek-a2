import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";

// Isometric animation lab — true isometric projection, not perspective.
// The x, y and z axes meet at 120°, edges stay parallel (no converging
// lines / no vanishing point), so flat 2D shapes read as 3D space.
// Orthographic on purpose: the stage never uses `perspective`.
// Cubes are exact SVG rhombi (30° slopes = 120° axes), animated with
// transform/opacity only.

// Edge length in px; cos30 ≈ 0.8660, half-edge vertical drop = e / 2.
function IsoCube({ edge = 64, tone = "blue", delay = 0, float = true, label }) {
  const w = edge * 0.866 * 2;
  const h = edge * 2;
  const cx = w / 2;
  const cy = edge * 0.5 + 4;
  const dx = edge * 0.866;
  const top = `${cx},${cy - edge} ${cx + dx},${cy - edge / 2} ${cx},${cy} ${cx - dx},${cy - edge / 2}`;
  const left = `${cx - dx},${cy - edge / 2} ${cx},${cy} ${cx},${cy + edge} ${cx - dx},${cy + edge / 2}`;
  const right = `${cx + dx},${cy - edge / 2} ${cx},${cy} ${cx},${cy + edge} ${cx + dx},${cy + edge / 2}`;
  return (
    <div
      className={float ? "iso-cube iso-float" : "iso-cube"}
      style={{ animationDelay: `${delay}s` }}
      role="img"
      aria-label={label}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={left} className={`iso-svg-left iso-tone-${tone}`} />
        <polygon points={right} className={`iso-svg-right iso-tone-${tone}`} />
        <polygon points={top} className={`iso-svg-top iso-tone-${tone}`} />
      </svg>
    </div>
  );
}

function AxesDiagram() {
  // 120° between axes, drawn as an SVG so the geometry is exact.
  // Center at (100, 92): up = z, down-left = x, down-right = y.
  return (
    <svg viewBox="0 0 200 184" className="h-auto w-full max-w-[220px]" role="img" aria-label="Isometric axes: x, y and z separated by 120 degrees">
      <g strokeWidth="1.5" style={{ stroke: "var(--color-line)" }}>
        <line x1="20" y1="150" x2="180" y2="150" strokeDasharray="3 5" />
        <line x1="100" y1="20" x2="100" y2="164" strokeDasharray="3 5" />
      </g>
      <g strokeWidth="2" strokeLinecap="round">
        <line x1="100" y1="92" x2="100" y2="30" stroke="#5B8CFF" />
        <line x1="100" y1="92" x2="46" y2="123" stroke="#8B5CF6" />
        <line x1="100" y1="92" x2="154" y2="123" stroke="#2DD4BF" />
      </g>
      <g fontSize="13" fontWeight="700" fontFamily="ui-monospace, monospace">
        <text x="94" y="24" fill="#5B8CFF">z</text>
        <text x="34" y="136" fill="#8B5CF6">x</text>
        <text x="158" y="136" fill="#2DD4BF">y</text>
      </g>
      <g fontSize="10" fontFamily="ui-monospace, monospace" style={{ fill: "var(--color-muted)" }}>
        <text x="106" y="66">120°</text>
        <text x="66" y="108">120°</text>
        <text x="118" y="108">120°</text>
      </g>
      <circle cx="100" cy="92" r="3.5" fill="var(--color-ink)" />
    </svg>
  );
}

export default function IsoLab() {
  const reduce = useReducedMotion();
  const [stacked, setStacked] = useState(false);
  const [wave, setWave] = useState(true);
  const tiles = Array.from({ length: 48 }, (_, i) => i);

  return (
    <section id="iso" aria-label="Isometric animation effects" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
        <SectionHeading
          index="04"
          eyebrow="Isometric Lab"
          title="Flat shapes, spatial motion."
          blurb="True isometric projection — three axes at 120°, parallel edges, zero perspective. Depth is choreography, not a camera."
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          {/* Left: theory card — the 120° contract */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-line bg-surface p-7 md:p-8"
          >
            <p className="font-mono text-[11px] tracking-[0.3em] text-muted">THE CONTRACT</p>
            <div className="mt-5 flex justify-center">
              <AxesDiagram />
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink/75">
              <li className="flex gap-3"><span aria-hidden="true" className="text-[#5B8CFF]">—</span>Axes meet at 120°: x down-left, y down-right, z straight up.</li>
              <li className="flex gap-3"><span aria-hidden="true" className="text-[#8B5CF6]">—</span>Edges never converge — no vanishing point, no perspective.</li>
              <li className="flex gap-3"><span aria-hidden="true" className="text-[#2DD4BF]">—</span>Equal measure on all axes: a cube stays a cube anywhere.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStacked((v) => !v)}
                className="btn-shine relative overflow-hidden rounded-full bg-btn px-5 py-2.5 text-[13px] font-semibold text-btnink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                {stacked ? "Unstack cubes" : "Stack cubes"}
              </button>
              <button
                type="button"
                onClick={() => setWave((v) => !v)}
                aria-pressed={wave}
                className="rounded-full border border-line bg-wash px-5 py-2.5 text-[13px] font-semibold text-ink/80 transition-colors duration-300 hover:border-ink/25 hover:text-ink"
              >
                {wave ? "Pause wave" : "Play wave"}
              </button>
            </div>
          </motion.div>

          {/* Right: animated isometric stage */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="iso-stage relative overflow-hidden rounded-2xl border border-line bg-surface"
          >
            {/* tile grid — the wave travels tile to tile */}
            <div aria-hidden="true" className="iso-grid">
              {tiles.map((t) => (
                <span
                  key={t}
                  className={reduce || !wave ? "iso-tile" : "iso-tile iso-wave"}
                  style={{ animationDelay: `${(t % 8) * 0.18 + Math.floor(t / 8) * 0.12}s` }}
                />
              ))}
            </div>

            {/* cube cluster */}
            <div className="relative flex h-[320px] items-center justify-center sm:h-[360px]">
              <div className={stacked ? "iso-stack is-stacked" : "iso-stack"}>
                <div className="iso-slot iso-slot-a">
                  <IsoCube edge={72} tone="blue" delay={0} float={!reduce} label="Blue isometric cube" />
                </div>
                <div className="iso-slot iso-slot-b">
                  <IsoCube edge={60} tone="violet" delay={-2} float={!reduce} label="Violet isometric cube" />
                </div>
                <div className="iso-slot iso-slot-c">
                  <IsoCube edge={48} tone="teal" delay={-4} float={!reduce} label="Teal isometric cube" />
                </div>
              </div>
            </div>

            <p className="relative border-t border-line px-6 py-4 font-mono text-[11px] tracking-[0.22em] text-muted">
              ORTHOGRAPHIC — NO PERSPECTIVE · TRANSFORM ONLY · 60 FPS
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
