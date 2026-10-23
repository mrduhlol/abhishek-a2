const INK = '#29271f';
const PAPER = '#f4efdf';
const OLIVE = '#526a48';

// An open glade, framed by two old trees. All detail uses the shared batched
// drawing primitives, so the fine bark and fern strokes remain inexpensive.
export default function drawTerrain(api) {
  const { line, curve, shape, inkShape, ring, random } = api;

  const rounded = (points, amount = .18) => points.flatMap((point, index) => {
    const prev = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    const a = point.map((value, axis) => value + (prev[axis] - value) * amount);
    const b = point.map((value, axis) => value + (next[axis] - value) * amount);
    return Array.from({ length: 5 }, (_, n) => {
      const t = n / 4;
      return point.map((value, axis) => (1 - t) ** 2 * a[axis] + 2 * (1 - t) * t * value + t ** 2 * b[axis]);
    });
  });

  const leaf = (x, y, s, angle = 0, z = 1) => {
    const c = Math.cos(angle), sn = Math.sin(angle);
    const points = [[0, 0], [-s * .38, s * .6], [0, s * 1.5], [s * .35, s * .65]]
      .map(([a, b]) => [x + a * c - b * sn, y + a * sn + b * c]);
    shape(points, OLIVE, .17, z);
    line([...points, points[0]], OLIVE, .45, z + .02);
  };

  const fern = (x, y, s, direction = 1) => {
    for (let frond = 0; frond < 3; frond++) {
      const dx = direction * (frond - .5) * s * 1.7;
      const height = s * (4.5 - Math.abs(frond - 1));
      curve([[x, y], [x + dx * .35, y + height * .6], [x + dx, y + height]], OLIVE, .82, 3.1);
      for (let n = 1; n <= 6; n++) {
        const t = n / 7;
        const px = x + dx * t * t, py = y + height * t;
        const width = s * 1.25 * Math.sin(t * Math.PI);
        line([[px - width, py + s * .7], [px, py], [px + width, py + s * .55]], OLIVE, .65, 3.1);
      }
    }
  };

  // Mist-soft trunks recede into the clearing rather than filling its center.
  shape([[-43, -18], [-42, 9], [-33, 19], [-20, 14], [-12, -13]], OLIVE, .055, -4);
  shape([[14, -15], [20, 17], [32, 24], [43, 13], [44, -20]], OLIVE, .065, -4);
  const distantTrees = [[-42, 27, 1.1], [-23, 29, 1.3], [-17, 20, .8], [-11, 17, .7], [16, 22, .9], [22, 30, 1.2], [41, 30, 1]];
  distantTrees.forEach(([x, top, width], index) => {
    const bottom = -15 - index % 3;
    curve([[x - width, bottom], [x - width * .6, 4], [x - .4, top]], INK, .21, -3);
    curve([[x + width, bottom], [x + width * .5, 7], [x + .3, top]], INK, .18, -3);
    line([[x, top - 7], [x - 3, top - 3], [x - 4, top + 1]], INK, .18, -3);
    line([[x, top - 11], [x + 4, top - 5], [x + 5, top - 1]], OLIVE, .28, -3);
  });
  curve([[-43, -18], [-29, -15], [-14, -17], [-3, -12], [10, -14], [27, -16], [43, -18]], INK, .26, -2);
  curve([[-39, -20], [-29, -18], [-17, -20]], OLIVE, .36, -2);
  curve([[18, -19], [29, -17], [42, -21]], OLIVE, .4, -2);

  // The stream disappears into the glade and opens toward the reader.
  const stream = [[5, -8], [3, -14], [-5, -20], [-3, -25], [12, -34], [1, -34], [-10, -26], [-11, -21], [-3, -14], [3, -8]];
  shape(rounded(stream, .35), OLIVE, .08, -.8);
  curve([[3, -8], [-3, -14], [-11, -21], [-10, -26], [1, -34]], INK, .44, -.5);
  curve([[5, -8], [3, -14], [-5, -20], [-3, -25], [12, -34]], OLIVE, .62, -.5);
  [[-5, -19, 3], [-7, -23, 3.6], [-4, -27, 3], [3, -31, 4]].forEach(([x, y, w]) => {
    curve([[x - w / 2, y], [x, y + .25], [x + w / 2, y]], INK, .24, -.3);
    line([[x - w / 3, y - .8], [x + w / 4, y - .8]], OLIVE, .3, -.3);
  });

  const oldTree = (x, mirror, height) => {
    const p = (a, b) => [x + a * mirror, b];
    const outline = [[-6, -26], [-3.5, -23], [-2.8, -10], [-2, 9], [-6, 19], [-10, 25], [-9, 26], [-4, 23], [-.5, 16], [1, 24], [6, height], [7.5, height - .3], [3.5, 22], [3, 13], [8, 19], [14, 22], [14.5, 20.5], [9, 17], [4, 8], [4.5, -9], [5.5, -22], [9, -26], [3.5, -24], [1, -27], [-1, -24]];
    inkShape(rounded(outline.map(([a, b]) => p(a, b))), PAPER, 1, 1);
    shape([[1, -25], [2, -8], [1, 11], [3, 18], [3, 13], [8, 19], [10, 19.8], [5, 12], [4, 8], [4.5, -9], [5.5, -22], [9, -26], [3.5, -24]].map(([a, b]) => p(a, b)), OLIVE, .14, 1.04);
    curve([p(-1, -23), p(-.6, -9), p(-.8, 5), p(-2, 15)], INK, .5, 1.2);
    curve([p(2.8, -23), p(2, -9), p(2.6, 6), p(5, 13)], INK, .42, 1.2);
    curve([p(-2.5, -22), p(-2, -11), p(-2, -4)], INK, .3, 1.2);
    for (let n = 0; n < 19; n++) {
      const y = -21 + n * 1.9, a = -.2 + random() * 1.9;
      line([p(a, y), p(a + 1.3, y + 1.7)], INK, .24, 1.2);
      if (n % 3 === 0) line([p(-2.4, y), p(-1.5, y + 1.3)], INK, .22, 1.2);
    }
    // A long knot breaks the grain; thin root lines settle the trunk.
    curve([p(.2, -5), p(-.5, -2.5), p(.3, -.5), p(1.2, -2.5), p(.2, -5)], INK, .55, 1.3);
    curve([p(.3, -4), p(.1, -2.4), p(.4, -1.5)], INK, .35, 1.3);
    curve([p(-1, -24), p(-5, -27), p(-9, -27.5)], INK, .57, 1.2);
    curve([p(3, -23), p(7, -27), p(12, -28)], INK, .48, 1.2);
  };
  oldTree(-31, 1, 32);
  oldTree(32, -1, 33);

  // Irregular branch sprays make a leafy arch, leaving generous sky inside.
  const crown = (x, y, scale, mirror) => {
    const p = (a, b) => [x + a * scale * mirror, y + b * scale];
    const edge = [[-11, -2], [-12, 1], [-10, 4], [-7, 4.5], [-5, 6], [-1, 5], [2, 6], [5, 5], [8, 5.5], [11, 3], [12, 0]];
    shape(rounded([...edge, [10, -2], [6, -3], [3, -2], [-1, -3], [-5, -2], [-8, -3]].map(([a, b]) => p(a, b)), .3), OLIVE, .055, 1.4);
    curve([p(-9, -4), p(-4, -1), p(1, 0), p(7, -2), p(11, -1)], INK, .55, 1.5);
    curve([p(-3, -1), p(-5, 3), p(-8, 5)], INK, .45, 1.5);
    curve([p(2, 0), p(4, 4), p(9, 5)], INK, .45, 1.5);
    for (let n = 0; n < 13; n++) {
      const a = -9 + n * 1.65, b = Math.sin(n * 1.6) * 2 + 1;
      const [lx, ly] = p(a, b);
      leaf(lx, ly, scale * (.8 + random() * .5), (n % 2 ? -.9 : .65) * mirror, 1.6);
    }
    curve(edge.map(([a, b]) => p(a, b)), OLIVE, .46, 1.5);
    [[-8, -2], [-2, -2], [5, -2]].forEach(([a, b]) => {
      curve([p(a - 2, b), p(a, b - 1), p(a + 2, b + .2)], OLIVE, .36, 1.5);
    });
  };
  crown(-31, 26, 1, 1);
  crown(-18, 29, .68, 1);
  crown(33, 27, .95, -1);
  crown(21, 30, .62, -1);

  // Fine hanging vines echo the bridge's suspended curve.
  curve([[-21, 27], [-20, 17], [-16, 12], [-17, 6], [-19, 5]], OLIVE, .65, 1.8);
  curve([[23, 28], [21, 20], [19, 15], [20, 9]], OLIVE, .62, 1.8);
  leaf(-20, 20, 1.2, .8, 1.9);
  leaf(-17, 13, 1, -.7, 1.9);
  leaf(21, 21, 1.1, -.8, 1.9);
  leaf(19.5, 15, .9, .7, 1.9);

  // A sagging footbridge is the one strong horizontal through the clearing.
  const deck = x => -14 + 5 * (x / 25) ** 2;
  const upper = [], lower = [];
  for (let x = -25; x <= 25; x += 2.5) {
    upper.push([x, deck(x)]);
    lower.unshift([x, deck(x) - 1.2]);
  }
  inkShape([...upper, ...lower], PAPER, 1, 2.2);
  curve([[-28, 0], [-15, -4.2], [0, -6], [15, -3.8], [28, .6]], INK, .86, 2.6);
  curve([[-28, -1], [-15, -5.1], [0, -6.9], [15, -4.7], [28, -.4]], INK, .36, 2.6);
  for (let x = -24; x <= 24; x += 3) {
    const top = -6 + 6 * (x / 28) ** 2;
    line([[x, top], [x + .35, deck(x)]], INK, .53, 2.5);
    line([[x - .55, deck(x) - 1.15], [x + .5, deck(x) + .1]], INK, .67, 2.6);
  }
  [[-27, -.4], [27, .1]].forEach(([x, y]) => {
    ring(x, y, .7, INK, .7, 2.7);
    line([[x - 1, y - 1.5], [x + 1.1, y - 1]], INK, .55, 2.7);
  });

  // Sparse banks and crisp fern silhouettes, dense only at the near corners.
  curve([[-43, -28], [-34, -27], [-24, -29], [-14, -28]], INK, .58, 2.9);
  curve([[3, -27], [17, -25.5], [30, -27.5], [43, -26]], INK, .57, 2.9);
  [[-39, -28, 1.3, 1], [-25, -29, 1.05, -1], [26, -28, 1.25, 1], [39, -27, 1.05, -1], [16, -26, .65, -1]].forEach(args => fern(...args));
  for (let n = 0; n < 22; n++) {
    const x = -41 + random() * 82, y = -27 - random() * 4;
    if (x > -14 && x < 13) continue;
    line([[x, y], [x + 1.4 + random(), y + .2]], INK, .22, 3);
  }
  [[-18, -25], [12, -27], [20, -23]].forEach(([x, y]) => {
    curve([[x - 1.3, y], [x - .8, y + 1], [x + .5, y + 1.2], [x + 1.5, y]], INK, .5, 3);
    line([[x - .5, y + .8], [x + .6, y + .2]], INK, .25, 3);
  });
}
