// Cave biome painting: luminous crystal cave with readable path.
export function paintBiome(ctx, { width = 768, height = 512, index = 0, random = Math.random, pathY } = {}) {
  ctx.imageSmoothingEnabled = false;
  const W = width, H = height;
  const r = () => random();

  const C = {
    bg0: '#0a0e18', bg1: '#121a28', bg2: '#1c2636',
    rock0: '#2a3244', rock1: '#3a4458', rock2: '#4a5568', rock3: '#5a6678',
    rockHi: '#7a8898', rockSh: '#1a2030',
    path0: '#3a3428', path1: '#4a4434', path2: '#5a5440', path3: '#2a2418',
    crystalCyan: '#5fe7ff', crystalCyan2: '#2fc0e0', crystalCyanSh: '#1a7a90',
    crystalMag: '#ff5fd6', crystalMag2: '#c02f9a', crystalMagSh: '#7a1a5a',
    crystalYel: '#ffe066', crystalYel2: '#d0a030',
    glow: '#9ff0ff',
    water: '#1a3a4a', waterHi: '#3a6a7a',
    moss: '#2f5a3f',
  };

  function fill(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h))); }
  function px(x, y, c) { if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  function cluster(x, y, w, h, colors) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (r() < 0.4) continue;
      px(x + xx, y + yy, colors[Math.floor(r() * colors.length)]);
    }
  }

  // Background rock wall
  fill(0, 0, W, H, C.bg0);
  // layered rock bands
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = Math.sin(x * 0.05 + y * 0.03 + index) * 0.5 + 0.5;
      if (v > 0.62) px(x, y, C.bg2);
      else if (v > 0.45) px(x, y, C.bg1);
    }
  }

  const py = (x) => (pathY ? pathY(x) : 300 + Math.sin(x * 0.013) * 22);

  // Cave floor base (lower half emphasis)
  for (let y = 200; y < H; y++) for (let x = 0; x < W; x++) {
    if (r() < 0.85) {
      const c = (y > 420) ? C.rock0 : C.rock1;
      px(x, y, c);
    }
  }

  // Path corridor
  for (let x = 0; x < W; x++) {
    const c = py(x);
    const top = c - 18, bot = c + 18;
    for (let y = Math.floor(top); y <= Math.floor(bot); y++) {
      if (y < 0 || y >= H) continue;
      px(x, y, (Math.abs(y - c) > 14) ? C.path3 : (r() < 0.5 ? C.path1 : C.path0));
    }
  }
  // path texture
  for (let i = 0; i < 900; i++) {
    const x = Math.floor(r() * W);
    const y0 = py(x);
    const y = y0 - 12 + Math.floor(r() * 24);
    if (Math.abs(y - y0) > 16) continue;
    px(x, y, r() < 0.5 ? C.path2 : C.path3);
  }

  // Stalactites from top
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(r() * W);
    const h = 12 + Math.floor(r() * 40);
    for (let t = 0; t < h; t++) {
      const w = Math.max(1, 4 - Math.floor(t / 6));
      for (let j = 0; j < w; j++) px(x + j - Math.floor(w / 2), t, t < 3 ? C.rockHi : (t < h - 3 ? C.rock2 : C.rock1));
    }
  }

  // Stalagmites on floor (avoid path)
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(r() * W);
    const cy = 400 + Math.floor(r() * 90);
    const center = py(x);
    if (Math.abs(cy - center) < 24) continue;
    const h = 10 + Math.floor(r() * 28);
    for (let t = 0; t < h; t++) {
      const w = Math.max(1, 4 - Math.floor(t / 6));
      for (let j = 0; j < w; j++) px(x + j - Math.floor(w / 2), cy - t, t < 2 ? C.rockHi : C.rock2);
    }
  }

  // Crystals
  function crystal(cx, cy, color, color2, sh, size) {
    // base cluster
    for (let i = 0; i < size; i++) {
      const hx = cx + Math.floor((r() - 0.5) * size);
      const hy = cy - Math.floor(r() * size * 1.5);
      const h = 6 + Math.floor(r() * 14);
      for (let t = 0; t < h; t++) {
        px(hx, hy - t, t < 2 ? color : (t < h - 2 ? color2 : sh));
        if (t % 2 === 0) px(hx + 1, hy - t, color2);
      }
    }
    // glow pixels around
    for (let i = 0; i < 8; i++) {
      const gx = cx - 6 + Math.floor(r() * 16);
      const gy = cy - 6 - Math.floor(r() * 16);
      px(gx, gy, C.glow);
    }
  }

  const crystalSets = [
    [C.crystalCyan, C.crystalCyan2, C.crystalCyanSh],
    [C.crystalMag, C.crystalMag2, C.crystalMagSh],
    [C.crystalYel, C.crystalYel2, C.crystalCyanSh],
  ];
  for (let i = 0; i < 26; i++) {
    const cx = 20 + Math.floor(r() * (W - 40));
    const cy = 220 + Math.floor(r() * 260);
    const center = py(cx);
    if (Math.abs(cy - center) < 20) continue;
    const set = crystalSets[Math.floor(r() * crystalSets.length)];
    crystal(cx, cy, set[0], set[1], set[2], 2 + Math.floor(r() * 3));
  }

  // Background crystal wall glow patches
  for (let i = 0; i < 12; i++) {
    const cx = Math.floor(r() * W);
    const cy = 120 + Math.floor(r() * 120);
    for (let dy = -10; dy <= 10; dy++) for (let dx = -10; dx <= 10; dx++) {
      if (dx * dx + dy * dy > 100) continue;
      if (r() < 0.7) px(cx + dx, cy + dy, r() < 0.5 ? C.crystalCyan2 : C.crystalMag2);
    }
  }

  // Water pools off path
  for (let i = 0; i < 6; i++) {
    const cx = Math.floor(r() * W);
    const cy = 420 + Math.floor(r() * 70);
    const center = py(cx);
    if (Math.abs(cy - center) < 26) continue;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -12; dx <= 12; dx++) {
      if (dx * dx / 144 + dy * dy / 16 > 1) continue;
      px(cx + dx, cy + dy, r() < 0.3 ? C.waterHi : C.water);
    }
  }

  // Moss clusters
  for (let i = 0; i < 50; i++) {
    const cx = Math.floor(r() * W);
    const cy = 200 + Math.floor(r() * 290);
    const center = py(cx);
    if (Math.abs(cy - center) < 20) continue;
    cluster(cx, cy, 5, 3, [C.moss, C.rock1, C.rock2]);
  }
}

export default paintBiome;
