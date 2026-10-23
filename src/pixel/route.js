export const SEGMENT = 120;
export const START_X = 12;
export const END_X = 826;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const chapterAtX = (x) => clamp(Math.floor(x / SEGMENT), 0, 6);
// Full-wave path joins at the same elevation at every biome boundary.
export const pathPixelY = (x) => 310 + 35 * Math.sin((x / 768) * Math.PI * 2);
const PATH_SAMPLES = [
  [0.52, 0.56, 0.53, 0.47, 0.52],
  [0.52, 0.6, 0.57, 0.49, 0.52],
  [0.52, 0.64, 0.58, 0.47, 0.52],
  [0.52, 0.61, 0.67, 0.55, 0.52],
  [0.52, 0.57, 0.52, 0.46, 0.52],
  [0.52, 0.58, 0.62, 0.49, 0.52],
  [0.52, 0.55, 0.55, 0.47, 0.52],
];
export const pathY = (x) => {
  const samples = PATH_SAMPLES[chapterAtX(x)];
  const local = clamp((x - chapterAtX(x) * SEGMENT) / SEGMENT) * 4;
  const index = Math.min(3, Math.floor(local)),
    t = local - index;
  const eased = t * t * (3 - 2 * t);
  return -80 * (samples[index] + (samples[index + 1] - samples[index]) * eased);
};
export const routeAt = (progress) => {
  const x = START_X + clamp(progress) * (END_X - START_X);
  return { x, y: pathY(x), z: 0 };
};
export const chapterAt = (progress) => chapterAtX(routeAt(progress).x);
export const projectProgress = (i) =>
  clamp((i * SEGMENT + 60 - START_X) / (END_X - START_X));
export const OBSTACLES = [0, 1, 2, 5, 6].flatMap((chapter) => [
  {
    id: `${chapter}-jump`,
    chapter,
    x: chapter * SEGMENT + 33,
    type: "jump",
    label: chapter === 5 ? "Crystal ridge" : "Fallen log",
  },
  {
    id: `${chapter}-crouch`,
    chapter,
    x: chapter * SEGMENT + 89,
    type: "crouch",
    label: chapter === 6 ? "Low stone arch" : "Low branches",
  },
]);
export function resolveTravel(
  from,
  to,
  { jump = 0, crouch = false, assisted = false } = {},
) {
  if (assisted) return { x: clamp(to, START_X, END_X), blocked: null };
  const direction = Math.sign(to - from);
  for (const obstacle of [...OBSTACLES].sort(
    (a, b) => direction * (a.x - b.x),
  )) {
    const edge = obstacle.x - direction * 2.8;
    if (
      direction * (edge - from) >= -0.01 &&
      direction * (to - edge) > 0 &&
      (obstacle.type === "jump" ? jump < 1 : crouch === false)
    )
      return { x: edge, blocked: obstacle };
  }
  return { x: clamp(to, START_X, END_X), blocked: null };
}
export const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
