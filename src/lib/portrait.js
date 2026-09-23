// Living-portrait tunables + geometry. Tune here, no component changes needed.
//
// Eye tracking approach (no CV libs): each eye gets a feather-masked patch
// that re-renders the same photograph, translated a few px toward the cursor.
// At this magnitude it reads as a gaze shift, not a slide — the glasses,
// iris and catchlights all move together, exactly like a real glance.

const BASE = import.meta.env.BASE_URL;

export const PORTRAIT = {
  webp: `${BASE}portrait-cutout.webp`,
  png: `${BASE}portrait-cutout.png`,
  aspectW: 1448,
  aspectH: 1086,

  // Pupil centers, calibrated from 3x lens crops (fractions of source)
  eyes: {
    left: { x: 0.452, y: 0.318 },
    right: { x: 0.58, y: 0.318 },
  },
  // Eye patch size as fractions of container (opening + margin)
  patch: { w: 0.078, h: 0.08 },

  // ---- tunables ----
  // Max gaze shift, as a fraction of portrait width (~5px at 600px wide)
  MAX_EYE_OFFSET: 0.0085,
  // Vertical gaze is damped — real eyes move less vertically
  EYE_Y_DAMP: 0.7,
  // Gaze easing per rAF tick (0..1, higher = snappier)
  GAZE_LERP: 0.14,
  // Cursor distance (px) at which gaze reaches full offset
  GAZE_FULL_DIST: 420,
  // Whole-portrait drift toward nearby cursor (fraction of width)
  PARALLAX_STRENGTH: 0.006,
  // Whole-portrait scale when cursor is close (1 = off)
  PORTRAIT_SCALE: 1.015,
  // Blink scheduler bounds (ms)
  BLINK_MIN_INTERVAL: 3000,
  BLINK_MAX_INTERVAL: 6000,
  // Blink durations (ms): normal close-open sweep, occasional long blink
  BLINK_DURATION: 200,
  BLINK_LONG_DURATION: 340,
};

// background-position % that aligns the full photo inside a patch box.
// patchStart: patch top/left as fraction of container; size: patch w/h fraction.
export function patchBgPos(patchStart, size) {
  return `${((patchStart / (1 - size)) * 100).toFixed(3)}%`;
}

// background-size that renders the photo at 1:1 container scale inside a patch.
export function patchBgSize(patchW, patchH) {
  return `${(100 / patchW).toFixed(3)}% ${(100 / patchH).toFixed(3)}%`;
}

// Lid gradient per eye, sampled from the photograph (scripts/portrait-cutout.mjs).
export const LID_TONE = {
  left: 'linear-gradient(180deg, #5e3626 0%, #8c523a 45%, #9a5f42 100%)',
  right: 'linear-gradient(180deg, #643a28 0%, #9a5d40 45%, #a26644 100%)',
};
