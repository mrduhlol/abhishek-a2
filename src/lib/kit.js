// kit.js — tiny helpers shared by the ASCII-art scenes.
// The scene modules were written against a shared kit; this repo ships the
// subset they need. camel-caravan-dusk uses clamp/lerp/KEYS; fbm and noise2
// are imported for parity with the original kit and go unused in this scene.

export const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a, b, t) => a + (b - a) * t;

// hash-based value noise + fractal sum (kept for kit parity)
const hash2 = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

export const noise2 = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(
    lerp(hash2(xi, yi), hash2(xi + 1, yi), u),
    lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u),
    v,
  );
};

export const fbm = (x, y, octaves = 4) => {
  let sum = 0, amp = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * f, y * f) * amp;
    f *= 2;
    amp *= 0.5;
  }
  return sum;
};

// one stable character per palette entry; the renderer maps each cell's
// colour character back to its palette index (45 palette colours here,
// so well past 45 distinct characters)
export const KEYS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+*/-=~#%&@$<>?!";
