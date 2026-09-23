import { useRef } from 'react';
import { PORTRAIT, patchBgPos, patchBgSize, irisBox, LID_TONE } from '../lib/portrait.js';
import EyeTracker from './EyeTracker.jsx';
import BlinkController from './BlinkController.jsx';

// The photograph is the asset: base layer never moves, never scales.
// Per eye, inside a static almond-clipped opening:
//   cover — blurred copy of the local region melts the resting iris away
//   iris  — crisp photo crop of the iris, the ONLY thing that translates
//   lid   — skin-toned strip swept by the compositor for blinks
function eyeGeometry(eye) {
  const o = eye.open;
  const tex = irisBox(eye);
  const pct = (v) => `${(v * 100).toFixed(3)}%`;
  const texLeftPct = ((tex.left - (o.x - o.w / 2)) / o.w) * 100;
  const texTopPct = ((tex.top - (o.y - o.h / 2)) / o.h) * 100;
  return {
    outer: {
      left: pct(o.x - o.w / 2),
      top: pct(o.y - o.h / 2),
      width: pct(o.w),
      height: pct(o.h),
    },
    coverBg: {
      backgroundImage: `url("${PORTRAIT.webp}")`,
      backgroundSize: patchBgSize(o.w, o.h),
      backgroundPosition: `${patchBgPos(o.x - o.w / 2, o.w)} ${patchBgPos(o.y - o.h / 2, o.h)}`,
    },
    texStyle: {
      left: `${texLeftPct.toFixed(3)}%`,
      top: `${texTopPct.toFixed(3)}%`,
      width: `${((tex.w / o.w) * 100).toFixed(3)}%`,
      height: `${((tex.h / o.h) * 100).toFixed(3)}%`,
      backgroundImage: `url("${PORTRAIT.webp}")`,
      backgroundSize: patchBgSize(tex.w, tex.h),
      backgroundPosition: `${patchBgPos(tex.left, tex.w)} ${patchBgPos(tex.top, tex.h)}`,
    },
  };
}

function Eye({ eyeKey, irisRef, lidRef }) {
  const g = eyeGeometry(PORTRAIT.eyes[eyeKey]);
  return (
    <div aria-hidden="true" className="eye-opening z-[2]" style={g.outer}>
      <div className="eye-cover" style={g.coverBg} />
      <div ref={irisRef} data-iris={eyeKey} className="eye-iris" style={g.texStyle} />
      <div ref={lidRef} className="eye-lid" style={{ background: LID_TONE[eyeKey] }} />
    </div>
  );
}

// Refs live here so layers stay colocated; controllers own the loops.
export default function InteractivePortrait({ liveRef, scopeRef, className = '' }) {
  const frameRef = useRef(null);
  const irisL = useRef(null);
  const irisR = useRef(null);
  const lidL = useRef(null);
  const lidR = useRef(null);

  return (
    <div
      ref={frameRef}
      data-gaze="0,0"
      className={`portrait-frame ${className}`}
      style={{ aspectRatio: `${PORTRAIT.aspectW} / ${PORTRAIT.aspectH}` }}
    >
      <div className="portrait-glow" aria-hidden="true" />

      <picture className="absolute inset-0 z-[1] block">
        <source srcSet={PORTRAIT.webp} type="image/webp" />
        <img
          src={PORTRAIT.png}
          alt="Portrait of Abhishek A."
          draggable={false}
          fetchPriority="high"
          className="block h-full w-full"
        />
      </picture>

      <Eye eyeKey="left" irisRef={irisL} lidRef={lidL} />
      <Eye eyeKey="right" irisRef={irisR} lidRef={lidR} />

      <div className="portrait-melt z-[4]" aria-hidden="true" />

      <EyeTracker frameRef={frameRef} irisRefs={[irisL, irisR]} liveRef={liveRef} />
      <BlinkController lidRefs={[lidL, lidR]} scopeRef={scopeRef ?? frameRef} liveRef={liveRef} />
    </div>
  );
}
