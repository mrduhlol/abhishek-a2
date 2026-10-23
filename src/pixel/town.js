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

  // desaturated palette
  const C = {
    grass0: '#6b8a5a', grass1: '#5a7a4a', grass2: '#4a6a3a', grass3: '#3a5a2e',
    grassHi: '#7fa06a',
    dirt: '#8a7252', dirt2: '#6a5238', dirt3: '#4a3a26',
    cobble0: '#9a9488', cobble1: '#7a7468', cobble2: '#b0a898', cobble3: '#5a5448', cobble4: '#c8c0b0',
    plaster: '#e0d0b0', plaster2: '#d0c0a0', plasterSh: '#a89878', plasterHi: '#f0e4c8',
    timber: '#5a3a24', timber2: '#7a5a38', timberHi: '#9a7a58', timberSh: '#3a2418',
    roof: '#d06830', roof2: '#b05020', roof3: '#803818', roofHi: '#e88040', roofDark: '#602810',
    door: '#3a2010', door2: '#5a3420',
    window: '#8ab8d0', windowSh: '#5a88a8', windowFrame: '#4a3020',
    treeTrunk: '#3a2818', treeLeaf: '#4a7a3a', treeLeaf2: '#5a8a4a', treeLeaf3: '#3a6a2a', treeHi: '#7aba5a', treeSh: '#2a4a1e',
    flowerR: '#c04848', flowerY: '#c8b040', flowerB: '#4860a0', flowerP: '#a048a0', flowerW: '#d8d0c0',
    pot: '#905838', pot2: '#704028',
    stall: '#c09858', stallCanopy: '#b04838', stallCanopy2: '#3858a0', stallCanopy3: '#d8c8a8',
    well: '#686868', well2: '#888888', wellWater: '#3a6080', wellRope: '#a09070',
    laundry: '#d8c8b0', laundry2: '#a8b8c8', laundry3: '#c8a8a8',
    cart: '#7a5a38', cartWheel: '#4a3020',
    shadow: '#2a2a20',
  };

  function fill(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h))); }
  function px(x, y, c) { if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  function cluster(x, y, w, h, colors) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (r() < 0.28) continue;
      px(x + xx, y + yy, colors[Math.floor(r() * colors.length)]);
    }
  }
  // ---- Ground: no sky. Grass base with clustered variation ----
  fill(0, 0, W, H, C.grass1);
  // large grass clusters (not single-pixel noise)
  for (let i = 0; i < 260; i++) {
    const cx = Math.floor(r() * W);
    const cy = Math.floor(r() * H);
    const rw = 6 + Math.floor(r() * 18);
    const rh = 4 + Math.floor(r() * 12);
    cluster(cx, cy, rw, rh, [C.grass0, C.grass2, C.grass3, C.grassHi]);
  }
  // dirt patches
  for (let i = 0; i < 90; i++) {
    const cx = Math.floor(r() * W);
    const cy = Math.floor(r() * H);
    cluster(cx, cy, 10 + Math.floor(r() * 24), 6 + Math.floor(r() * 14), [C.dirt, C.dirt2, C.dirt3]);
  }

  // ---- Paths: cobble/dirt bands ----
  function pathBand(x0, y0, x1, y1, width) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.floor(x0 + (x1 - x0) * t);
      const y = Math.floor(y0 + (y1 - y0) * t);
      for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
        const col = (Math.abs(dx) + Math.abs(dy) > width / 2 - 2) ? C.dirt2 : (r() < 0.55 ? C.cobble0 : C.cobble1);
        px(x + dx, y + dy, col);
      }
    }
  }
  // entry to square
  pathBand(160, 460, 560, 470, 28);
  pathBand(200, 500, 560, 470, 20);
  pathBand(560, 470, 800, 490, 28);
  pathBand(1050, 490, 1450, 500, 26);

  // ---- Central square: cobbles with clustered stones ----
  const sqX0 = 540, sqY0 = 350, sqX1 = 1060, sqY1 = 630;
  fill(sqX0, sqY0, sqX1 - sqX0, sqY1 - sqY0, C.cobble1);
  // stone clusters
  for (let y = sqY0; y < sqY1; y += 3) for (let x = sqX0; x < sqX1; x += 3) {
    const col = (r() < 0.33) ? C.cobble0 : (r() < 0.5 ? C.cobble2 : (r() < 0.7 ? C.cobble4 : C.cobble3));
    fill(x, y, 2, 2, col);
  }
  // grout lines
  for (let y = sqY0; y < sqY1; y += 7) fill(sqX0, y, sqX1 - sqX0, 1, C.cobble3);
  for (let x = sqX0; x < sqX1; x += 8) fill(x, sqY0, 1, sqY1 - sqY0, C.cobble3);

  // ---- Building painter (richer) ----
  function building(x, y, w, h, opts = {}) {
    const roofH = opts.roofH || Math.floor(w * 0.45);
    const plaster = opts.plaster || C.plaster;
    const plaster2 = opts.plaster2 || C.plaster2;
    // ground shadow (offset down-right)
    fill(x + 4, y + h + 2, w + 6, 6, C.shadow);
    // walls
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const c = (xx % 6 === 0 || yy % 5 === 0) ? plaster2 : plaster;
      px(x + xx, y + yy, c);
    }
    // timber frame: thick posts + beams
    const postW = 3;
    // vertical posts at edges and middle
    const posts = [0, Math.floor(w / 2) - 1, w - postW];
    for (const p of posts) for (let yy = 0; yy < h; yy++) for (let t = 0; t < postW; t++) {
      px(x + p + t, y + yy, (t === 0) ? C.timberHi : (t === postW - 1 ? C.timberSh : C.timber));
    }
    // horizontal beams
    for (let b = 0; b < 3; b++) {
      const by = y + Math.floor(h * (b / 2.5));
      for (let xx = 0; xx < w; xx++) {
        for (let t = 0; t < 3; t++) px(x + xx, by + t, (t === 0) ? C.timberHi : (t === 2 ? C.timberSh : C.timber));
      }
    }
    // diagonal braces in panels
    if (opts.brace) {
      for (let i = 0; i < h; i++) {
        const xx = Math.floor(i * (w / h));
        for (let t = 0; t < 2; t++) px(x + xx + t, y + i, C.timber2);
      }
    }
    // plaster texture clusters
    for (let i = 0; i < Math.floor(w * h / 18); i++) {
      px(x + Math.floor(r() * w), y + Math.floor(r() * h), r() < 0.5 ? C.plasterHi : C.plasterSh);
    }
    // right-side shadow
    for (let yy = 0; yy < h; yy++) for (let t = 0; t < 4; t++) px(x + w - 1 - t, y + yy, C.plasterSh);
    // top highlight
    for (let xx = 0; xx < w; xx++) px(x + xx, y, C.plasterHi);

    // ---- Pitched roof ----
    // roof covers wall top with overhang; front slope (lighter) and side slope (darker)
    const over = 6;
    for (let t = 0; t < roofH; t++) {
      const inset = Math.floor(t * 0.6);
      const left = x - over + inset;
      const right = x + w - 1 + over - inset;
      for (let xx = left; xx <= right; xx++) {
        // front slope vs side slope: left half lighter, right half darker
        const col = (xx < x + w / 2) ? (t < 3 ? C.roofHi : C.roof) : (t < 3 ? C.roof2 : C.roofDark);
        px(xx, y - t, col);
      }
    }
    // ridge cap
    const ridgeLeft = x - over + Math.floor(roofH * 0.6);
    const ridgeRight = x + w - 1 + over - Math.floor(roofH * 0.6);
    for (let xx = ridgeLeft; xx <= ridgeRight; xx++) {
      px(xx, y - roofH, C.roof3);
      px(xx, y - roofH - 1, C.roofDark);
    }
    // gable ends (triangular fill at left/right)
    for (let t = 0; t < roofH; t++) {
      const inset = Math.floor(t * 0.6);
      // left gable
      px(x - over + inset - 1, y - t, C.roofDark);
      // right gable
      px(x + w - 1 + over - inset + 1, y - t, C.roofDark);
    }
    // roof tile texture clusters
    for (let t = 2; t < roofH - 2; t++) for (let k = 0; k < Math.floor(w / 6); k++) {
      const xx = x - over + Math.floor(t * 0.6) + 3 + k * 6 + (t % 2) * 3;
      if (xx > x + w + over - Math.floor(t * 0.6)) continue;
      px(xx, y - t, C.roof3);
      px(xx + 1, y - t, C.roof3);
    }

    // ---- Door ----
    const doorW = opts.doorW || 14;
    const doorH = opts.doorH || 22;
    const doorX = x + Math.floor(w / 2) - Math.floor(doorW / 2);
    const doorY = y + h - doorH;
    // frame
    for (let yy = -1; yy <= doorH; yy++) for (let t = 0; t < 2; t++) {
      px(doorX - 1 - t, doorY + yy, C.timber);
      px(doorX + doorW + t, doorY + yy, C.timber);
    }
    for (let xx = -1; xx <= doorW; xx++) px(doorX + xx, doorY - 1, C.timber);
    // door panels
    for (let yy = 0; yy < doorH; yy++) for (let xx = 0; xx < doorW; xx++) {
      const c = (xx < doorW / 2) ? (yy % 7 < 3 ? C.door : C.door2) : (yy % 7 < 3 ? C.door2 : C.door);
      px(doorX + xx, doorY + yy, c);
    }
    // handle
    px(doorX + doorW - 3, doorY + Math.floor(doorH / 2), C.roofHi);
    px(doorX + doorW - 2, doorY + Math.floor(doorH / 2), C.roofHi);

    // ---- Windows ----
    const winCount = opts.windows || 2;
    const winW = 12, winH = 12;
    for (let wi = 0; wi < winCount; wi++) {
      const wx = x + 8 + wi * Math.floor((w - 16) / Math.max(1, winCount - 1 + 0.001));
      if (winCount === 1) {} 
      const wy = y + 8 + (wi % 2) * 4;
      // frame
      for (let yy = -1; yy <= winH; yy++) for (let t = 0; t < 2; t++) {
        px(wx - 1 - t, wy + yy, C.windowFrame);
        px(wx + winW + t, wy + yy, C.windowFrame);
      }
      for (let xx = -1; xx <= winW; xx++) { px(wx + xx, wy - 1, C.windowFrame); px(wx + xx, wy + winH, C.windowFrame); }
      // glass
      for (let yy = 0; yy < winH; yy++) for (let xx = 0; xx < winW; xx++) {
        px(wx + xx, wy + yy, (xx + yy) % 4 === 0 ? C.windowSh : C.window);
      }
      // cross
      for (let yy = 0; yy < winH; yy++) px(wx + Math.floor(winW / 2), wy + yy, C.windowFrame);
      for (let xx = 0; xx < winW; xx++) px(wx + xx, wy + Math.floor(winH / 2), C.windowFrame);
      // shutters
      for (let yy = 0; yy < winH; yy++) {
        px(wx - 3, wy + yy, C.timber2);
        px(wx - 4, wy + yy, C.timber);
        px(wx + winW + 2, wy + yy, C.timber2);
        px(wx + winW + 3, wy + yy, C.timber);
      }
    }

    // flowerpot near door (larger)
    if (opts.pot !== false) {
      const potX = doorX + doorW + 6;
      const potY = y + h - 8;
      for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 6; xx++) {
        px(potX + xx, potY + yy, (yy < 2) ? C.pot2 : C.pot);
      }
      // rim
      for (let xx = 0; xx < 6; xx++) px(potX + xx, potY, C.pot2);
      // flowers cluster
      const fcols = [C.flowerR, C.flowerY, C.flowerB, C.flowerP, C.flowerW];
      for (let i = 0; i < 7; i++) {
        const fx = potX + 1 + Math.floor(r() * 4);
        const fy = potY - 2 - Math.floor(r() * 4);
        px(fx, fy, fcols[Math.floor(r() * fcols.length)]);
        px(fx, fy - 1, fcols[Math.floor(r() * fcols.length)]);
      }
      // leaves
      for (let i = 0; i < 4; i++) px(potX + 1 + Math.floor(r() * 4), potY - 1, C.treeLeaf);
    }
  }

  // ---- Place buildings in clusters (tucked) ----
  const buildings = [
    // top row
    { x: 120, y: 200, w: 170, h: 100, opts: { windows: 2, brace: true } },
    { x: 310, y: 190, w: 140, h: 90, opts: { windows: 2 } },
    { x: 470, y: 180, w: 160, h: 105, opts: { windows: 3, brace: true } },
    { x: 690, y: 140, w: 230, h: 120, opts: { windows: 4, doorW: 16, roofH: 110, brace: true } },
    { x: 950, y: 170, w: 150, h: 95, opts: { windows: 2 } },
    { x: 1120, y: 185, w: 170, h: 100, opts: { windows: 3, brace: true } },
    { x: 1310, y: 200, w: 150, h: 95, opts: { windows: 2 } },
    // left column
    { x: 60, y: 340, w: 130, h: 90, opts: { windows: 2 } },
    { x: 60, y: 455, w: 120, h: 85, opts: { windows: 1, brace: true } },
    // right column
    { x: 1110, y: 340, w: 140, h: 95, opts: { windows: 2 } },
    { x: 1120, y: 460, w: 130, h: 90, opts: { windows: 2, brace: true } },
    // bottom row
    { x: 240, y: 620, w: 170, h: 95, opts: { windows: 2, brace: true } },
    { x: 430, y: 630, w: 150, h: 90, opts: { windows: 2 } },
    { x: 610, y: 640, w: 140, h: 85, opts: { windows: 1 } },
    { x: 790, y: 640, w: 150, h: 90, opts: { windows: 2 } },
    { x: 970, y: 630, w: 160, h: 95, opts: { windows: 2, brace: true } },
    { x: 1160, y: 620, w: 170, h: 95, opts: { windows: 2 } },
  ];
  for (const b of buildings) building(b.x, b.y, b.w, b.h, b.opts);

  // ---- Well (detailed) ----
  function well(cx, cy) {
    // shadow
    fill(cx - 18, cy + 12, 40, 8, C.shadow);
    // base ring
    for (let yy = -12; yy <= 12; yy++) for (let xx = -16; xx <= 16; xx++) {
      if (xx * xx / 256 + yy * yy / 144 > 1) continue;
      px(cx + xx, cy + yy, (xx * xx + yy * yy) > 120 ? C.well : C.well2);
    }
    // inner water
    for (let yy = -7; yy <= 7; yy++) for (let xx = -10; xx <= 10; xx++) {
      if (xx * xx / 100 + yy * yy / 49 > 1) continue;
      px(cx + xx, cy + yy, (r() < 0.25) ? C.wellWater : '#2a5070');
    }
    // water highlight
    for (let i = 0; i < 6; i++) px(cx - 6 + i * 2, cy - 2, '#6a9ac0');
    // posts
    for (let t = 0; t < 30; t++) {
      for (let w = 0; w < 3; w++) {
        px(cx - 16 + w, cy - 12 - t, C.timber);
        px(cx + 13 + w, cy - 12 - t, C.timber);
      }
    }
    // crossbeam
    for (let xx = -18; xx <= 18; xx++) for (let t = 0; t < 3; t++) px(cx + xx, cy - 42 + t, C.timber2);
    // roof (small pitched)
    for (let t = 0; t < 10; t++) {
      const inset = Math.floor(t * 0.5);
      for (let xx = -18 + inset; xx <= 18 - inset; xx++) px(cx + xx, cy - 42 - t, (xx < cx) ? C.roof : C.roof2);
    }
    // bucket + rope
    for (let t = 0; t < 22; t++) px(cx + 2, cy - 14 - t, C.wellRope);
    for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 7; xx++) px(cx - 2 + xx, cy - 16 + yy, C.pot);
  }
  well(800, 490);

  // ---- Trees (richer, overlapping canopy clusters) ----
  function tree(cx, cy, size = 1) {
    const trunkH = Math.floor(20 * size);
    const trunkW = Math.max(2, Math.floor(3 * size));
    // shadow
    fill(cx - Math.floor(6 * size), cy + 2, Math.floor(12 * size), 4, C.shadow);
    // trunk
    for (let t = 0; t < trunkH; t++) for (let xx = -Math.floor(trunkW / 2); xx <= Math.floor(trunkW / 2); xx++) {
      px(cx + xx, cy - t, (xx < 0) ? C.treeTrunk : C.timber2);
    }
    // roots
    for (let i = 0; i < 3; i++) {
      const rx = cx + (i - 1) * 3;
      px(rx, cy + 1, C.treeTrunk); px(rx + 1, cy + 2, C.treeTrunk);
    }
    // canopy layers (3 clusters overlapping)
    const layers = [
      { r: Math.floor(16 * size), offY: 0, col: C.treeLeaf3 },
      { r: Math.floor(13 * size), offY: -4, col: C.treeLeaf },
      { r: Math.floor(10 * size), offY: -8, col: C.treeLeaf2 },
    ];
    for (const L of layers) {
      for (let dy = -L.r; dy <= L.r; dy++) for (let dx = -L.r; dx <= L.r; dx++) {
        if (dx * dx + dy * dy > L.r * L.r) continue;
        if (r() < 0.22) continue;
        const col = (dx < -L.r / 3) ? C.treeHi : ((dy < -L.r / 2) ? C.treeLeaf2 : L.col);
        px(cx + dx, cy - trunkH + L.offY + dy, col);
      }
    }
    const R = Math.floor(13 * size);
    // highlight cluster top-left
    for (let i = 0; i < Math.floor(6 * size); i++) {
      px(cx - Math.floor(R / 2) + Math.floor(r() * 6), cy - trunkH - Math.floor(R * 0.6) + Math.floor(r() * 4), C.treeHi);
    }
    // shadow cluster bottom-right
    for (let i = 0; i < Math.floor(6 * size); i++) {
      px(cx + Math.floor(R / 3) + Math.floor(r() * 6), cy - trunkH + Math.floor(R * 0.3) + Math.floor(r() * 4), C.treeSh);
    }
  }
  const trees = [
    [110, 150, 1.1], [250, 140, 0.95], [410, 130, 1.25], [1090, 150, 1.05], [1250, 140, 1.15], [1410, 160, 0.95],
    [50, 600, 1.0], [195, 690, 1.15], [1460, 610, 1.0], [1510, 690, 0.95],
    [490, 320, 0.85], [1090, 320, 0.85], [590, 610, 0.75], [940, 610, 0.75],
    [300, 300, 0.7], [760, 300, 0.7], [1200, 300, 0.7],
  ];
  for (const [tx, ty, sz] of trees) tree(tx, ty, sz);

  // ---- Stalls (detailed) ----
  function stall(cx, cy, canopyColor, canopyColor2) {
    // shadow
    fill(cx - 24, cy + 4, 52, 6, C.shadow);
    // posts
    for (let t = 0; t < 32; t++) for (let w = 0; w < 3; w++) {
      px(cx - 24 + w, cy - t, C.timber);
      px(cx + 21 + w, cy - t, C.timber);
    }
    // canopy (pitched)
    for (let t = 0; t < 12; t++) {
      const inset = Math.floor(t * 0.5);
      for (let xx = -26 + inset; xx <= 26 - inset; xx++) {
        px(cx + xx, cy - 32 + t, (t % 2 === 0) ? canopyColor : canopyColor2);
      }
    }
    // canopy fringe
    for (let xx = -26; xx <= 26; xx++) px(cx + xx, cy - 20, C.timber);
    // counter
    for (let yy = 0; yy < 7; yy++) for (let xx = -22; xx <= 22; xx++) {
      px(cx + xx, cy - 6 + yy, (yy < 2) ? C.stall : C.dirt2);
    }
    // counter front panel
    for (let xx = -22; xx <= 22; xx++) px(cx + xx, cy + 1, C.timber);
    // goods on counter
    for (let i = 0; i < 10; i++) {
      const gx = cx - 20 + i * 4 + Math.floor(r() * 2);
      const col = [C.flowerR, C.flowerY, C.flowerB, C.pot, C.flowerW, C.flowerP][Math.floor(r() * 6)];
      px(gx, cy - 8, col); px(gx + 1, cy - 9, col);
      px(gx, cy - 7, C.pot2);
    }
    // hanging items
    for (let i = 0; i < 4; i++) {
      const hx = cx - 18 + i * 12;
      for (let yy = 0; yy < 8; yy++) px(hx, cy - 30 + yy, [C.laundry, C.laundry2, C.laundry3][Math.floor(r() * 3)]);
    }
  }
  stall(600, 420, C.stallCanopy, C.stallCanopy2);
  stall(720, 400, C.stallCanopy2, C.stallCanopy3);
  stall(900, 410, C.stallCanopy, C.stallCanopy3);
  stall(1000, 430, C.stallCanopy3, C.stallCanopy2);

  // ---- Clotheslines ----
  function clothesline(x0, y0, x1) {
    for (let t = 0; t < 42; t++) for (let w = 0; w < 3; w++) {
      px(x0 + w, y0 - t, C.timber);
      px(x1 + w, y0 - t, C.timber);
    }
    const steps = x1 - x0;
    for (let i = 0; i <= steps; i++) px(x0 + i, y0 - 40, '#a09070');
    const colors = [C.laundry, C.laundry2, C.laundry3, C.flowerR, C.flowerB, C.flowerY];
    for (let i = 0; i < 14; i++) {
      const cx = x0 + 6 + i * 11;
      const col = colors[Math.floor(r() * colors.length)];
      const len = 8 + Math.floor(r() * 6);
      for (let yy = 0; yy < len; yy++) for (let xx = 0; xx < 7; xx++) px(cx + xx, y0 - 39 + yy, col);
      // pegs
      px(cx, y0 - 40, C.timber2); px(cx + 6, y0 - 40, C.timber2);
    }
  }
  clothesline(150, 340, 290);
  clothesline(1120, 340, 1260);
  clothesline(300, 700, 440);

  // ---- Flowerpots on paving (clustered) ----
  for (let i = 0; i < 28; i++) {
    const cx = sqX0 + 24 + Math.floor(r() * (sqX1 - sqX0 - 48));
    const cy = sqY0 + 24 + Math.floor(r() * (sqY1 - sqY0 - 48));
    if (Math.hypot(cx - 800, cy - 490) < 70) continue;
    // pot
    for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 5; xx++) px(cx + xx, cy + yy, (yy < 2) ? C.pot2 : C.pot);
    for (let xx = 0; xx < 5; xx++) px(cx + xx, cy, C.pot2);
    // plant cluster
    const fcols = [C.flowerR, C.flowerY, C.flowerB, C.flowerP, C.flowerW];
    for (let j = 0; j < 6; j++) {
      const fx = cx + 1 + Math.floor(r() * 3);
      const fy = cy - 1 - Math.floor(r() * 3);
      px(fx, fy, fcols[Math.floor(r() * fcols.length)]);
    }
    for (let j = 0; j < 3; j++) px(cx + 1 + Math.floor(r() * 3), cy - 1, C.treeLeaf);
  }

  // ---- Carts ----
  function cart(cx, cy) {
    fill(cx - 2, cy - 2, 30, 14, C.shadow);
    for (let yy = 0; yy < 12; yy++) for (let xx = 0; xx < 28; xx++) {
      px(cx + xx, cy + yy, (yy < 2) ? C.cart : (r() < 0.5 ? C.dirt : C.dirt2));
    }
    // side panel
    for (let yy = 2; yy < 12; yy++) for (let t = 0; t < 3; t++) px(cx + t, cy + yy, C.timber);
    for (let yy = 2; yy < 12; yy++) for (let t = 0; t < 3; t++) px(cx + 25 + t, cy + yy, C.timber);
    // wheels
    for (let a = 0; a < 2; a++) {
      const wx = cx + (a === 0 ? 5 : 21);
      const wy = cy + 14;
      for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
        if (dx * dx + dy * dy > 25) continue;
        px(wx + dx, wy + dy, (dx * dx + dy * dy) > 16 ? C.cartWheel : C.timber2);
      }
      // hub
      px(wx, wy, C.timberHi); px(wx + 1, wy, C.timberHi);
    }
    // handle
    for (let i = 0; i < 10; i++) px(cx + 28 + i, cy + 4, C.timber);
  }
  cart(340, 520);
  cart(1180, 520);

  // ---- Entry cave mouth (left) ----
  function caveMouth(cx, cy) {
    fill(cx - 24, cy - 34, 48, 68, C.shadow);
    for (let yy = -30; yy <= 30; yy++) for (let xx = -22; xx <= 22; xx++) {
      if (xx * xx / 484 + yy * yy / 900 > 1) continue;
      const edge = (xx * xx / 484 + yy * yy / 900) > 0.85;
      px(cx + xx, cy + yy, edge ? C.timber : (Math.abs(xx) < 8 && yy > -5 ? '#0a0a10' : C.dirt3));
    }
    // rock rim
    for (let a = 0; a < 360; a += 3) {
      const rad = a * Math.PI / 180;
      px(cx + Math.floor(Math.cos(rad) * 22), cy + Math.floor(Math.sin(rad) * 30), C.timber);
      px(cx + Math.floor(Math.cos(rad) * 21), cy + Math.floor(Math.sin(rad) * 29), C.dirt3);
    }
  }
  caveMouth(160, 460);

  // ---- Bushes/plants in clusters (not noise) ----
  for (let i = 0; i < 60; i++) {
    const cx = Math.floor(r() * W);
    const cy = Math.floor(r() * H);
    // avoid central square interior? allow edges
    const rw = 6 + Math.floor(r() * 8);
    const rh = 4 + Math.floor(r() * 6);
    cluster(cx, cy, rw, rh, [C.treeLeaf, C.treeLeaf2, C.treeLeaf3, C.flowerP]);
  }
}

export default paintTown;
