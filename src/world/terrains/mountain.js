const INK = '#29271f';
const BLUE = '#526d82';
const PAPER = '#f4efdf';

// An engraved alpine basin: snow carries the light, rock carries the marks.
export default function drawTerrain({ line, curve, shape, ring, bird, random }) {
  const stroke = (points, opacity = .65, z = 1, color = INK) => line(points, color, opacity, z);
  const contour = (points, opacity = .4, z = 1, color = INK) => curve(points, color, opacity, z);

  // Quiet sky and a remote cirque leave room around the principal summit.
  ring(27, 25, 4.5, BLUE, .48, -5);
  ring(27.3, 24.8, 4.8, BLUE, .15, -5);
  contour([[-42, 21], [-35, 21.3], [-29, 21]], .22, -5, BLUE);
  contour([[-37, 23], [-30, 23.2], [-25, 22.8]], .16, -5, BLUE);
  bird(11, 30, .65);
  bird(16, 28, .4);
  const farRidge = [[-44, -6], [-35, 7], [-30, 5], [-23, 18], [-18, 11], [-12, 14], [-5, 4], [7, 12], [14, 9], [22, 19], [27, 13], [31, 14], [43, -4]];
  stroke(farRidge, .33, -4, BLUE);
  stroke([[-23, 18], [-23, 11], [-28, 3], [-27, -4]], .24, -4, BLUE);
  stroke([[22, 19], [20, 11], [24, 6], [22, 1], [27, -7]], .28, -4, BLUE);
  stroke([[-30, 5], [-26, 7], [-23, 5], [-20, 9], [-18, 7]], .22, -4, BLUE);
  stroke([[17, 12], [20, 11], [22, 7], [24, 6], [28, 7], [31, 5]], .22, -4, BLUE);

  // Asymmetric snow arêtes, rather than a stack of regular triangles.
  const massif = [[-40, -18], [-30, -3], [-26, 4], [-20, 8], [-15, 18], [-10, 23], [-6, 31], [-2, 26], [1, 24], [5, 17], [10, 14], [16, 6], [22, 3], [32, -17], [17, -25], [-20, -25]];
  shape(massif, PAPER, 1, -1);
  stroke(massif.slice(0, 14), .8, -.9);
  shape([[-6, 31], [-5, 20], [-1, 15], [-3, 10], [3, 4], [2, -3], [10, -15], [17, -25], [32, -17], [22, 3], [16, 6], [10, 14], [5, 17], [1, 24], [-2, 26]], BLUE, .1, -.85);
  shape([[-26, 4], [-20, 8], [-15, 18], [-16, 8], [-22, -2], [-20, -7], [-29, -18], [-39, -18]], BLUE, .055, -.85);
  stroke([[-6, 31], [-5, 20], [-1, 15], [-3, 10], [3, 4], [2, -3], [7, -10], [6, -17]], .78, -.6);
  stroke([[-15, 18], [-16, 8], [-22, -2], [-20, -7], [-29, -18]], .46, -.6);
  stroke([[-19, 10], [-16, 8], [-12, 11], [-8, 9], [-5, 14], [-1, 15], [2, 12], [5, 13], [9, 10]], .63, -.5);
  stroke([[-10, 23], [-9, 18], [-11, 14]], .28, -.5, BLUE);
  stroke([[-2, 26], [-1, 22], [2, 19]], .36, -.5);
  stroke([[5, 17], [4, 12], [8, 6], [8, 1], [15, -6]], .42, -.5);
  stroke([[10, 14], [11, 8], [16, 6], [15, 2], [21, -6]], .36, -.5);
  stroke([[-20, 8], [-23, 2], [-27, 0], [-30, -6]], .35, -.5);

  // Lithographic hatch follows the strata, with white breaks for snow gullies.
  for (let i = 0; i < 27; i++) {
    const t = i / 26;
    const x = -4.5 + t * 18;
    const y = 18 - t * 31;
    const length = 1.5 + random() * 3;
    stroke([[x, y], [x + length, y - length * .4]], .22, -.4);
    if (i % 3 === 0) stroke([[x + 1, y - .7], [x + 3, y - 1.5]], .15, -.4);
  }
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const x = -17 - t * 14;
    const y = 6 - t * 22;
    stroke([[x, y], [x + 1.2 + random(), y - .8 - random()]], .23, -.4);
  }
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    stroke([[11 + t * 12, 7 - t * 23], [13.4 + t * 12, 4.5 - t * 23]], .18, -.4, BLUE);
  }
  contour([[-18, 3], [-16, -1], [-16, -5], [-19, -11], [-19, -15]], .28, -.3, BLUE);
  contour([[-13, 6], [-10, 1], [-11, -5], [-8, -12], [-9, -17]], .3, -.3, BLUE);
  contour([[-11, 4], [-8, -1], [-8, -5], [-5, -10]], .17, -.3, BLUE);
  contour([[-17, 6], [-20, 0], [-24, -6], [-28, -12]], .21, -.3, BLUE);
  contour([[-15, 3], [-18, -3], [-21, -8], [-23, -15]], .15, -.3, BLUE);

  // A nearer shoulder cuts across the right-hand foot of the snowfield.
  const shoulder = [[5, -21], [14, -4], [20, 2], [24, 8], [28, 5], [31, -2], [36, -6], [43, -22], [26, -29]];
  shape(shoulder, PAPER, 1, 0);
  stroke(shoulder.slice(0, 8), .8, .1);
  shape([[24, 8], [23, 0], [28, -7], [27, -14], [34, -24], [43, -22], [36, -6], [31, -2], [28, 5]], BLUE, .12, .1);
  stroke([[24, 8], [23, 0], [28, -7], [27, -14], [32, -24]], .64, .2);
  stroke([[17, -1], [20, -3], [23, 0], [25, -3], [28, -2], [31, -4]], .47, .2);
  stroke([[14, -4], [16, -9], [13, -15], [17, -23]], .38, .2);
  for (let i = 0; i < 19; i++) {
    const t = i / 18;
    stroke([[25 + t * 10, -4 - t * 16], [28 + t * 10, -5.3 - t * 16]], .23, .3);
  }

  // Foreground shelves frame a narrow, open ravine beneath the bridge.
  const leftShelf = [[-44, -27], [-36, -23], [-29, -14], [-25, -13], [-21, -17], [-19, -19], [-20, -25], [-17, -33], [-30, -32]];
  const rightShelf = [[-4, -20], [2, -17], [9, -18], [15, -22], [26, -23], [39, -26], [44, -30], [27, -33], [10, -32], [0, -29], [-2, -24]];
  shape(leftShelf, PAPER, 1, 1);
  shape(rightShelf, PAPER, 1, 1);
  stroke(leftShelf.slice(0, 8), .7, 1.1);
  stroke(rightShelf.slice(0, 7), .7, 1.1);
  stroke([[44, -30], [27, -33], [10, -32], [0, -29], [-2, -24], [-4, -20]], .32, 1.1);
  stroke([[-17, -33], [-30, -32], [-44, -27]], .25, 1.1);
  shape([[-21, -17], [-19, -19], [-20, -25], [-17, -33], [-23, -31], [-26, -23], [-25, -18]], BLUE, .13, 1.1);
  shape([[-4, -20], [-2, -24], [0, -29], [10, -32], [5, -25], [2, -22]], BLUE, .12, 1.1);
  stroke([[-36, -23], [-29, -20], [-25, -20], [-26, -23], [-23, -26], [-23, -30]], .37, 1.2);
  stroke([[-29, -14], [-29, -18], [-26, -19]], .4, 1.2);
  stroke([[-21, -20], [-23, -22], [-21, -26], [-20, -29]], .38, 1.2);
  stroke([[2, -17], [1, -22], [5, -25], [5, -28], [10, -30]], .4, 1.2);
  contour([[12, -25], [20, -26], [27, -25], [34, -28]], .25, 1.2);
  contour([[-15, -32], [-11, -29], [-10, -26]], .25, .2, BLUE);
  contour([[-12, -34], [-8, -31], [-7, -27]], .16, .2, BLUE);
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    stroke([[-25 + t * 4, -21 - t * 7], [-23.9 + t * 4, -22.8 - t * 7]], .22, 1.3);
    stroke([[2 + t * 6, -24 - t * 5], [3.6 + t * 6, -24.9 - t * 5]], .18, 1.3);
  }

  // The walking line continues up the mountain as a delicate fixed climbing rope.
  contour([[-41, -26], [-34, -25], [-29, -23], [-25, -20], [-21, -19]], .58, 1.5, BLUE);
  contour([[-4, -20], [0, -18], [4, -14], [0, -11], [-4, -10], [0, -7], [5, -4], [1, 0], [-3, 3], [-1, 8], [-4, 13], [-3.5, 18]], .63, .6, BLUE);
  [[-3.5, 18], [-1, 8], [5, -4]].forEach(([x, y]) => {
    ring(x, y, .27, INK, .65, .8);
    stroke([[x - .5, y + .5], [x + .6, y - .5]], .5, .8);
  });
  const deck = x => -22 + 2.2 * ((x + 12) / 9) ** 2;
  contour([[-21, -16.7], [-16, -18.6], [-12, -19], [-8, -18.7], [-3, -17.2]], .82, 2);
  contour([[-21, -19.8], [-16, -21.7], [-12, -22], [-8, -21.7], [-3, -19.8]], .8, 2);
  contour([[-21, -20.5], [-16, -22.4], [-12, -22.7], [-8, -22.4], [-3, -20.5]], .44, 2);
  for (let x = -20.5; x < -3; x += 1.15) {
    const y = deck(x);
    stroke([[x, y], [x + .6, y - .7]], .7, 2.1);
    if (Math.round((x + 20.5) / 1.15) % 2 === 0) stroke([[x, y], [x, y + 3.1]], .43, 2.1);
  }
  [[-21, -20], [-3, -20]].forEach(([x, y]) => {
    stroke([[x, y - .8], [x, y + 4.6]], .8, 2.2);
    ring(x, y + 4.5, .25, INK, .7, 2.2);
  });

  // Sparse, wind-shaped silver firs give the rock faces a human scale.
  const fir = (x, y, height) => {
    stroke([[x, y], [x + .2, y + height]], .75, 2.5);
    for (let n = 1; n <= 7; n++) {
      const t = n / 8;
      const yy = y + height * t;
      const width = height * .22 * (1 - t);
      stroke([[x - width, yy - .7], [x + .15, yy + 1], [x + width * .85, yy - .3]], .65, 2.5);
      stroke([[x - width * .85, yy - 1], [x, yy + .4], [x + width * .65, yy - .7]], .29, 2.5, BLUE);
    }
  };
  fir(-35, -24, 11);
  fir(-39, -26, 7);
  fir(35, -27, 12);
  fir(39, -28, 7);
  for (let i = 0; i < 24; i++) {
    const x = -40 + random() * 81;
    const y = -29 - random() * 3;
    if (x > -19 && x < 0) continue;
    stroke([[x, y], [x + .7 + random() * 1.5, y + .15]], .19, 2.4);
  }
}
