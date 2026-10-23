// Volcano biome painting: basalt fields, lava flows and bridges, readable path.
export function paintBiome(ctx, { width = 768, height = 512, index: _index = 0, random = Math.random, pathY } = {}) {
  ctx.imageSmoothingEnabled = false;
  const W = width, H = height;
  const r = () => random();

  const C = {
    bg: '#1a1210', basalt0: '#2a2220', basalt1: '#3a302c', basalt2: '#4a3e38', basalt3: '#5a4e46',
    basaltHi: '#7a6e66', basaltSh: '#1a1410',
    lava0: '#ff3a1a', lava1: '#ff6a2a', lava2: '#ffaa3a', lava3: '#ffc85a',
    lavaCool: '#7a2a1a', lavaSh: '#3a1008',
    ash: '#6a6258', ash2: '#8a8278',
    ember: '#ff9a3a',
    bridge: '#5a4a3a', bridgeHi: '#8a7a66', bridgeSh: '#2a2018',
    path0: '#4a3a2a', path1: '#5a4a38', path2: '#3a2a1a',
    smoke: '#5a5248',
  };

  function fill(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h))); }
  function px(x, y, c) { if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  function cluster(x, y, w, h, colors) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (r() < 0.38) continue;
      px(x + xx, y + yy, colors[Math.floor(r() * colors.length)]);
    }
  }

  // Background
  fill(0, 0, W, H, C.bg);
  // basalt ground texture
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (r() < 0.7) {
      const c = r() < 0.5 ? C.basalt0 : (r() < 0.5 ? C.basalt1 : C.basalt2);
      px(x, y, c);
    }
  }

  const py = (x) => (pathY ? pathY(x) : 300 + Math.sin(x * 0.015) * 24);

  // Lava pools / flows (background + flanks), avoid path band
  function lavaPool(cx, cy, rx, ry) {
    for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx; dx <= rx; dx++) {
      if (dx * dx / (rx * rx) + dy * dy / (ry * ry) > 1) continue;
      const c = (r() < 0.4) ? (r() < 0.5 ? C.lava2 : C.lava3) : (r() < 0.6 ? C.lava1 : C.lava0);
      px(cx + dx, cy + dy, c);
    }
    // cooled crust edge
    for (let dy = -ry - 1; dy <= ry + 1; dy++) for (let dx = -rx - 1; dx <= rx + 1; dx++) {
      if (dx * dx / (rx * rx) + dy * dy / (ry * ry) <= 1) continue;
      if (dx * dx / ((rx + 2) * (rx + 2)) + dy * dy / ((ry + 2) * (ry + 2)) > 1) continue;
      if (r() < 0.6) px(cx + dx, cy + dy, C.lavaCool);
    }
  }

  // background lava (top)
  lavaPool(180, 160, 90, 30);
  lavaPool(460, 140, 110, 34);
  lavaPool(690, 170, 70, 26);
  // side lava (bottom flanks)
  lavaPool(90, 470, 60, 22);
  lavaPool(600, 480, 80, 24);

  // Lava rivers crossing? Keep path clear; rivers as thin flows along bottom/top

  // Bridges over lava along path: stone bridges
  function bridge(cx, cy, w) {
    // supports
    for (let t = 0; t < 18; t++) {
      px(cx - w / 2 + 2, cy + t, C.bridgeSh);
      px(cx - w / 2 + 3, cy + t, C.bridge);
      px(cx + w / 2 - 3, cy + t, C.bridge);
      px(cx + w / 2 - 2, cy + t, C.bridgeSh);
    }
    // deck
    for (let i = 0; i < w; i++) {
      for (let t = 0; t < 6; t++) {
        px(cx - w / 2 + i, cy - t, t < 2 ? C.bridgeHi : C.bridge);
      }
    }
    // planks lines
    for (let i = 0; i < w; i += 4) {
      for (let t = 0; t < 6; t++) px(cx - w / 2 + i, cy - t, C.bridgeSh);
    }
  }
  // bridges at path where lava crosses (draw elevated decks)
  const bridgeXs = [200, 420, 620];
  for (const bx of bridgeXs) {
    const by = py(bx);
    bridge(bx, by + 6, 46);
  }

  // Path corridor (stone/basalt) - keep readable, avoid lava overlap by drawing path
  for (let x = 0; x < W; x++) {
    const c = py(x);
    const top = c - 18, bot = c + 18;
    for (let y = Math.floor(top); y <= Math.floor(bot); y++) {
      if (y < 0 || y >= H) continue;
      const onBridge = bridgeXs.some(bx => Math.abs(x - bx) < 24);
      if (onBridge && y > c - 6 && y < c + 12) continue; // bridge deck replaces
      px(x, y, (Math.abs(y - c) > 14) ? C.path2 : (r() < 0.5 ? C.path0 : C.path1));
    }
  }
  // path texture
  for (let i = 0; i < 700; i++) {
    const x = Math.floor(r() * W);
    const y0 = py(x);
    const y = y0 - 12 + Math.floor(r() * 24);
    if (Math.abs(y - y0) > 16) continue;
    px(x, y, C.path2);
  }

  // Basalt rock clusters / boulders
  function boulder(cx, cy, w, h) {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const nx = (xx - w / 2) / (w / 2);
      const ny = (yy - h / 2) / (h / 2);
      if (nx * nx + ny * ny > 1) continue;
      const c = (yy < h * 0.3) ? C.basaltHi : (yy > h * 0.7 ? C.basaltSh : C.basalt2);
      px(cx + xx - w / 2, cy + yy - h / 2, c);
    }
  }
  for (let i = 0; i < 34; i++) {
    const cx = 20 + Math.floor(r() * (W - 40));
    const cy = (r() < 0.5 ? 120 + Math.floor(r() * 70) : 420 + Math.floor(r() * 70));
    const center = py(cx);
    if (Math.abs(cy - center) < 24) continue;
    boulder(cx, cy, 10 + Math.floor(r() * 16), 8 + Math.floor(r() * 12));
  }

  // Ash deposits
  for (let i = 0; i < 60; i++) {
    const cx = Math.floor(r() * W);
    const cy = 150 + Math.floor(r() * 340);
    const center = py(cx);
    if (Math.abs(cy - center) < 20) continue;
    cluster(cx, cy, 8, 5, [C.ash, C.ash2, C.basalt1]);
  }

  // Embers along lava edges
  for (let i = 0; i < 80; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    if (r() < 0.5) px(x, y, C.ember);
  }

  // Smoke plumes (top)
  for (let i = 0; i < 14; i++) {
    let x = 40 + Math.floor(r() * (W - 80));
    let y = 20 + Math.floor(r() * 60);
    for (let t = 0; t < 30; t++) {
      px(x + Math.floor((r() - 0.5) * 6), y, C.smoke);
      y += 1;
      if (r() < 0.3) x += (r() < 0.5 ? -1 : 1);
    }
  }
}

export default paintBiome;
