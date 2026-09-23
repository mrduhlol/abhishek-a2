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
      open: { x: 0.45, y: 0.331, w: 0.052, h: 0.042 },
      iris: { x: 0.45, y: 0.333 },
    },
    right: {
      open: { x: 0.58, y: 0.331, w: 0.05, h: 0.04 },
      iris: { x: 0.58, y: 0.332 },
    },
  },

  // ---- tunables ----
  // Max pupil travel as a fraction of portrait width/height
  // (~4px / ~3px at 640px display width — noticeable yet believable)
  MAX_PUPIL_X: 0.006,
  MAX_PUPIL_Y: 0.0045,
  // Gaze easing per rAF tick (0..1, higher = snappier, never snaps)
  EYE_TRACKING_SMOOTHNESS: 0.16,
  // Cursor distance (px) at which the gaze reaches full deflection
  GAZE_FULL_DIST: 380,
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

// Lid gradients, sampled from the photograph (scripts/portrait-prepare.mjs).
export const LID_TONE = {
  left: 'linear-gradient(180deg, #5f382b 0%, #986353 55%, #8a5a48 100%)',
  right: 'linear-gradient(180deg, #5c372c 0%, #906253 55%, #845648 100%)',
};
