// Ocean — shoreline-to-underwater cross section for DocuType.
// Fine graphite wave contours fill the surface third, sweeping currents carry
// the midwater, and a reef shelf with a submerged stone arch closes the bottom.
// A dotted dive route ties the surface entry dinghy to the arch passage.

const INK = '#29271f';
const WATER = '#5e7b80';
const OLIVE = '#6f7952';
const SAND = '#a38e66';
const PAPER = '#f4efdf';

export default function drawTerrain(api) {
  const { line, curve, shape, inkShape, ring, hatch, grass, cloud, sun, bird, rock, random } = api;

  // Catmull-Rom smoothing so dotted routes and drift ribbons stay watery.
  function smooth(pts, step = 1) {
    const out = [];
    const cr = (a, b, c, d, t) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t ** 3);
    const at = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      const seg = Math.max(3, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (let j = 0; j < seg; j++) out.push([cr(p0[0], p1[0], p2[0], p3[0], j / seg), cr(p0[1], p1[1], p2[1], p3[1], j / seg)]);
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }

  function stone(x, y, r, z) {
    inkShape([[x - r, y - r * .2], [x - r * .7, y + r * .55], [x + r * .05, y + r * .8], [x + r * .8, y + r * .4], [x + r * .95, y - r * .2], [x + r * .3, y - r * .6], [x - r * .45, y - r * .55]], PAPER, 1, z);
    line([[x - r * .7, y + r * .55], [x + r * .1, y + r * .15], [x + r * .8, y + r * .4]], INK, .28, z + .1);
  }

  function current(pts, color, op, z) {
    const s = smooth(pts, 1.4);
    line(s, color, op, z);
    for (let j = 6; j < s.length - 6; j += 9 + j % 5) {
      const [px, py] = s[j], [qx, qy] = s[j + 1];
      const dx = qx - px, dy = qy - py, l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l;
      line([[px + nx * .7, py + ny * .7], [px + nx * .7 + dx * 1.7, py + ny * .7 + dy * 1.7]], color, op * .75, z);
    }
  }

  function fish(x, y, s, dir, color, op, z) {
    const f = dir; // 1 = nose to the right
    curve([[x + f * 2.7 * s, y], [x + f * 1.1 * s, y + .95 * s], [x - f * .9 * s, y + .8 * s], [x - f * 2.1 * s, y + .1 * s], [x - f * 2.1 * s, y], [x - f * 1.4 * s, y - .75 * s], [x + f * .6 * s, y - .85 * s], [x + f * 2.7 * s, y]], color, op, z);
    line([[x - f * 2.1 * s, y + .1 * s], [x - f * 3.4 * s, y + 1.05 * s], [x - f * 2.75 * s, y], [x - f * 3.4 * s, y - .95 * s], [x - f * 2.1 * s, y - .1 * s]], color, op, z);
    line([[x + f * .2 * s, y + .95 * s], [x + f * .9 * s, y + 1.35 * s], [x + f * 1.5 * s, y + .8 * s]], color, op * .8, z);
    ring(x + f * 2.05 * s, y + .25 * s, .16 * s, color, Math.min(1, op * 1.6), z);
  }

  // A little ><(((°> drawn stroke by stroke, echoing the ASCII legend.
  function glyphFish(x, y, s, color, op, z, dir = 1) {
    const f = dir;
    line([[x - f * 3.6 * s, y + 1.2 * s], [x - f * 1.9 * s, y - .1 * s]], color, op, z);
    line([[x - f * 3.6 * s, y - 1.2 * s], [x - f * 1.9 * s, y + .5 * s]], color, op, z);
    for (let k = 0; k < 3; k++) {
      const r = (1.55 - k * .3) * s;
      const cx = x - f * .2 * s - k * f * .2 * s;
      const pts = Array.from({ length: 14 }, (_, i) => {
        const a = Math.PI / 3 + i / 13 * Math.PI * 4 / 3;
        return [cx + Math.cos(a) * r, y + Math.sin(a) * r * .8];
      });
      line(pts, color, op, z);
    }
    ring(x + f * 1.55 * s, y + .35 * s, .16 * s, color, op, z);
    line([[x + f * 1.1 * s, y + .8 * s], [x + f * 2.5 * s, y + .05 * s], [x + f * 1.35 * s, y - .75 * s]], color, op, z);
  }

  function bubbles(x, y0, n, z = 1.6, op = .38) {
    for (let i = 0; i < n; i++) {
      const y = y0 + i * (1.9 + random() * 1.2);
      const xx = x + Math.sin(i * 1.9 + x) * .7;
      const r = .16 + random() * .4 + i * .03;
      ring(xx, y, r, INK, op, z);
      if (random() > .68) ring(xx + .1, y + .08, r * 1.5, INK, op * .45, z);
    }
  }

  function coralFan(x, y, h, lean = .15, z = 2.8) {
    curve([[x, y], [x - lean * h * .25, y + h * .45], [x + lean * h * .3, y + h * .8], [x + lean * h, y + h]], INK, .75, z);
    const arms = [[x, y + h * .38, -1, h * .34], [x + lean * h * .2, y + h * .58, 1, h * .26], [x + lean * h * .32, y + h * .74, -1, h * .2]];
    arms.forEach(([ax, ay, side, len]) => {
      const tip = [ax + side * len * .7 + lean * len * .3, ay + len];
      curve([[ax, ay], [ax + side * len * .4, ay + len * .45], tip], OLIVE, .8, z);
      ring(tip[0], tip[1], .14, INK, .6, z);
    });
    ring(x + lean * h, y + h, .16, INK, .6, z);
  }

  function seaFan(x, y, h, z = 2.8) {
    curve([[x, y], [x, y + h * .18]], INK, .7, z);
    const tips = [];
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (.5 + (i - 3) / 3 * .42);
      const tx = x + Math.cos(a) * h, ty = y + Math.sin(a) * h;
      curve([[x, y], [x + Math.cos(a) * h * .5, y + Math.sin(a) * h * .6 + h * .05], [tx, ty]], i % 2 ? OLIVE : INK, i % 2 ? .5 : .45, z);
      tips.push([tx, ty]);
    }
    [.58, .82].forEach(fs => line(tips.map(([tx, ty]) => [x + (tx - x) * fs, y + (ty - y) * fs]), OLIVE, .38, z));
    line([...tips], OLIVE, .5, z);
    ring(x, y, .3, INK, .7, z);
  }

  function anemone(x, y, s, z = 2.9) {
    stone(x, y + .2, s * .55, z - .1);
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (.12 + i / 8 * .76);
      const dx = Math.cos(a), dy = Math.sin(a);
      curve([[x, y + s * .2], [x + dx * s * .7, y + s * .25 + dy * s * .8], [x + dx * s * 1.2, y + s * .1 + dy * s * 1.5]], INK, .55, z);
    }
  }

  function seaweed(x, y, h, z = 2.8, sway = 2.6) {
    for (let b = 0; b < 3; b++) {
      const x0 = x + (b - 1) * 1.7, hh = h * (.72 + b * .19);
      const pts = smooth([[x0, y], [x0 - sway * .5, y + hh * .3], [x0 + sway * .7, y + hh * .62], [x0 - sway * .25, y + hh * .86], [x0 - 1.1 * (b - 1), y + hh]], .9);
      line(pts, OLIVE, .6, z);
      for (let j = 3; j < pts.length - 3; j += 4) {
        const [px, py] = pts[j], [qx, qy] = pts[j + 1];
        const dx = qx - px, dy = qy - py, l = Math.hypot(dx, dy) || 1;
        const nx = -dy / l, ny = dx / l, s = (1 + Math.sin(j * 2.3)) * .55;
        line([[px, py], [px + nx * s, py + ny * s]], OLIVE, .42, z);
        line([[px, py], [px - nx * s, py - ny * s]], OLIVE, .34, z);
      }
    }
  }

  function starfish(x, y, r, z = 2.9) {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const rr = i % 2 ? r * .42 : r;
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
    });
    line([...pts, pts[0]], INK, .7, z);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      line([[x + Math.cos(a) * r * .4, y + Math.sin(a) * r * .4], [x + Math.cos(a) * r * .85, y + Math.sin(a) * r * .85]], INK, .3, z);
    }
  }

  function shell(x, y, s, z = 2.9) {
    const arc = Array.from({ length: 13 }, (_, i) => {
      const a = Math.PI * (.12 + i / 12 * .76);
      return [x + Math.cos(a) * s, y + Math.sin(a) * s];
    });
    line([arc[0], [x, y - s * .1], arc[12]], INK, .6, z);
    line(arc, INK, .6, z);
    for (let i = 1; i < 5; i++) {
      const a = Math.PI * (.12 + i / 5 * .76);
      line([[x, y - s * .1], [x + Math.cos(a) * s * .92, y + Math.sin(a) * s * .92]], INK, .3, z);
    }
  }

  // ---- sky and the open surface third ------------------------------------
  sun(30, 30, 3);
  cloud(-14, 30.5, .5);
  bird(-5.4, 32, .55); bird(-1.4, 30.2, .4);

  // Fine repeating contour lines, deeper and stronger near the cut.
  for (let r = 0; r < 10; r++) {
    const y0 = 26.6 - r * 1.3;
    const amp = .5 + r * .1;
    const wl = 7 - r * .12;
    const ph = r * 1.7;
    const pts = [];
    for (let x = -45; x <= 45; x += 1.2) {
      pts.push([x, Math.min(34, y0 + Math.sin(x / wl + ph) * amp + Math.sin(x / (wl * 2.6) + ph * 2.2) * amp * .22)]);
    }
    line(pts, INK, .13 + r * .026, -1.8);
    if (r > 3) {
      const cx = -18 + (r * 71) % 56 + random() * 3;
      const yC = y0 + Math.sin(cx / wl + ph) * amp;
      curve([[cx - 1.3, yC + .15], [cx - .4, yC + .95], [cx + .55, yC + .65], [cx + .15, yC + .05]], INK, .28, -1.8);
    }
  }

  // The cross-section cut where the sea opens downward.
  const cut = [];
  for (let x = -45; x <= 45; x += 1.2) {
    cut.push([x, 13.2 + Math.sin(x / 5.5 + .6) * .95 + Math.sin(x / 13 + 2) * .5]);
  }
  line(cut, INK, .75, .6);
  line(cut.map(([x, y]) => [x, y - 1.6]), INK, .38, .5);
  line(cut.map(([x, y]) => [x, y - 3.1]), WATER, .2, .4);
  [8, 15.5, 22.5].forEach(x => {
    line([[x, 14.6 + Math.sin(x / 5.5 + .6) * .95], [x + 2.4, 14.2 + Math.sin((x + 2.4) / 5.5 + .6) * .95]], INK, .5, .7);
    line([[x, 13.9 + Math.sin(x / 5.5 + .6) * .95], [x + 2.4, 13.6 + Math.sin((x + 2.4) / 5.5 + .6) * .95]], INK, .3, .7);
  });

  // Shoreline headland on the left, from the waterline up.
  inkShape([[-45, 12.4], [-43.5, 14.6], [-40, 16], [-37, 14.9], [-35, 17], [-32.5, 19], [-31, 22], [-28.5, 25], [-26.5, 27.4], [-29.5, 29], [-33.5, 28.6], [-37.5, 29.6], [-41, 28.2], [-45, 28.8]], PAPER, 1, .5);
  for (let s = 0; s < 4; s++) curve([[-45, 16 + s * 3.4], [-40, 15.2 + s * 3.3], [-34, 17.8 + s * 3.1], [-29, 20.5 + s * 2.7]], INK, .18, .6);
  hatch([-42.5, 14.4], [-29.5, 26.4], 16, -1, INK, .12);
  grass(-40.2, 28.7, .6); grass(-36.6, 29.5, .7); grass(-32.9, 28.8, .55);
  curve([[-38.5, 12.4], [-36.5, 11.4], [-34.6, 12.3]], INK, .35, .7);
  curve([[-31.6, 12], [-30, 11.2], [-28.2, 11.9]], WATER, .4, .7);
  rock(-24.6, 12.1, 1.7); rock(-28.2, 11.4, 1.1);

  // Entry dinghy with the dive flag up, riding the cut.
  inkShape([[-19.2, 13.9], [-16.4, 11.5], [-8.6, 11.5], [-6.6, 12.9], [-5.2, 13.8]], PAPER, 1, 2.4);
  line([[-19.2, 13.9], [-5.2, 13.8]], INK, .3, 2.5);
  line([[-14.8, 11.9], [-14.2, 13.5]], INK, .45, 2.5);
  line([[-11.2, 11.9], [-10.8, 13.5]], INK, .45, 2.5);
  line([[-19, 13.4], [-22.6, 12.2]], INK, .55, 2.2);
  line([[-23.5, 11.9], [-21.7, 12.5]], INK, .55, 2.2);
  line([[-6, 13.1], [-2.6, 12.4]], INK, .55, 2.2);
  line([[-7.8, 11.5], [-7.8, 17.3]], INK, .8, 2.5);
  inkShape([[-7.6, 17.4], [-1.7, 17], [-2, 14.8], [-7.9, 15.2]], PAPER, 1, 2.6);
  line([[-7.8, 15.4], [-1.9, 17.2]], INK, .7, 2.7);
  curve([[-17.4, 10.6], [-16.4, 10], [-15.3, 10.6]], WATER, .45, 1.8);
  curve([[-10.4, 10.4], [-9.4, 9.8], [-8.3, 10.4]], WATER, .45, 1.8);

  // ---- underwater depth --------------------------------------------------
  for (let i = 0; i < 4; i++) {
    const x = 18 + i * 7;
    line([[x, 12.4], [x - (13 + i * 3.2), -(7 + i * 3.4)]], INK, .07, -2.5);
    line([[x + 2.2, 12.4], [x + 2.2 - (13.5 + i * 3), -(8.5 + i * 3.2)]], INK, .05, -2.55);
  }

  current([[-45, 9], [-22, 2], [2, -8], [22, -16], [45, -24.5]], WATER, .18, -1.2);
  current([[-45, 6.5], [-28, 4.2], [-10, 6.8], [10, 4.4], [28, 6.2], [45, 4.6]], WATER, .3, -1.6);
  current([[-45, -.5], [-24, 1.4], [-4, -2], [16, .8], [36, -1.6], [45, -.6]], WATER, .42, -.4);
  current([[-45, -2.2], [-26, -.4], [-7, -3.4], [13, -1], [33, -3.4], [45, -2.4]], INK, .16, -.3);
  current([[-45, -8.5], [-30, -6.8], [-13, -10], [4, -7.6], [20, -10.5], [36, -8.4], [45, -9.8]], WATER, .5, .8);
  current([[-45, -10.6], [-28, -8.6], [-11, -12], [7, -9.4], [24, -12.6], [40, -10.2], [45, -11.6]], INK, .18, .9);
  current([[-45, -16.5], [-28, -14.8], [-9, -18], [10, -14.6], [27, -18], [44, -15.6]], WATER, .5, 1.9);

  // Distant reef shelf behind the main one.
  const far = [];
  for (let x = -45; x <= 45; x += 2) far.push([x, -21.8 + Math.sin(x / 4.8 + 1) * 1.1]);
  line(far, INK, .22, -1);
  for (let i = 0; i < 9; i++) {
    const x = -40 + i * 9.5 + random() * 3;
    curve([[x, -22 + Math.sin(x / 4.8 + 1) * 1.1], [x - .8, -20.4], [x + .3, -19.2]], INK, .18, -1);
    curve([[x + .9, -22.3], [x + 1.7, -20.8], [x + .9, -19.8]], INK, .16, -1);
  }

  // Main seabed dune with sand tint, ripples and shifting speckle.
  const bed = [[-45, -23.4], [-36, -24.8], [-27, -23], [-17, -25.6], [-6, -23.4], [3, -25.8], [11, -27], [20, -24.2], [28, -26.4], [36, -25], [45, -27]];
  curve(bed, INK, .6, 1);
  shape([...bed, [45, -33.5], [-45, -33.5]], SAND, .1, .55);
  for (let k = 0; k < 3; k++) {
    const rip = bed.map(([x, y]) => [x * .92, y - 1.8 - k * 1.7 + Math.sin(x / 3.1 + k) * .4]);
    curve(rip, INK, .15, .9);
  }
  for (let i = 0; i < 46; i++) {
    const x = -43 + random() * 86, y = -25.6 - random() * 5.6, l = 1 + random() * 1.6;
    line([[x, y], [x + l, y + .2 - random() * .5]], INK, .13, 1.05);
  }
  [[-20.8, -27], [10.2, -28.6], [-2.4, -26], [31.4, -27.6]].forEach(([x, y]) => {
    curve([[x - .9, y], [x, y + .4], [x + .9, y]], INK, .35, 1.05);
  });

  // Submerged stone arch over the middle of the route.
  inkShape([[1.2, -25], [2.2, -14], [4.6, -8.6], [9, -6], [14.5, -5.2], [20, -5.4], [24.5, -7], [27.6, -11], [29.6, -17.4], [30.6, -25], [26.4, -25], [25.2, -16.2], [23.6, -11.2], [20, -8.2], [14.8, -7.6], [10, -8.2], [6.8, -11], [5.2, -16.6], [4.4, -25]], PAPER, 1, 1.2);
  line([[1.2, -25], [2.2, -14], [4.6, -8.6], [9, -6], [14.5, -5.2], [20, -5.4], [24.5, -7], [27.6, -11], [29.6, -17.4], [30.6, -25]], INK, .3, 1.35);
  line([[26.4, -25], [25.2, -16.2], [23.6, -11.2], [20, -8.2], [14.8, -7.6], [10, -8.2], [6.8, -11], [5.2, -16.6], [4.4, -25]], INK, .45, 1.4);
  curve([[5.8, -10.5], [10, -7.4], [14.8, -6.6], [19.4, -6.8], [24, -8]], INK, .3, 1.4);
  curve([[6.8, -13.2], [11, -9.3], [15, -8.8], [19.6, -9], [23.4, -10.4]], INK, .18, 1.38);
  [[2.8, -13.5, 5.6, -13.9], [2.2, -17.5, 5.2, -17.7], [2.6, -21.5, 5.6, -21.5], [12, -5.9, 11.6, -8.1], [17, -6, 17.4, -8.2], [28.6, -18, 25.8, -18.1], [29.4, -21.5, 26.3, -21.5]].forEach(([a, b, c, d]) => line([[a, b], [c, d]], INK, .25, 1.4));
  hatch([2.4, -23.5], [4.4, -12], 9, -.6, INK, .15);
  hatch([29.4, -23.5], [26.6, -13], 9, .6, INK, .15);
  stone(2.4, -27.4, 3.3, 2.4); stone(29.6, -27.8, 3.7, 2.4);
  stone(6.8, -28.3, 2.2, 2.5); stone(24.8, -28.6, 2.6, 2.5);
  stone(-.6, -27.6, 1.6, 2.5); stone(33.2, -26, 1.6, 2.5);

  // Dotted dive route: dinghy rail to the arch passage station.
  const route = smooth([[-12.5, 11], [-14, 5.5], [-9.5, .5], [-3, -5.5], [2, -11.5], [8, -16.5], [14, -21.5], [20, -23.6], [24.6, -23.8]], 1.1);
  line(route, WATER, .16, 2.2);
  let acc = 0, flip = 0, prev0 = route[0];
  let px = prev0[0], py = prev0[1];
  for (let i = 1; i < route.length; i++) {
    const [x0, y0] = route[i];
    acc += Math.hypot(x0 - px, y0 - py);
    if (acc > 4.4) {
      acc = 0;
      const dx = x0 - px, dy = y0 - py, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
      if (flip++ % 2) line([[x0 - ux * 1.15, y0 - uy * 1.15], [x0 + ux * 1.15, y0 + uy * 1.15]], INK, .8, 2.3);
      else { ring(x0, y0, .42, INK, .8, 2.3); ring(x0, y0, .74, WATER, .3, 2.25); }
    }
    px = x0; py = y0;
  }
  ring(24.6, -23.8, .9, INK, .8, 2.4);
  ring(24.6, -23.8, 1.35, WATER, .35, 2.35);

  // Fish schools and ASCII-caret cousins drifting the layers.
  fish(-30.5, -3.2, 1.15, 1, INK, .55, -1); fish(-27.6, -2.3, .9, 1, INK, .55, -1);
  fish(-32.8, -1.9, 1, 1, INK, .55, -1); fish(-26.1, -4.4, .75, 1, INK, .55, -1);
  fish(-29.8, -5.2, .65, 1, INK, .55, -1); fish(-25, -1.2, .7, 1, INK, .55, -1);
  fish(-19, -16.5, .75, 1, WATER, .32, -2.2); fish(-16.3, -15.6, .6, 1, WATER, .32, -2.2);
  fish(-21.5, -15.2, .55, 1, WATER, .32, -2.2);
  fish(37.8, -3.2, 1.05, -1, INK, .5, 1.6); fish(40.6, -2.4, .85, -1, INK, .5, 1.6);
  fish(35.9, -1.8, .7, -1, INK, .5, 1.6); fish(39.4, -6, .6, -1, INK, .5, 1.6);
  glyphFish(37.5, 6.5, 1.2, INK, .5, 1.6);
  glyphFish(-9.5, -13, 1, WATER, .5, 1.5);
  glyphFish(-16.8, -6.2, .7, WATER, .4, 1.4);

  bubbles(-14.6, 9.6, 5, 1.8);
  bubbles(-1.4, -7.5, 6, 1.7);
  bubbles(23.6, -21.8, 5, 1.8);
  bubbles(37.6, -16.2, 4, 2.8);
  [[-26, -8], [9, -2], [18.6, -12.6], [-36, -5.4], [42, -6]].forEach(([x, y]) => {
    ring(x, y, .22, INK, .3, 1.5);
    ring(x + .5, y + .7, .3, INK, .3, 1.5);
  });

  // Reef shelf along the bottom edges.
  coralFan(-39.5, -23.2, 12.5, -.12, 2.8); coralFan(-33.8, -24.4, 9, .2, 2.9);
  seaweed(-31.5, -24, 13, 2.7, 2.4); seaFan(-36.4, -23.6, 7, 2.8);
  anemone(-29.2, -24.2, .9, 2.9); shell(-24.9, -24, .9, 2.9);
  stone(-27.4, -26.4, 2, 2.9);
  coralFan(32.2, -24.6, 13.5, .1, 2.8); coralFan(38.4, -23.8, 10.5, -.15, 2.9);
  seaweed(35.4, -24.2, 15, 3.1, 3); seaFan(37.6, -24.2, 6.5, 2.8);
  anemone(27.5, -25.6, .8, 2.9); shell(-5.8, -24.6, .8, 2.8);
  starfish(6.8, -26.2, .95, 2.9); starfish(-15.2, -25.6, .75, 2.8);
  coralFan(-10.5, -26.4, 6.5, .1, 2.8);
  seaweed(-42, -26.6, 19, 3.4, 3.4);
  seaweed(43.2, -26.4, 16, 3.4, -2.8);
}
