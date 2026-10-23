// Grassland — an open prairie drawn as continuous sketchbook pen work.
// Three rolling hill contours carry the horizon, a slow river folds down
// through the middle with stepping stones, windblown grass leans across the
// banks, and hedgerow field plots echo a contribution grid on the mid slopes
// without ever reading as a UI screenshot.

const INK = '#29271f';
const OLIVE = '#64723e';
const PAPER = '#f4efdf';
const WATER = '#5e7b80';

export default function drawTerrain(api) {
  const { line, curve, shape, inkShape, ring, cloud, sun, bird, rock, random } = api;

  // ---- quiet sky ---------------------------------------------------------
  sun(-30, 25, 4);
  cloud(15, 26, .62);
  cloud(39, 18, .42);
  bird(-9, 27, .6);
  bird(-4.6, 25, .42);

  // Far ridge: the windmill and a hedged horizon line live here.
  const far = [[-46, -2], [-36, 3], [-26, 6], [-16, 2.5], [-6, 5], [4, 2], [14, 5.5], [24, 7], [34, 4], [46, -2]];
  curve(far, INK, .34, -2.2);
  for (let i = 0; i < 16; i++) {
    const seg = i / 15 * (far.length - 1);
    const k = Math.min(far.length - 2, Math.floor(seg));
    const f = seg - k;
    const x = far[k][0] + (far[k + 1][0] - far[k][0]) * f;
    const y = far[k][1] + (far[k + 1][1] - far[k][1]) * f - .2;
    line([[x, y], [x + .1, y + .9 + random() * .8]], INK, .16, -2.2);
  }

  // A modest distant windmill turns nowhere; it only marks the slope.
  inkShape([[22.7, 7], [23.3, 14.6], [25.3, 14.6], [25.9, 7]], PAPER, 1, -2);
  line([[23.6, 7.4], [23.7, 14.4]], INK, .22, -1.9);
  line([[24.9, 7.4], [24.8, 14.4]], INK, .22, -1.9);
  inkShape([[23, 15.2], [24.3, 16.4], [25.6, 15.2]], PAPER, 1, -2);
  ring(24.3, 16.9, .45, INK, .7, -1.8);
  [[-.3, 4.6], [4.4, .8], [.4, -4.5], [-4.5, -.9]].forEach(([dx, dy]) => {
    line([[24.3, 16.9], [24.3 + dx, 16.9 + dy]], INK, .55, -1.8);
    line([[24.3 + dx * .35, 16.9 + dy * .35], [24.3 + dx * .8 - dy * .18, 16.9 + dy * .8 + dx * .18], [24.3 + dx, 16.9 + dy]], INK, .4, -1.8);
  });

  // Mid ridge with a soft olive field tint beneath it.
  const mid = [[-45, -10], [-34, -5], [-23, -2], [-12, -6], [-1, -3], [10, -6], [22, -2], [33, -5], [45, -9]];
  shape([...mid, [45, -27], [-45, -27]], OLIVE, .07, -1.4);
  curve(mid, INK, .5, -1);
  curve(mid.map(([x, y]) => [x, y - 1.7]), INK, .18, -1.1);

  // Near rolling contour closes the middle distance.
  curve([[-46, -17], [-34, -13], [-21, -15], [-8, -12], [6, -15], [20, -12], [33, -15], [46, -14]], INK, .42, -.2);

  // ---- hedgerow field plots: a contribution grid as crop geometry --------
  function fieldPatch(x0, y0, cols, rows, cell, skew, z) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = x0 + c * cell + r * skew;
        const cy = y0 - r * cell * .58;
        const w = cell * .84, h = cell * .46;
        const pts = [[cx, cy], [cx + w, cy + w * .12], [cx + w - h * .22, cy + h + w * .12], [cx - h * .22, cy + h]];
        const load = (r * 3 + c * 2 + (r & 1)) % 5;
        line([...pts, pts[0]], INK, .26, z);
        if (load > 2) shape(pts, OLIVE, .08 + load * .028, z - .04);
        if (load === 4) line([[cx + .3, cy + h * .5], [cx + w - .4, cy + h * .5 + w * .1]], OLIVE, .3, z + .02);
      }
    }
  }
  fieldPatch(13, -3.4, 7, 4, 3.15, .55, -.7);
  fieldPatch(-40, -7, 4, 3, 2.7, .35, -.7);

  // ---- the river, banks widening toward the viewer ----------------------
  const left = [[-8, -2], [-3, -7], [-9, -12], [-3, -17], [4, -23], [3, -29], [6, -35]];
  const right = [[-5, -2], [0, -7], [-6, -12], [0, -17], [9, -23], [10, -29], [14, -35]];
  const channel = left.map(([lx, ly], k) => [(lx + right[k][0]) / 2, (ly + right[k][1]) / 2]);
  shape([...left, ...right.slice().reverse()], PAPER, 1, .4);
  curve(left, WATER, .62, .5);
  curve(right, WATER, .62, .5);
  curve(left.map(([x, y]) => [x + .8, y - .4]), INK, .14, .45);
  curve(right.map(([x, y]) => [x - .8, y - .4]), INK, .14, .45);
  curve(channel, WATER, .22, .42);
  for (let i = 0; i < 9; i++) {
    const t = .1 + i / 9 * .84;
    const seg = t * (channel.length - 1);
    const k = Math.min(channel.length - 2, Math.floor(seg));
    const f = seg - k;
    const cx = channel[k][0] + (channel[k + 1][0] - channel[k][0]) * f;
    const cy = channel[k][1] + (channel[k + 1][1] - channel[k][1]) * f;
    const half = .9 + t * 1.5;
    line([[cx - half, cy], [cx + half, cy - .25]], WATER, .3, .55);
    if (i % 2) line([[cx - half * .5, cy - 1.3], [cx + half * .8, cy - 1.5]], WATER, .18, .55);
  }

  // Stepping stones cross where the channel narrows again.
  [[-.6, -19.8, 1.5], [1.2, -20.3, 1.3], [3, -20.6, 1.6], [4.8, -21, 1.2]].forEach(([x, y, r]) => {
    inkShape([[x - r, y - r * .3], [x - r * .6, y + r * .45], [x + r * .2, y + r * .6], [x + r, y + r * .15], [x + r * .7, y - r * .5], [x - r * .4, y - r * .55]], PAPER, 1, .9);
    line([[x - r * .6, y + r * .45], [x + r * .15, y], [x + r * .7, y - r * .5]], INK, .22, 1);
  });

  // ---- windblown grass --------------------------------------------------
  function tuft(x, y, s, z) {
    curve([[x - s, y], [x - s * .35, y + s * 1.1], [x + s * .3, y + s * 1.55]], OLIVE, .5, z);
    curve([[x, y], [x + s * .55, y + s * 1.25], [x + s * 1.15, y + s * 1.05]], OLIVE, .42, z);
    curve([[x + s * .25, y], [x + s * .8, y + s * .8], [x + s * 1.35, y + s * .5]], INK, .3, z);
  }
  // Rejection sample against the river so tufts stay on dry ground.
  const nearRiver = (x, y) => {
    let best = 1e9;
    for (let i = 0; i < channel.length - 1; i++) {
      const [ax, ay] = channel[i], [bx, by] = channel[i + 1];
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t));
    }
    return best < 5.2;
  };
  let placed = 0;
  for (let i = 0; i < 260 && placed < 64; i++) {
    const x = -43 + random() * 86;
    const y = -8 - random() * 26;
    if (nearRiver(x, y)) continue;
    const s = .4 + (-y - 8) / 26 * 1 + random() * .45;
    tuft(x, y, s, y > -18 ? -.5 : y > -26 ? .6 : 1.8);
    placed++;
  }

  // A small fence keeps the left hill honest.
  for (let i = 0; i < 6; i++) {
    const x = -40 + i * 2.7;
    line([[x, -16.6 + Math.sin(i) * .3], [x + .2, -14.4 + Math.sin(i) * .3]], INK, .6, 1.4);
  }
  curve([[-40, -15.4], [-36, -15.8], [-32, -15.2], [-27, -15.7]], INK, .5, 1.4);
  curve([[-40, -16.4], [-36, -16.8], [-32, -16.2], [-27, -16.7]], INK, .34, 1.4);

  // Grazing ticks on the far slopes, like commas in the margin.
  for (let i = 0; i < 14; i++) {
    const x = -40 + random() * 80;
    const y = -3.5 - random() * 6;
    if (nearRiver(x, y)) continue;
    line([[x, y], [x + .35, y + .55]], INK, .2, -.9);
  }

  // Near bank detail: rocks, ground speckle, and a last fringe of tufts.
  rock(-30, -23.5, 2.4);
  rock(27, -25.5, 2.9);
  rock(33, -26.5, 1.7);
  for (let i = 0; i < 30; i++) {
    const x = -43 + random() * 86, y = -29 - random() * 5;
    if (x > 0 && x < 16) continue;
    line([[x, y], [x + 1 + random() * 2.4, y + .15]], INK, .14, 2);
  }
  [[-38, -31], [-21, -33], [22, -32], [40, -30.5]].forEach(([x, y]) => {
    tuft(x, y, 1.5, 2.2);
    tuft(x + 2.4, y + .6, 1.1, 2.2);
  });
}
