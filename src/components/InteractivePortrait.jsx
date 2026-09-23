import { useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { PORTRAIT, patchBgPos, patchBgSize, LID_TONE } from '../lib/portrait.js';
import { useEyeTracking } from '../hooks/useEyeTracking.js';
import { useBlink } from '../hooks/useBlink.js';

// Layered living portrait. The photograph itself is never altered —
// gaze = feather-masked photo duplicates translated a few px,
// blink = skin-toned lid strips swept by the compositor.
// liveRef flips true once the hero entrance completes.
export default function InteractivePortrait({ liveRef, scopeRef, className = '' }) {
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  const patchL = useRef(null);
  const patchR = useRef(null);
  const lidL = useRef(null);
  const lidR = useRef(null);

  useEyeTracking(frameRef, [patchL, patchR], liveRef, reduce);
  useBlink([lidL, lidR], scopeRef ?? frameRef, liveRef, reduce);

  const { w: pw, h: ph } = PORTRAIT.patch;
  const box = (eye) => {
    const left = eye.x - pw / 2;
    const top = eye.y - ph / 2;
    return {
      style: {
        left: `${(left * 100).toFixed(3)}%`,
        top: `${(top * 100).toFixed(3)}%`,
        width: `${(pw * 100).toFixed(3)}%`,
        height: `${(ph * 100).toFixed(3)}%`,
      },
      bgPos: `${patchBgPos(left, pw)} ${patchBgPos(top, ph)}`,
    };
  };
  const boxL = box(PORTRAIT.eyes.left);
  const boxR = box(PORTRAIT.eyes.right);

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

      <div
        ref={patchL}
        aria-hidden="true"
        data-eye="left"
        className="eye-patch z-[2]"
        style={{
          ...boxL.style,
          backgroundImage: `url("${PORTRAIT.webp}")`,
          backgroundSize: patchBgSize(pw, ph),
          backgroundPosition: boxL.bgPos,
        }}
      />
      <div
        ref={patchR}
        aria-hidden="true"
        data-eye="right"
        className="eye-patch z-[2]"
        style={{
          ...boxR.style,
          backgroundImage: `url("${PORTRAIT.webp}")`,
          backgroundSize: patchBgSize(pw, ph),
          backgroundPosition: boxR.bgPos,
        }}
      />

      <div
        ref={lidL}
        aria-hidden="true"
        className="eye-lid z-[3]"
        style={{ ...boxL.style, background: LID_TONE.left }}
      />
      <div
        ref={lidR}
        aria-hidden="true"
        className="eye-lid z-[3]"
        style={{ ...boxR.style, background: LID_TONE.right }}
      />

      <div className="portrait-melt z-[4]" aria-hidden="true" />
    </div>
  );
}
