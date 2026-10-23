// Desert biome painting: warm sandstone country, truck road, arches, ruins, cacti.
export function paintBiome(ctx, { width = 768, height = 512, index = 0, random = Math.random, pathY } = {}) {
  ctx.imageSmoothingEnabled = false;
  const W = width, H = height;
  const r = () => random();

  const C = {
    skyTop: '#f2d08a', skyBot: '#d99a5a',
    sand0: '#e8c47a', sand1: '#d6ad66', sand2: '#b98a4f', sand3: '#8f6a3a',
    rock0: '#b08a5a', rock1: '#8f6b42', rock2: '#6b4a2e', rock3: '#4a3320',
    ruin: '#9a7a56', ruinSh: '#5c4430',
    cactus: '#4a7a4a', cactusSh: '#2f5233', cactusHi: '#6fa06f',
    road: '#c9a06a', roadEdge: '#a07a48',
    scrub: '#7a8a4a',
  };

  function fill(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h))); }
  function px(x, y, c) { if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  function cluster(x, y, w, h, colors) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (r() < 0.35) continue;
      px(x + xx, y + yy, colors[Math.floor(r() * colors.length)]);
    }
  }

  // Sky band (flat blocks, no gradient)
  const skyH = 150;
  fill(0, 0, W, skyH, C.skyTop);
  fill(0, skyH - 20, W, 20, C.skyBot);
  // distant dunes silhouette
  for (let x = 0; x < W; x += 4) {
    const hh = 20 + Math.sin(x * 0.012 + index) * 12 + Math.sin(x * 0.03) * 6;
    fill(x, skyH - hh, 4, hh, C.sand3);
  }

  // Ground base
  fill(0, skyH, W, H - skyH, C.sand1);
  // texture clusters across ground
  for (let i = 0; i < 1800; i++) {
    const x = Math.floor(r() * W);
    const y = skyH + Math.floor(r() * (H - skyH));
    const c = r() < 0.5 ? C.sand0 : (r() < 0.5 ? C.sand2 : C.sand3);
    px(x, y, c);
    if (r() < 0.25) px(x + 1, y, c);
  }

  // Path corridor center
  const py = (x) => (pathY ? pathY(x) : 300 + Math.sin(x * 0.01) * 20);
  // Road band
  for (let x = 0; x < W; x++) {
    const c = py(x);
    const top = c - 18, bot = c + 18;
    for (let y = Math.floor(top); y <= Math.floor(bot); y++) {
      if (y < 0 || y >= H) continue;
      const edge = (y < top + 3 || y > bot - 3);
      px(x, y, edge ? C.roadEdge : C.road);
    }
  }
  // road texture
  for (let i = 0; i < 600; i++) {
    const x = Math.floor(r() * W);
    const y0 = py(x);
    const y = y0 - 14 + Math.floor(r() * 28);
    px(x, y, r() < 0.5 ? C.sand2 : C.sand3);
  }

  // Helper: rock arch
  function arch(cx, cy, w, h) {
    // pillars
    for (let t = 0; t < h; t++) {
      for (let i = 0; i < 10; i++) {
        px(cx - w / 2 + i, cy + t, t < 4 ? C.rock0 : C.rock1);
        px(cx + w / 2 - 10 + i, cy + t, t < 4 ? C.rock0 : C.rock1);
      }
    }
    // top span
    for (let i = 0; i < w; i++) {
      const yy = cy - 6 + Math.sin(i / w * Math.PI) * -4;
      for (let t = 0; t < 12; t++) px(cx - w / 2 + i, yy + t, t < 3 ? C.rock0 : C.rock2);
    }
    // highlight left
    for (let t = 0; t < h; t++) { px(cx - w / 2, cy + t, C.rock0); px(cx - w / 2 + 1, cy + t, C.rock0); }
    // shadow right
    for (let t = 0; t < h; t++) { px(cx + w / 2 - 1, cy + t, C.rock3); px(cx + w / 2 - 2, cy + t, C.rock2); }
  }

  // Place arches in background (top) and foreground (bottom) avoiding path band
  const arches = [
    [120, 170, 90, 70],
    [360, 150, 110, 80],
    [600, 180, 80, 65],
  ];
  for (const [cx, cy, w, h] of arches) {
    arch(cx, cy, w, h);
  }

  // Ruins: low walls
  function ruin(cx, cy, w, h) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (yy > h - 3 && r() < 0.4) continue;
      px(cx + xx, cy + yy, (xx + yy) % 3 === 0 ? C.ruinSh : C.ruin);
    }
    // top highlight
    for (let xx = 0; xx < w; xx++) px(cx + xx, cy, C.rock0);
  }
  const ruins = [[50, 360, 60, 24], [260, 400, 70, 20], [520, 380, 50, 22], [700, 360, 40, 18]];
  for (const [cx, cy, w, h] of ruins) ruin(cx, cy, w, h);

  // Cacti
  function cactus(cx, cy, h) {
    // trunk
    for (let t = 0; t < h; t++) {
      px(cx, cy - t, C.cactus);
      px(cx + 1, cy - t, C.cactus);
      if (t % 4 === 0) { px(cx - 1, cy - t, C.cactusSh); px(cx + 2, cy - t, C.cactusHi); }
    }
    // arms
    for (let a = 0; a < 2; a++) {
      const ay = cy - Math.floor(h * (0.4 + a * 0.25));
      const dir = a === 0 ? -1 : 1;
      for (let i = 0; i < 8; i++) {
        px(cx + dir * (2 + i), ay - i, C.cactus);
        px(cx + dir * (2 + i), ay - i + 1, C.cactusSh);
      }
      for (let i = 0; i < 6; i++) px(cx + dir * 9, ay - 7 + i, C.cactus);
    }
    // highlight
    px(cx, cy - h + 1, C.cactusHi);
  }
  // place cacti avoiding path band
  const cactiPositions = [];
  for (let i = 0; i < 14; i++) {
    const cx = 30 + Math.floor(r() * (W - 60));
    const cy = (r() < 0.5 ? 120 + Math.floor(r() * 60) : 420 + Math.floor(r() * 70));
    // avoid path band
    const center = py(cx);
    if (Math.abs(cy - center) < 26) continue;
    cactiPositions.push([cx, cy, 24 + Math.floor(r() * 18)]);
  }
  for (const [cx, cy, h] of cactiPositions) cactus(cx, cy, h);

  // Scrub clusters
  for (let i = 0; i < 40; i++) {
    const cx = Math.floor(r() * W);
    const cy = 160 + Math.floor(r() * 330);
    const center = py(cx);
    if (Math.abs(cy - center) < 22) continue;
    cluster(cx, cy, 6, 4, [C.scrub, C.cactus, C.sand2]);
  }

  // foreground sand ripples near bottom
  for (let y = H - 60; y < H; y++) {
    for (let x = 0; x < W; x += 3) {
      if (r() < 0.4) px(x, y, (x + y) % 7 === 0 ? C.sand3 : C.sand2);
    }
  }
}

export default paintBiome;
