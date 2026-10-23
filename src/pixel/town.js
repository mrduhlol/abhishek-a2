// Town painting: Abhishek World village (no baked text). Rich 2.5D pixel scene.
export const TOWN_NPCS = [
  { id: 'baker', name: 'Baker Mira', kind: 'woman', age: 'adult', role: 'baker', x: 620, y: 400, working: true, dialogue: 'Fresh bread! Warm from the oven.' },
  { id: 'blacksmith', name: 'Smith Goran', kind: 'man', age: 'adult', role: 'blacksmith', x: 980, y: 410, working: true, dialogue: 'Need a blade sharpened?' },
  { id: 'elder', name: 'Elder Toma', kind: 'elder', age: 'elder', role: 'elder', x: 820, y: 520, working: false, dialogue: 'Welcome to our village, traveler.' },
  { id: 'girl', name: 'Lina', kind: 'girl', age: 'teen', role: 'villager', x: 820, y: 510, working: false, dialogue: 'Hi! Want to play?' },
  { id: 'child', name: 'Pip', kind: 'child', age: 'child', role: 'child', x: 700, y: 560, working: false, dialogue: 'Race you to the well!' },
  { id: 'merchant', name: 'Trader Sef', kind: 'man', age: 'adult', role: 'merchant', x: 560, y: 500, working: true, dialogue: 'Silk, spice, and stories.' },
  { id: 'farmer', name: 'Farmer Noor', kind: 'woman', age: 'adult', role: 'farmer', x: 1040, y: 580, working: true, dialogue: 'Harvest is almost ready.' },
  { id: 'weaver', name: 'Weaver Ida', kind: 'woman', age: 'elder', role: 'weaver', x: 470, y: 430, working: true, dialogue: 'Thread by thread, a life.' },
  { id: 'guard', name: 'Guard Ren', kind: 'man', age: 'adult', role: 'guard', x: 560, y: 370, working: true, dialogue: 'Stay safe on the road.' },
  { id: 'gardener', name: 'Gardener Lua', kind: 'woman', age: 'adult', role: 'gardener', x: 900, y: 600, working: true, dialogue: 'These flowers love the sun.' },
];

export function paintTown(ctx, { width = 1536, height = 768, random = Math.random } = {}) {
  ctx.imageSmoothingEnabled = false;
  const W = width, H = height;
  const r = () => random();

  const C = {
    sky: '#b8d8f0', sky2: '#8fb8e0',
    grass0: '#5a8a4a', grass1: '#4a7a3a', grass2: '#3a6a2e', grass3: '#2a5a22',
    dirt: '#8a6a4a', dirt2: '#6a4a30',
    cobble0: '#9a9a9a', cobble1: '#7a7a7a', cobble2: '#b0a898', cobble3: '#5a5a5a',
    plaster: '#e8d8b8', plaster2: '#d8c8a0', plasterSh: '#b8a880',
    timber: '#5a3a22', timber2: '#7a5a38', timberHi: '#9a7a58',
    roof: '#e07030', roof2: '#c05820', roof3: '#904018', roofHi: '#f09050',
    door: '#4a2a14', window: '#9ac8e0', windowSh: '#5a8ab0',
    treeTrunk: '#4a3020', treeLeaf: '#3a7a3a', treeLeaf2: '#5a9a4a', treeLeaf3: '#2a5a2a', treeHi: '#7aba5a',
    flowerR: '#e04040', flowerY: '#e0c040', flowerB: '#4060e0', flowerP: '#c040c0',
    pot: '#a06040',
    stall: '#d0a060', stallCanopy: '#c04040', stallCanopy2: '#4060a0',
    well: '#6a6a6a', well2: '#8a8a8a', wellWater: '#3a6a90',
    laundry: '#e0d0b0', laundry2: '#b0c0d0',
    cart: '#8a6a4a',
  };

  function fill(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h))); }
  function px(x, y, c) { if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  function cluster(x, y, w, h, colors) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (r() < 0.32) continue;
      px(x + xx, y + yy, colors[Math.floor(r() * colors.length)]);
    }
  }

  // Sky
  fill(0, 0, W, 120, C.sky);
  fill(0, 100, W, 20, C.sky2);

  // Grass base
  fill(0, 120, W, H - 120, C.grass1);
  for (let i = 0; i < 6000; i++) {
    const x = Math.floor(r() * W);
    const y = 120 + Math.floor(r() * (H - 120));
    px(x, y, r() < 0.5 ? C.grass0 : (r() < 0.5 ? C.grass2 : C.grass3));
  }

  // Dirt paths
  // main path from entry (left) to square
  function pathBand(x0, y0, x1, y1, width) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.floor(x0 + (x1 - x0) * t);
      const y = Math.floor(y0 + (y1 - y0) * t);
      for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        px(x + dx, y + dy, r() < 0.6 ? C.dirt : C.dirt2);
      }
    }
  }
  pathBand(160, 460, 560, 470, 26);
  pathBand(560, 470, 800, 490, 26);
  pathBand(200, 500, 560, 470, 18);
  // path to right exit
  pathBand(1050, 490, 1450, 500, 24);

  // Central square cobbles
  const sqX0 = 550, sqY0 = 360, sqX1 = 1050, sqY1 = 620;
  for (let y = sqY0; y < sqY1; y++) for (let x = sqX0; x < sqX1; x++) {
    const c = (x + y) % 7;
    const col = c === 0 ? C.cobble3 : (c < 3 ? C.cobble0 : (c < 5 ? C.cobble1 : C.cobble2));
    px(x, y, col);
  }
  // cobble grout
  for (let y = sqY0; y < sqY1; y += 6) for (let x = sqX0; x < sqX1; x++) px(x, y, C.cobble3);
  for (let x = sqX0; x < sqX1; x += 7) for (let y = sqY0; y < sqY1; y++) if (r() < 0.7) px(x, y, C.cobble3);

  // Building painter
  function building(x, y, w, h, opts = {}) {
    const roofH = opts.roofH || 28;
    const plaster = opts.plaster || C.plaster;
    const plaster2 = opts.plaster2 || C.plaster2;
    // walls
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const c = (xx + yy * 2) % 5 === 0 ? plaster2 : plaster;
      px(x + xx, y + yy, c);
    }
    // timber framing
    if (opts.timber) {
      // vertical posts
      for (let p = 0; p <= 2; p++) {
        const px0 = x + Math.floor(w * (p / 2));
        for (let yy = 0; yy < h; yy++) { px(px0, y + yy, C.timber); px(px0 + 1, y + yy, C.timber2); }
      }
      // horizontal beams
      for (let b = 0; b < 3; b++) {
        const by = y + Math.floor(h * (b / 2.5));
        for (let xx = 0; xx < w; xx++) px(x + xx, by, C.timber);
      }
    }
    // shadow right side
    for (let yy = 0; yy < h; yy++) { px(x + w - 1, y + yy, C.plasterSh); px(x + w - 2, y + yy, C.plasterSh); }
    // top highlight
    for (let xx = 0; xx < w; xx++) px(x + xx, y, C.plaster2);
    // roof (orange tiles)
    for (let t = 0; t < roofH; t++) {
      const over = Math.floor(t / 3);
      for (let xx = -over; xx < w + over; xx++) {
        const col = (t % 3 === 0) ? C.roofHi : (t % 2 === 0 ? C.roof : C.roof2);
        px(x + xx, y - t, col);
      }
    }
    // roof ridge
    for (let xx = -2; xx < w + 2; xx++) px(x + xx, y - roofH, C.roof3);
    // roof texture tiles
    for (let t = 0; t < roofH; t++) for (let xx = 0; xx < w; xx += 4) {
      if (r() < 0.4) px(x + xx + (t % 2) * 2, y - t, C.roof3);
    }
    // door
    const doorW = opts.doorW || 10;
    const doorX = x + Math.floor(w / 2) - Math.floor(doorW / 2);
    const doorY = y + h - (opts.doorH || 18);
    for (let yy = 0; yy < (opts.doorH || 18); yy++) for (let xx = 0; xx < doorW; xx++) {
      px(doorX + xx, doorY + yy, (xx === 0 || xx === doorW - 1) ? C.timber : C.door);
    }
    // door handle
    px(doorX + doorW - 2, doorY + Math.floor((opts.doorH || 18) / 2), C.roofHi);
    // windows
    const winCount = opts.windows || 2;
    for (let wi = 0; wi < winCount; wi++) {
      const wx = x + 6 + wi * Math.floor((w - 12) / Math.max(1, winCount));
      const wy = y + 8;
      for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < 12; xx++) {
        if (xx === 0 || yy === 0 || xx === 11 || yy === 9) px(wx + xx, wy + yy, C.timber);
        else px(wx + xx, wy + yy, (xx + yy) % 3 === 0 ? C.windowSh : C.window);
      }
    }
    // flowerpot near door
    if (opts.pot !== false) {
      const potX = doorX + doorW + 4;
      const potY = y + h - 6;
      for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 5; xx++) px(potX + xx, potY + yy, C.pot);
      // flowers
      for (let i = 0; i < 5; i++) {
        const fx = potX + i, fy = potY - 1 - Math.floor(r() * 3);
        px(fx, fy, [C.flowerR, C.flowerY, C.flowerB, C.flowerP][Math.floor(r() * 4)]);
      }
    }
  }

  // Place buildings around square
  // Top row
  building(140, 230, 150, 90, { timber: true, windows: 2 });
  building(320, 220, 120, 80, { timber: false, windows: 2 });
  building(470, 210, 130, 95, { timber: true, windows: 3 });
  building(1100, 220, 140, 90, { timber: true, windows: 2 });
  building(1270, 230, 160, 95, { timber: false, windows: 3 });
  // Large inn top-center above square
  building(700, 150, 200, 110, { timber: true, windows: 4, roofH: 34, doorW: 14 });
  // Left column
  building(80, 360, 110, 80, { timber: false, windows: 2 });
  building(80, 470, 100, 75, { timber: true, windows: 1 });
  // Right column
  building(1100, 360, 120, 85, { timber: false, windows: 2 });
  building(1120, 470, 110, 80, { timber: true, windows: 2 });
  // Bottom row
  building(260, 640, 150, 80, { timber: true, windows: 2 });
  building(440, 650, 130, 75, { timber: false, windows: 2 });
  building(620, 660, 120, 70, { timber: true, windows: 1 });
  building(820, 660, 130, 75, { timber: false, windows: 2 });
  building(1000, 650, 140, 80, { timber: true, windows: 2 });
  building(1180, 640, 150, 80, { timber: false, windows: 2 });

  // Well in square center
  function well(cx, cy) {
    // base ring
    for (let yy = -10; yy <= 10; yy++) for (let xx = -12; xx <= 12; xx++) {
      if (xx * xx / 144 + yy * yy / 100 > 1) continue;
      px(cx + xx, cy + yy, (xx * xx + yy * yy) > 60 ? C.well : C.well2);
    }
    // inner water
    for (let yy = -6; yy <= 6; yy++) for (let xx = -8; xx <= 8; xx++) {
      if (xx * xx / 64 + yy * yy / 36 > 1) continue;
      px(cx + xx, cy + yy, (r() < 0.3) ? C.wellWater : '#2a5a80');
    }
    // posts + roof
    for (let t = 0; t < 26; t++) {
      px(cx - 14, cy - 10 - t, C.timber);
      px(cx + 14, cy - 10 - t, C.timber);
    }
    // crossbeam
    for (let xx = -16; xx <= 16; xx++) px(cx + xx, cy - 36, C.timber2);
    // bucket
    for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 6; xx++) px(cx - 3 + xx, cy - 28 + yy, C.pot);
    // rope
    for (let t = 0; t < 20; t++) px(cx, cy - 16 - t, '#b0a080');
  }
  well(800, 490);

  // Trees
  function tree(cx, cy, size = 1) {
    const trunkH = 18 * size;
    for (let t = 0; t < trunkH; t++) {
      for (let xx = -2 * size; xx <= 2 * size; xx++) px(cx + xx, cy - t, (xx === -2 * size || xx === 2 * size) ? C.treeTrunk : C.timber2);
    }
    // canopy layers
    const layers = [18, 14, 10];
    for (let li = 0; li < layers.length; li++) {
      const rad = layers[li] * size;
      const yy0 = cy - trunkH - li * 6;
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        if (dx * dx + dy * dy > rad * rad) continue;
        if (r() < 0.15) continue;
        const col = (dx < -rad / 3) ? C.treeHi : (dy < -rad / 2 ? C.treeLeaf2 : (r() < 0.5 ? C.treeLeaf : C.treeLeaf3));
        px(cx + dx, yy0 + dy, col);
      }
    }
  }
  const trees = [
    [120, 160, 1.1], [260, 150, 0.9], [420, 140, 1.2], [1080, 160, 1], [1240, 150, 1.1], [1400, 170, 0.9],
    [60, 600, 1], [200, 700, 1.1], [1450, 620, 1], [1500, 700, 0.9],
    [500, 330, 0.8], [1080, 330, 0.8], [600, 620, 0.7], [950, 620, 0.7],
  ];
  for (const [tx, ty, sz] of trees) tree(tx, ty, sz);

  // Stalls in square
  function stall(cx, cy, canopyColor) {
    // posts
    for (let t = 0; t < 30; t++) {
      px(cx - 22, cy - t, C.timber);
      px(cx + 22, cy - t, C.timber);
    }
    // canopy
    for (let yy = 0; yy < 10; yy++) for (let xx = -26; xx <= 26; xx++) {
      if (Math.abs(xx) + yy > 30) continue;
      px(cx + xx, cy - 30 + yy, (yy % 2 === 0) ? canopyColor : (canopyColor === C.stallCanopy ? C.stallCanopy2 : C.stallCanopy));
    }
    // counter
    for (let xx = -20; xx <= 20; xx++) for (let yy = 0; yy < 6; yy++) px(cx + xx, cy - 4 + yy, C.stall);
    // goods
    for (let i = 0; i < 8; i++) {
      const gx = cx - 18 + i * 5;
      px(gx, cy - 6, [C.flowerR, C.flowerY, C.flowerB, C.pot][Math.floor(r() * 4)]);
      px(gx + 1, cy - 7, C.flowerY);
    }
  }
  stall(600, 420, C.stallCanopy);
  stall(720, 400, C.stallCanopy2);
  stall(900, 410, C.stallCanopy);
  stall(1000, 430, C.stallCanopy2);

  // Clotheslines
  function clothesline(x0, y0, x1) {
    // posts
    for (let t = 0; t < 40; t++) { px(x0, y0 - t, C.timber); px(x1, y0 - t, C.timber); }
    // line
    const steps = x1 - x0;
    for (let i = 0; i <= steps; i++) px(x0 + i, y0 - 38, '#b0a080');
    // clothes
    const colors = [C.laundry, C.laundry2, C.flowerR, C.flowerB, C.flowerY, C.flowerP];
    for (let i = 0; i < 12; i++) {
      const cx = x0 + 6 + i * 12;
      const col = colors[Math.floor(r() * colors.length)];
      for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < 7; xx++) px(cx + xx, y0 - 37 + yy, col);
    }
  }
  clothesline(150, 340, 290);
  clothesline(1120, 340, 1260);
  clothesline(300, 700, 440);

  // Flowerpots scattered on paving
  for (let i = 0; i < 24; i++) {
    const cx = sqX0 + 20 + Math.floor(r() * (sqX1 - sqX0 - 40));
    const cy = sqY0 + 20 + Math.floor(r() * (sqY1 - sqY0 - 40));
    // avoid well
    if (Math.hypot(cx - 800, cy - 490) < 60) continue;
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 4; xx++) px(cx + xx, cy + yy, C.pot);
    for (let j = 0; j < 4; j++) px(cx + j, cy - 1 - Math.floor(r() * 2), [C.flowerR, C.flowerY, C.flowerB, C.flowerP][Math.floor(r() * 4)]);
  }

  // Carts
  function cart(cx, cy) {
    // body
    for (let yy = 0; yy < 12; yy++) for (let xx = 0; xx < 26; xx++) px(cx + xx, cy + yy, (yy < 2) ? C.cart : C.dirt);
    // wheels
    for (let a = 0; a < 2; a++) {
      const wx = cx + (a === 0 ? 4 : 20);
      const wy = cy + 14;
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        if (dx * dx + dy * dy > 16) continue;
        px(wx + dx, wy + dy, (dx * dx + dy * dy) > 10 ? C.timber : C.timber2);
      }
    }
  }
  cart(340, 520);
  cart(1180, 520);

  // Plants/bushes
  for (let i = 0; i < 40; i++) {
    const cx = Math.floor(r() * W);
    const cy = 120 + Math.floor(r() * (H - 140));
    // avoid buildings roughly by skipping if on cobble? allow
    cluster(cx, cy, 6, 4, [C.treeLeaf, C.treeLeaf2, C.grass0, C.flowerP]);
  }

  // Entry cave marker (left): dark cave mouth
  function caveMouth(cx, cy) {
    for (let yy = -30; yy <= 30; yy++) for (let xx = -20; xx <= 20; xx++) {
      if (xx * xx / 400 + yy * yy / 900 > 1) continue;
      px(cx + xx, cy + yy, (Math.abs(xx) < 6 && yy > -10) ? '#0a0a10' : C.rock2);
    }
    // rock rim
    for (let a = 0; a < 360; a += 4) {
      const rad = a * Math.PI / 180;
      px(cx + Math.floor(Math.cos(rad) * 20), cy + Math.floor(Math.sin(rad) * 30), C.rock0);
    }
  }
  caveMouth(160, 460);
}

export default paintTown;
