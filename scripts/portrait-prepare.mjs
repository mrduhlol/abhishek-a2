// Dark-portrait pipeline for the reference-composition hero.
// The dark-navy studio backdrop already matches the page, so no keying —
// just optimized outputs, calibration overlays and tone sampling.
//
// Usage:
//   npm install --no-save sharp   (scratch dep, gitignored)
//   node scripts/portrait-prepare.mjs [--out-dir <dir>]
//
// Writes: public/portrait.webp + public/portrait.png (1024w)
// Prints: lid gradient tones + eye geometry sanity
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.PORTRAIT_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'assets-src', 'portrait-dark-source.png');
const args = process.argv.slice(2);
const outDirIdx = args.indexOf('--out-dir');
const OUT_DIR = outDirIdx >= 0 ? args[outDirIdx + 1] : join(process.env.TEMP || '/tmp', 'portrait-work');
mkdirSync(OUT_DIR, { recursive: true });

const OUT_W = 1024;
// Opening boxes + iris centers, calibrated from 3x lens crops (fractions).
// See eyes-check.png to verify; adjust here if the photo changes.
const EYES = {
  left: {
    open: { x: 0.45, y: 0.331, w: 0.052, h: 0.042 },
    iris: { x: 0.45, y: 0.333 },
  },
  right: {
    open: { x: 0.58, y: 0.331, w: 0.05, h: 0.04 },
    iris: { x: 0.58, y: 0.332 },
  },
};

const meta = await sharp(SRC).metadata();
const W = meta.width;
const H = meta.height;
console.log(`source: ${W}x${H}`);

// 1. optimized web outputs (no transparency needed — backdrop is the page)
const base = sharp(SRC).resize({ width: OUT_W });
await base.clone().webp({ quality: 84, effort: 6 }).toFile(join(ROOT, 'public', 'portrait.webp'));
await base.clone().png({ compressionLevel: 9 }).toFile(join(ROOT, 'public', 'portrait.png'));
console.log('wrote public/portrait.webp + portrait.png');

// 2. calibration overlay: opening boxes (cyan) + iris centers (red)
const svg =
  `<svg width="${W}" height="${H}">` +
  [EYES.left, EYES.right]
    .map(
      (e) => `
    <ellipse cx="${e.open.x * W}" cy="${e.open.y * H}" rx="${(e.open.w * W) / 2}" ry="${(e.open.h * H) / 2}"
      fill="none" stroke="cyan" stroke-width="2"/>
    <circle cx="${e.iris.x * W}" cy="${e.iris.y * H}" r="6" fill="none" stroke="red" stroke-width="2"/>
    <line x1="${e.iris.x * W - 14}" y1="${e.iris.y * H}" x2="${e.iris.x * W + 14}" y2="${e.iris.y * H}" stroke="red" stroke-width="1.5"/>
    <line x1="${e.iris.x * W}" y1="${e.iris.y * H - 14}" x2="${e.iris.x * W}" y2="${e.iris.y * H + 14}" stroke="red" stroke-width="1.5"/>`
    )
    .join('') +
  `</svg>`;
await sharp(SRC)
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .png()
  .toFile(join(OUT_DIR, 'eyes-check-dark.png'));
console.log('wrote eyes-check-dark.png to', OUT_DIR);

// 3. lid tone sampling (under-eye strips)
const { data, info } = await sharp(SRC).toColourspace('srgb').raw().toBuffer({ resolveWithObject: true });
const ch = info.channels;
const med = (fx, fy, fw, fh) => {
  const vals = [[], [], []];
  for (let y = Math.round((fy - fh / 2) * H); y < Math.round((fy + fh / 2) * H); y += 2)
    for (let x = Math.round((fx - fw / 2) * W); x < Math.round((fx + fw / 2) * W); x += 2) {
      const p = (y * W + x) * ch;
      vals[0].push(data[p]);
      vals[1].push(data[p + 1]);
      vals[2].push(data[p + 2]);
    }
  const m = (a) => a.sort((x, y) => x - y)[a.length >> 1];
  return '#' + [m(vals[0]), m(vals[1]), m(vals[2])].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
};
console.log('lid L :', med(0.45, 0.362, 0.02, 0.012));
console.log('lid R :', med(0.58, 0.362, 0.02, 0.012));
console.log('geometry:', JSON.stringify(EYES));
