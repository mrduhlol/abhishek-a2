// Living-portrait tunables + geometry. Tune here, no component changes needed.
//
// Pupil-only tracking (no CV libs, face never moves):
//   base photo (static)
//     -> cover: blurred copy of the local eye region melts the resting iris
//        into the sclera, so no ghost iris shows through (all photo pixels)
//     -> iris: crisp photo crop of the iris, translated a few px, clipped to
//        the static almond eye-opening mask
//     -> lid: skin-toned strip swept by the compositor for blinks
// Only the iris texture translates. Glasses, lids, head: untouched.

const BASE = import.meta.env.BASE_URL;

export const PORTRAIT = {
  webp: `${BASE}portrait.webp`,
  png: `${BASE}portrait.png`,
  aspectW: 1448,
  aspectH: 1086,

  // Opening boxes + iris centers, calibrated from 3x lens crops (fractions).
  // Verify with: node scripts/portrait-prepare.mjs (writes eyes-check overlay)
  eyes: {
    left: {
      open: { x: 0.447, y: 0.33, w: 0.05, h: 0.044 },
      iris: { x: 0.447, y: 0.33 },
    },
    right: {
      open: { x: 0.58, y: 0.329, w: 0.052, h: 0.044 },
      iris: { x: 0.58, y: 0.328 },
    },
  },

  // ---- tunables ----
  // Max pupil travel as a fraction of portrait width/height. Calibrated so
  // the iris edge just reaches the eye corner at full deflection (~8px / ~2px
  // at 768px display width). Travel scales with cursor distance, so the
  // further the cursor goes, the further the iris moves, up to this clamp.
  MAX_PUPIL_X: 0.01,
  MAX_PUPIL_Y: 0.004,
  // Gaze easing per rAF tick (0..1, higher = snappier, never snaps)
  EYE_TRACKING_SMOOTHNESS: 0.16,
  // Cursor distance (px) at which the gaze reaches full deflection
  GAZE_FULL_DIST: 650,
  // Blink scheduler bounds (ms)
  BLINK_MIN_INTERVAL: 3000,
  BLINK_MAX_INTERVAL: 6000,
  // Blink durations (ms): normal close-open sweep, occasional long blink
  BLINK_DURATION: 200,
  BLINK_LONG_DURATION: 340,
};

// background-position % that renders the full photo 1:1 inside a sub-box.
// boxStart: box top/left as fraction of container; size: box w/h fraction.
export function patchBgPos(boxStart, size) {
  return `${((boxStart / (1 - size)) * 100).toFixed(3)}%`;
}

// background-size that renders the photo at 1:1 container scale inside a box.
export function patchBgSize(boxW, boxH) {
  return `${(100 / boxW).toFixed(3)}% ${(100 / boxH).toFixed(3)}%`;
}

// Iris texture box: opening expanded by max travel + slack, centered on iris.
export function irisBox(eye) {
  const hw = eye.open.w / 2 + PORTRAIT.MAX_PUPIL_X + 0.0012;
  const hh = eye.open.h / 2 + PORTRAIT.MAX_PUPIL_Y + 0.0012;
  return { left: eye.iris.x - hw, top: eye.iris.y - hh, w: hw * 2, h: hh * 2 };
}

// Full-eyelid blink box: wider + taller than the opening so the sweep reads
// as a real lid closing, not a patch flicker. Centered on the eye.
export function lidBox(eye) {
  const o = eye.open;
  const w = o.w * 1.3;
  const h = o.h * 1.75;
  return {
    left: o.x - w / 2,
    top: o.y - h / 2 - o.h * 0.15,
    w,
    h,
  };
}

// Lid gradients, sampled from the photograph (scripts/portrait-prepare.mjs).
export const LID_TONE = {
  left: 'linear-gradient(180deg, #6b3d2e 0%, #b87362 55%, #a56555 100%)',
  right: 'linear-gradient(180deg, #683c2e 0%, #b66f61 55%, #a36252 100%)',
};
