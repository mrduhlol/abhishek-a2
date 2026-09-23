// Portrait pipeline for the living-portrait hero.
//  - Chroma-keys the orange studio backdrop (flood-fill from borders, so
//    orange rim light inside the hair is preserved)
//  - Keys the backdrop visible through the glasses lenses (bounded to the
//    lens rects so hair highlights are never touched)
//  - Erodes 1px + feathers alpha, desaturates fringe (despill)
//  - Writes optimized WebP (+ PNG fallback) to public/
//  - Prints median skin tones for the blink-lid gradient
//  - Writes calibration overlays + dark-bg preview to --out-dir (default Temp)
//
// Usage: node scripts/portrait-cutout.mjs [--out-dir <dir>]
// Re-runnable: tune PARAMS below and re-run.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.PORTRAIT_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'assets-src', 'portrait-source.png');
const args = process.argv.slice(2);
const outDirIdx = args.indexOf('--out-dir');
const OUT_DIR = outDirIdx >= 0 ? args[outDirIdx + 1] : join(process.env.TEMP || '/tmp', 'portrait-work');
mkdirSync(OUT_DIR, { recursive: true });

// ---- tunable params ----
// Tight orange: the studio backdrop has b<=6 and r-g>=109 everywhere sampled,
// while skin/hair/rim-light always exceed b>30 or fall below r-g<95.
const FLOOD = { rMin: 140, gMin: 40, gMax: 200, bMax: 30, rgMin: 95, satMin: 120 };
const ERODE_PX = 2;
const FEATHER_SIGMA = 1.2;
const OUT_W = 1024;
// Eye (pupil) centers as fractions of source, calibrated from 3x lens crops
const EYES = { left: { x: 0.452, y: 0.318 }, right: { x: 0.58, y: 0.318 } };
// Eye patch size as fractions of source dims (opening ~0.031 x 0.023 + margin)
const EYE_PATCH = { w: 0.078, h: 0.08 };

const isOrange = (r, g, b, t) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return r >= t.rMin && g >= t.gMin && g <= t.gMax && b <= t.bMax && r - g >= t.rgMin && mx - mn >= t.satMin;
};

const meta = await sharp(SRC).metadata();
const W = meta.width, H = meta.height;
const { data, info } = await sharp(SRC).toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
const N = W * H;
const ch = info.channels;

// 1. classify loose-orange
const loose = new Uint8Array(N);
for (let i = 0, p = 0; i < N; i++, p += ch) {
  if (isOrange(data[p], data[p + 1], data[p + 2], FLOOD)) loose[i] = 1;
}

// 2. flood fill from borders through loose-orange
const filled = new Uint8Array(N);
const stack = [];
for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
while (stack.length) {
  const i = stack.pop();
  if (filled[i] || !loose[i]) continue;
  filled[i] = 1;
  const x = i % W, y = (i / W) | 0;
  if (x > 0) stack.push(i - 1);
  if (x < W - 1) stack.push(i + 1);
  if (y > 0) stack.push(i - W);
  if (y < H - 1) stack.push(i + W);
}

// 3. keep map: drop only flood-filled (border-connected) backdrop.
// NOTE: the glasses lenses are clear glass — skin/eyes show through them,
// so lens interiors are subject and must never be keyed.
const keep = new Uint8Array(N);
for (let i = 0; i < N; i++) keep[i] = filled[i] ? 0 : 1;

// 4. erode 1px (drop kept pixels touching removed ones)
for (let e = 0; e < ERODE_PX; e++) {
  const drop = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!keep[i]) continue;
      let touch = false;
      for (let dy = -1; dy <= 1 && !touch; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || !keep[ny * W + nx]) { touch = true; break; }
        }
      }
      if (touch) drop.push(i);
    }
  }
  for (const i of drop) keep[i] = 0;
}

// 5. despill: partially desaturate kept edge pixels near removed ones
const out = Buffer.from(data);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!keep[i]) continue;
    let edge = false;
    outer: for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !keep[ny * W + nx]) { edge = true; break outer; }
      }
    }
    if (!edge) continue;
    const p = i * ch;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const k = 0.55; // pull 55% toward luminance on fringe
    out[p] = lum + (r - lum) * (1 - k);
    out[p + 1] = lum + (g - lum) * (1 - k);
    out[p + 2] = lum + (b - lum) * (1 - k);
  }
}

// 6. alpha mask -> blur -> apply
const maskRaw = Buffer.alloc(N);
for (let i = 0; i < N; i++) maskRaw[i] = keep[i] ? 255 : 0;
const maskBlurredRaw = await sharp(maskRaw, { raw: { width: W, height: H, channels: 1 } })
  .blur(FEATHER_SIGMA)
  .raw()
  .toBuffer();
// NOTE: sharp's blur can expand grayscale to multi-channel; stride back to 1ch.
const maskStride = maskBlurredRaw.length / N;
const maskBlurred = Buffer.alloc(N);
for (let i = 0; i < N; i++) maskBlurred[i] = maskBlurredRaw[i * maskStride];
const rgba = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  rgba[i * 4] = out[i * ch];
  rgba[i * 4 + 1] = out[i * ch + 1];
  rgba[i * 4 + 2] = out[i * ch + 2];
  rgba[i * 4 + 3] = maskBlurred[i];
}
const cutout = sharp(rgba, { raw: { width: W, height: H, channels: 4 } });

// 7. web outputs
const resized = cutout.clone().resize({ width: OUT_W });
await resized.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(join(ROOT, 'public', 'portrait-cutout.webp'));
await resized.clone().png({ compressionLevel: 9 }).toFile(join(ROOT, 'public', 'portrait-cutout.png'));
console.log('wrote public/portrait-cutout.webp + .png');

// 8. calibration overlay (eye markers) + dark preview
const svg = `<svg width="${W}" height="${H}">
${[EYES.left, EYES.right].map((e) => `
  <circle cx="${e.x * W}" cy="${e.y * H}" r="26" fill="none" stroke="red" stroke-width="3"/>
  <line x1="${e.x * W - 40}" y1="${e.y * H}" x2="${e.x * W + 40}" y2="${e.y * H}" stroke="red" stroke-width="2"/>
  <line x1="${e.x * W}" y1="${e.y * H - 40}" x2="${e.x * W}" y2="${e.y * H + 40}" stroke="red" stroke-width="2"/>`).join('')}
</svg>`;
await sharp(SRC).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toFile(join(OUT_DIR, 'eyes-check.png'));
const nw = 1024, nh = Math.round((H / W) * nw);
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .resize({ width: nw })
  .flatten({ background: '#08090C' })
  .png().toFile(join(OUT_DIR, 'preview-dark.png'));
console.log('wrote eyes-check.png + preview-dark.png to', OUT_DIR);

// 9. skin tone medians
const sample = (fx, fy, fw, fh) => {
  const vals = [];
  const x0 = Math.round((fx - fw / 2) * W), x1 = Math.round((fx + fw / 2) * W);
  const y0 = Math.round((fy - fh / 2) * H), y1 = Math.round((fy + fh / 2) * H);
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
    const i = y * W + x, p = i * ch;
    vals.push([data[p], data[p + 1], data[p + 2]]);
  }
  const med = (k) => vals.map((v) => v[k]).sort((a, b) => a - b)[vals.length >> 1];
  const [r, g, b] = [med(0), med(1), med(2)];
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
};
console.log('skin under-left-eye :', sample(EYES.left.x, EYES.left.y + 0.045, 0.03, 0.02));
console.log('skin under-right-eye:', sample(EYES.right.x, EYES.right.y + 0.045, 0.03, 0.02));
console.log('skin forehead       :', sample(0.52, 0.235, 0.05, 0.035));
console.log('eye patch fractions :', JSON.stringify(EYE_PATCH));
