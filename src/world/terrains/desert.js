const INK = '#29271f';
const PAPER = '#f4efdf';
const OCHRE = '#9c693d';

// Wind works the same few marks into long dunes, ripples, and worn sandstone.
export default function drawTerrain({ line, curve, shape, ring, random }) {
  const stroke = (points, opacity = .6, z = 1, color = INK) => line(points, color, opacity, z);
  const contour = (points, opacity = .4, z = 1, color = INK) => curve(points, color, opacity, z);
  const bezier = (a, b, c, d, count = 36) => Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count, u = 1 - t;
    return [u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * d[0],
      u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * d[1]];
  });
  const join = (...pieces) => pieces.flatMap((piece, i) => i ? piece.slice(1) : piece);
  const dune = (ridge, depth, opacity, shade = .035) => {
    const skirt = [...ridge, [44, -35], [-44, -35]];
    shape(skirt, PAPER, 1, depth);
    shape(skirt, OCHRE, shade, depth + .01);
    stroke(ridge, opacity, depth + .1);
  };

  // A pale, irregularly doubled sun floats in the generous dry sky.
  const disk = Array.from({ length: 73 }, (_, i) => {
    const a = i / 72 * Math.PI * 2;
    return [-24 + Math.cos(a) * 6.3, 23 + Math.sin(a) * 6.3];
  });
  shape(disk, OCHRE, .055, -6);
  ring(-24, 23, 6.3, OCHRE, .55, -5.9);
  contour([[-29.6, 26.4], [-27, 29], [-22, 29.5], [-18.2, 26.4]], .18, -5.9, OCHRE);
  contour([[-37, 16], [-32, 16.3], [-29, 16]], .18, -5);
  contour([[-16, 23], [-11, 23.3], [-4, 23.1]], .19, -5, OCHRE);
  contour([[-11, 21.8], [-5, 22], [1, 21.8]], .12, -5, OCHRE);
  contour([[5, 27], [6.1, 27.6], [7.2, 27], [8.3, 27.6], [9.4, 27.2]], .45, -5);

  const far = join(
    bezier([-44, 1], [-27, 10], [-22, 11], [-8, 4]),
    bezier([-8, 4], [10, -4], [22, 13], [44, 6]),
  );
  dune(far, -4, .27, .018);
  contour([[-42, -.6], [-28, 5.1], [-21, 6], [-11, 3.3]], .15, -3.8, OCHRE);
  contour([[3, 3], [15, 5], [26, 8], [38, 7]], .18, -3.8, OCHRE);

  // An eroded arch is a quiet landmark, with daylight continuing through it.
  const archOuter = join(
    bezier([18, -8], [18.4, -2], [17, 5], [21, 12], 18),
    bezier([21, 12], [25, 19], [33, 18], [36, 13], 18),
    bezier([36, 13], [40, 8], [38, 0], [40, -8], 18),
  );
  const archInner = join(
    bezier([33, -8], [33, -1], [33.5, 4], [31, 7], 16),
    bezier([31, 7], [27, 11], [23.5, 6], [24.5, 1], 16),
    bezier([24.5, 1], [25, -3], [24, -6], [24, -8], 12),
  );
  const arch = [...archOuter, ...archInner];
  shape(arch, PAPER, 1, -2.8);
  shape(arch, OCHRE, .095, -2.79);
  stroke(archOuter, .64, -2.7);
  stroke(archInner, .73, -2.7);
  shape([[32, 16.3], [36, 13], [38.3, 7], [38.5, 0], [40, -8], [35.8, -8], [35, 1], [35.6, 7], [34.2, 12]], OCHRE, .095, -2.6);
  contour([[20.1, 7], [22.4, 11.7], [27, 14.2], [32.7, 13.4], [36.6, 9.1]], .35, -2.5);
  contour([[21, 4.1], [22.4, 8.8], [25, 11.5]], .29, -2.5);
  contour([[27.1, 12.2], [31, 12], [34.4, 9.2], [35.6, 4.2]], .29, -2.5);
  contour([[36.1, 10.2], [37.2, 6], [36.4, .5], [37.8, -5]], .33, -2.5);
  contour([[19.4, -.5], [20.4, 2.8], [22.8, 4.3]], .3, -2.5);
  contour([[20.3, -3.1], [21.2, -.4], [23.5, .5]], .27, -2.5);
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    stroke([[35.8 + t * 1.1, 7 - t * 12], [37.3 + t * .9, 6.6 - t * 12]], .22, -2.4);
  }
  stroke([[29.2, 16.7], [28.5, 15.5], [29.3, 14.3], [28.9, 13.8]], .36, -2.4);

  const middle = join(
    bezier([-44, -9], [-35, -7], [-24, 6], [-14, 3]),
    bezier([-14, 3], [1, -.5], [11, -16], [44, -5]),
  );
  dune(middle, -1, .67, .045);
  // Leeward threads leave the crest bright, then become sparse downslope.
  for (let i = 0; i < 10; i++) {
    const shift = i * .77;
    const points = join(
      bezier([-40 + i * .9, -10.8 - shift], [-29, -6 - shift], [-22, 1.1 - shift], [-14, .8 - shift], 22),
      bezier([-14, .8 - shift], [-3, -1 - shift], [4 + i * .25, -11 - shift], [17 + i * .8, -12.2 - shift], 22),
    );
    stroke(points, i % 3 === 0 ? .21 : .13, -.8, OCHRE);
  }
  contour([[-13, 2.7], [-7, .6], [-2, -2.7], [4, -6.7]], .35, -.7);
  contour([[20, -11], [29, -9.5], [35, -7.8], [41, -6.7]], .21, -.7, OCHRE);

  const near = join(
    bezier([-44, -22], [-35, -18], [-32, -10], [-22, -13]),
    bezier([-22, -13], [-5, -18], [3, -32], [44, -18]),
  );
  dune(near, .4, .77, .027);
  for (let i = 0; i < 9; i++) {
    const d = i * .85;
    stroke(bezier([-42 + i * 1.2, -23 - d], [-32, -16.7 - d], [-27, -14.1 - d], [-19 + i * .6, -16.1 - d]), .18, .6, OCHRE);
  }
  contour([[14, -26], [25, -25.1], [34, -22.5], [42, -20.1]], .29, .6, OCHRE);
  contour([[21, -27.6], [31, -25.9], [38, -23.7]], .16, .6, OCHRE);

  // Small saguaro silhouettes and a few thorn marks measure the open space.
  const cactus = (x, y, h) => {
    const s = h / 10;
    const points = [[-.5, 0], [-.5, 4.2], [-2.1, 4.2], [-2.7, 4.9], [-2.7, 7.1], [-2.3, 7.5], [-1.9, 7.1], [-1.9, 5.2], [-.5, 5.2], [-.5, 9.5], [0, 10], [.5, 9.5], [.5, 3.2], [1.9, 3.2], [1.9, 6], [2.3, 6.4], [2.7, 6], [2.7, 3], [2.1, 2.3], [.5, 2.3], [.5, 0]].map(([a, b]) => [x + a * s, y + b * s]);
    shape(points, PAPER, 1, 1.1);
    shape(points, OCHRE, .08, 1.11);
    stroke([...points, points[0]], .74, 1.2);
    stroke([[x, y + .6 * s], [x, y + 9 * s]], .3, 1.3);
    contour([[x - 1.5 * s, y - .3], [x + .4 * s, y - .5], [x + 3.8 * s, y - 1]], .26, 1.1, OCHRE);
  };
  cactus(-31, -17.1, 7.2);
  cactus(34, -24.1, 5.1);
  cactus(13, -12.8, 2.3);
  [[-36, -27, 1.3], [-33, -28.5, .8], [28, -29, 1.1], [30, -28.4, .6]].forEach(([x, y, s]) => {
    contour([[x - s, y], [x, y + s * .65], [x + s * 1.4, y]], .4, 1.3);
    stroke([[x, y + s * .65], [x + s * .3, y]], .22, 1.3);
  });

  // Paired, diminishing prints wander toward the gap beside the stone arch.
  const trail = [[-3, -33, .74], [-5, -30.5, .66], [-6.4, -28, .59], [-6.6, -25.8, .52], [-5.5, -23.6, .46], [-3.5, -21.7, .4], [-1.2, -20, .35], [1, -18.2, .3], [2.5, -16.4, .25], [3, -14.8, .21], [2.5, -13.4, .18], [1.3, -12, .15], [.5, -10.6, .12]];
  trail.forEach(([x, y, s], i) => {
    const dx = i % 2 ? -.48 : .48;
    contour([[x + dx - s * .23, y - s * .5], [x + dx, y + s * .5], [x + dx + s * .28, y + s * .65]], .62 - i * .024, 1.5);
    stroke([[x + dx - s * .15, y - s * .75], [x + dx + s * .2, y - s * .66]], .42, 1.5);
  });
  for (let i = 0; i < 36; i++) {
    const x = -42 + random() * 84, y = -29 - random() * 5;
    if (x > -10 && x < 4) continue;
    stroke([[x, y], [x + .25 + random() * .6, y + .07]], .18, 1.4, OCHRE);
  }
}
