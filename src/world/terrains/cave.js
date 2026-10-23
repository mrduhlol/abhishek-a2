const INK = '#29271f';
const PAPER = '#f4efdf';
const MINERAL = '#73617e';

// Folded limestone, translucent mineral, and still water in a generous grotto.
export default function drawTerrain({ line, curve, shape, ring, random }) {
  const stroke = (points, opacity = .6, z = 1, color = INK) => line(points, color, opacity, z);
  const contour = (points, opacity = .4, z = 1, color = INK) => curve(points, color, opacity, z);

  // The rear chamber is suggested by a few receding vaults, never filled black.
  contour([[-34, -21], [-34, 3], [-27, 17], [-13, 25], [4, 27], [21, 23], [33, 13], [37, -5], [35, -22]], .24, -5, MINERAL);
  contour([[-28, -22], [-29, -4], [-25, 11], [-12, 20], [2, 22], [16, 19], [25, 11], [29, -4], [29, -22]], .18, -5, MINERAL);
  contour([[-24, -18], [-23, -5], [-18, 8], [-7, 15], [6, 16], [17, 10], [22, -2], [23, -18]], .12, -5, MINERAL);
  contour([[-23, -21], [-11, -19], [0, -20], [13, -18], [28, -20]], .2, -4.8, MINERAL);
  contour([[-18, -22], [-7, -21], [5, -22], [16, -20], [24, -21]], .13, -4.8, MINERAL);

  // The roof is one asymmetric ring of stone, with a broad white opening.
  const outer = [[-44, -25], [-44, -5], [-43, 10], [-38, 23], [-29, 30], [-16, 34], [-2, 33], [11, 34], [25, 31], [36, 25], [42, 15], [44, 1], [44, -25]];
  const inner = [[33, -25], [34, -11], [33, 2], [30, 13], [24, 21], [14, 25], [4, 27], [-8, 26], [-20, 23], [-28, 16], [-33, 5], [-34, -10], [-32, -25]];
  const arch = [...outer, ...inner];
  shape(arch, PAPER, 1, -3);
  shape(arch, MINERAL, .055, -2.99);
  contour(outer, .78, -2.8);
  contour([...inner].reverse(), .66, -2.8);
  contour([[-42, -19], [-42, -2], [-39, 14], [-32, 24], [-19, 30], [-5, 30], [10, 31], [24, 28], [35, 21], [40, 9], [41, -9], [42, -21]], .34, -2.7);
  contour([[-39, -22], [-39, -6], [-36, 9], [-30, 20], [-18, 27]], .29, -2.7);
  contour([[-14, 28], [-5, 29], [7, 29], [17, 27]], .25, -2.7);
  contour([[22, 26], [32, 20], [37, 10], [39, -3], [39, -21]], .34, -2.7);
  contour([[-41, 4], [-39, 5], [-37, 11], [-32, 16]], .25, -2.6);
  contour([[33, 18], [35, 14], [35, 8], [37, 2]], .35, -2.6);

  // Short engraved cuts follow the roof's bedding, with breaks for fissures.
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const angle = .15 + t * 2.83;
    const x = Math.cos(angle) * 39;
    const y = -4 + Math.sin(angle) * 35;
    stroke([[x, y], [x - Math.cos(angle) * (1.3 + random() * 1.4), y - Math.sin(angle) * 1.7]], .22, -2.5);
    if (i % 3 === 0) stroke([[x - .7, y + .6], [x - Math.cos(angle) * 2.2 - .7, y - Math.sin(angle) * 1.1 + .6]], .13, -2.5);
  }
  stroke([[-27, 29], [-25, 27], [-26, 25], [-24, 23]], .42, -2.4);
  stroke([[14, 32], [12, 30], [13, 28], [11, 26]], .39, -2.4);
  stroke([[40, 17], [38, 15], [39, 12], [37, 10]], .31, -2.4);

  // Long, folded calcite draperies make an uneven ceiling fringe.
  const pendant = (x, y, h, w, lean = 0) => {
    const p = [[x - w, y], [x - w * .67, y - h * .25], [x - w * .35 + lean * .4, y - h * .67], [x + lean, y - h], [x + w * .25 + lean * .7, y - h * .69], [x + w * .78, y - h * .21], [x + w, y + .4]];
    shape(p, PAPER, 1, -1.8);
    shape([p[3], p[4], p[5], p[6], [x + .15, y]], MINERAL, .12, -1.7);
    contour(p.slice(0, 6), .64, -1.5);
    contour([[x - .2, y - .4], [x - w * .1, y - h * .28], [x + lean * .7, y - h * .7], p[3]], .35, -1.4);
    contour([[x - w * .55, y - h * .11], [x - w * .38, y - h * .28], [x - w * .18 + lean * .4, y - h * .57]], .2, -1.4);
    stroke([[x - w * .75, y - h * .1], [x - w * .18, y - h * .14], [x + w * .55, y - h * .08]], .22, -1.3);
  };
  pendant(-27, 20, 12, 2.8, 1.3);
  pendant(-20, 24, 8.5, 2.1, -.5);
  pendant(-13, 26, 11, 2.4, .7);
  pendant(-7, 27, 5.7, 1.7, .25);
  pendant(13, 26, 9, 2.2, -.5);
  pendant(20, 24, 14.5, 3.1, -1.1);
  pendant(27, 19, 9.5, 2.6, -.6);
  pendant(31, 13, 6, 1.6, -.4);

  // A thin caving rope vanishes through a little cleft in the roof.
  shape([[-.9, 31], [1, 31.7], [2.7, 30.8], [2, 28.1], [.2, 27.6]], MINERAL, .13, -1.2);
  contour([[-.9, 31], [.1, 29.4], [.2, 27.6], [2, 28.1], [2.7, 30.8]], .53, -1.1);
  contour([[1.4, 29.8], [1.1, 23], [1.3, 17], [.7, 11], [1.2, 6.5]], .7, -.9);
  contour([[1.9, 29.5], [1.6, 23], [1.8, 17], [1.2, 11], [1.7, 6.5]], .22, -.9);
  for (let i = 0; i < 15; i++) {
    const y = 7.8 + i * 1.35;
    const x = 1.2 + Math.sin(y * .32) * .2;
    stroke([[x - .16, y], [x + .42, y - .35]], .32, -.8);
  }
  ring(1.45, 6.4, .48, INK, .58, -.7);
  contour([[1.45, 5.9], [1.7, 4.5], [2.4, 4.2], [2.8, 4.8]], .5, -.7);

  // Mineral columns at the sides are worn into shelves and thin flutes.
  const leftWall = [[-44, -27], [-43, -11], [-41, 1], [-37, 9], [-34, 7], [-35, -2], [-32, -10], [-33, -18], [-27, -25], [-29, -30]];
  const rightWall = [[31, -26], [35, -15], [34, -7], [36, 1], [36, 10], [39, 13], [42, 5], [42, -9], [44, -28], [38, -31]];
  shape(leftWall, PAPER, 1, -.3);
  shape(rightWall, PAPER, 1, -.3);
  shape([[-41, 0], [-37, 9], [-34, 7], [-35, -2], [-32, -10], [-33, -18], [-27, -25], [-30, -27], [-36, -18], [-37, -7]], MINERAL, .09, -.2);
  shape([[36, 10], [39, 13], [38, 1], [39, -7], [37, -15], [38, -27], [31, -26], [35, -15], [34, -7], [36, 1]], MINERAL, .08, -.2);
  contour(leftWall.slice(1, 9), .73, -.1);
  contour(rightWall.slice(0, 8), .74, -.1);
  contour([[-40, -22], [-39, -14], [-40, -6], [-37, 3], [-36, 7]], .4, 0);
  contour([[-37, -24], [-36, -17], [-37, -12], [-35, -8]], .33, 0);
  contour([[40, -25], [39, -16], [40, -8], [39, -.5], [40, 6]], .35, 0);
  contour([[36.5, -23], [38, -18], [36.5, -11], [38, -7]], .39, 0);
  for (let i = 0; i < 17; i++) {
    const y = -23 + i * 1.6;
    contour([[-41, y], [-39, y + .8], [-37.5, y + .6]], .17, .1);
    contour([[38.5, y - 1], [40, y - .4], [41.5, y - .7]], .18, .1);
  }

  // The water takes the cave's color in pale, broken horizontal reflections.
  const pool = [[-25, -24], [-18, -21.6], [-7, -22.2], [3, -21], [16, -22], [28, -25], [20, -30], [7, -33], [-8, -32], [-21, -29]];
  shape(pool, MINERAL, .055, .2);
  contour([[-26, -25], [-17, -22.1], [-6, -22.5], [4, -21.5], [17, -22.6], [28, -25]], .35, .3, MINERAL);
  contour([[-21, -29], [-9, -31.4], [5, -32], [17, -30.3], [24, -28]], .26, .3, MINERAL);
  for (let i = 0; i < 20; i++) {
    const y = -23.5 - i * .41;
    const x = -18 + random() * 24;
    const w = 2 + random() * 8;
    contour([[x, y], [x + w * .45, y + .16], [x + w, y]], .12 + (i % 3) * .035, .4, MINERAL);
  }
  [[-22, -25, 4], [-15, -28, 3.4], [15, -26, 4.2], [20, -28, 3.6], [9, -30, 2.6]].forEach(([x, y, w]) => {
    stroke([[x - w, y], [x - .4, y + .1]], .23, .5, MINERAL);
    stroke([[x + .5, y - .5], [x + w, y - .45]], .18, .5, MINERAL);
  });

  // Low limestone banks hide the water's ends and anchor the crystal gardens.
  const leftBank = [[-44, -27], [-37, -23], [-30, -22], [-24, -24], [-20, -27], [-16, -29], [-21, -32], [-35, -33], [-44, -31]];
  const rightBank = [[15, -28], [20, -25], [29, -23], [36, -24], [44, -28], [43, -32], [31, -34], [21, -33]];
  shape(leftBank, PAPER, 1, .8);
  shape(rightBank, PAPER, 1, .8);
  shape(leftBank, MINERAL, .035, .81);
  shape(rightBank, MINERAL, .04, .81);
  contour(leftBank.slice(0, 6), .65, .9);
  contour(rightBank.slice(0, 5), .63, .9);
  contour([[-42, -29], [-35, -28], [-29, -30], [-22, -30.5]], .27, 1);
  contour([[22, -30], [29, -29], [35, -30], [41, -29.5]], .27, 1);

  // Each crystal has a distinct crown and an offset inner facet, not a triangle.
  let crystalIndex = 0;
  const crystal = (x, y, h, w, tilt = 0) => {
    const z = 1.3 + crystalIndex++ * .24;
    const at = (a, b) => [x + a + b * tilt, y + b];
    const p = [at(-w, 0), at(-w * .86, h * .72), at(-w * .25, h * .94), at(w * .18, h), at(w * .83, h * .8), at(w, h * .2), at(w * .74, 0)];
    const ridgeTop = at(w * .18, h);
    const ridgeShoulder = at(w * .08, h * .7);
    const ridgeBase = at(-w * .05, .5);
    shape(p, PAPER, 1, z);
    shape([ridgeBase, ridgeShoulder, ridgeTop, p[4], p[5], p[6]], MINERAL, .15, z + .01);
    shape([p[1], p[2], ridgeTop, ridgeShoulder], MINERAL, .055, z + .02);
    stroke([...p, p[0]], .78, z + .1);
    stroke([ridgeBase, ridgeShoulder, ridgeTop], .53, z + .2);
    stroke([p[1], ridgeShoulder, p[4]], .49, z + .2);
    stroke([p[2], at(-w * .43, h * .69), at(-w * .6, h * .13)], .24, z + .2);
    stroke([at(w * .57, h * .66), at(w * .68, h * .25)], .24, z + .2, MINERAL);
    stroke([at(-w * .75, h * .19), at(-w * .27, h * .25)], .19, z + .2);
  };
  crystal(-31, -25.6, 10.5, 2.7, -.27);
  crystal(-25, -26.5, 18, 3.25, -.05);
  crystal(-19.5, -27.5, 10, 2.45, .29);
  crystal(30.5, -26.1, 12.5, 2.9, .28);
  crystal(24, -27, 21.5, 3.8, .04);
  crystal(17.8, -28.6, 11.8, 2.8, -.31);
  crystal(-29, -29, 7, 2.1, -.36);
  crystal(-22, -29.5, 6.2, 2.2, .15);
  crystal(28.8, -30, 7.5, 2.5, .36);
  crystal(21.3, -30.1, 6, 2, -.18);

  // Chips and tiny calcite glints are concentrated at the banks, leaving air.
  [[-37, -27, 1.4], [-34, -30, .9], [-17, -30, .7], [34, -27, 1.1], [38, -29, 1.4], [16, -31, .7]].forEach(([x, y, s]) => {
    const chip = [[x - s, y], [x - s * .5, y + s * .8], [x + s * .6, y + s * .6], [x + s, y - .2], [x, y - .6]];
    shape(chip, PAPER, 1, 4);
    stroke([...chip, chip[0]], .49, 4.1);
    stroke([chip[1], [x, y], chip[3]], .27, 4.1);
  });
  [[-28, -10, .65], [-16, -18, .45], [28, -2, .6], [15, -12, .42]].forEach(([x, y, s]) => {
    stroke([[x - s, y], [x + s, y]], .5, 4.1, MINERAL);
    stroke([[x, y - s], [x, y + s]], .5, 4.1, MINERAL);
  });
  for (let i = 0; i < 24; i++) {
    const x = (i < 12 ? -41 : 29) + random() * 12;
    const y = -30 - random() * 2.5;
    stroke([[x, y], [x + .4 + random() * .8, y + .12]], .17, 4.2);
  }
}
