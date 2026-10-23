// Pixel adventure vehicles. Original, code-authored Canvas2D pixel artwork.
//
// Public API
//   drawVehicle(ctx, { kind = 'boat', frame = 0 })
//
// Both vehicles paint onto a transparent 96 x 64 context. Direction is authored
// facing right; the caller may mirror the texture. The hull/body never bob with
// animation frames so an overlaid hero stays seated, while water, wheels, dust
// and lanterns animate. No DOM, random values or external assets are used.
//
// Seat anchors (pixel coordinates, hero soles line):
//   boat  { x: 48, y: 38 }  on the centre bench, clear of both gunwales
//   truck { x: 48, y: 36 }  inside the cab, visible through the side window
// The hero is overlaid by the caller; neither vehicle paints an opaque figure.

export const VEHICLE_WIDTH = 96;
export const VEHICLE_HEIGHT = 64;
export const VEHICLE_SEATS = Object.freeze({
  boat: Object.freeze({ x: 48, y: 38 }),
  truck: Object.freeze({ x: 48, y: 36 }),
});

const INK = '#211a23';
const WOOD = '#8a5a36';
const WOOD_LIGHT = '#b57a48';
const WOOD_PALE = '#d7a46a';
const WOOD_DARK = '#5d3a22';
const WOOD_DEEP = '#3d2417';
const CREAM = '#e2d2ac';
const CREAM_LIGHT = '#f6e9c9';
const CREAM_DARK = '#b39b72';
const WATER_DEEP = '#173f47';
const WATER_MID = '#23616a';
const WATER_LIGHT = '#3d8890';
const FOAM = '#b9d9cf';
const FOAM_LIGHT = '#e3f0e5';
const METAL = '#9aa3a4';
const METAL_LIGHT = '#c8d0cb';
const METAL_DARK = '#5b6668';
const GOLD = '#d7a84e';

const floor = Math.floor;
const wrap = (value, length) => ((value % length) + length) % length;

function px(ctx, color, x, y, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function pixelLine(ctx, x0, y0, x1, y1, color, width) {
  const steps = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
  const half = floor(width / 2);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    px(ctx, color, Math.round(x0 + (x1 - x0) * t) - half,
      Math.round(y0 + (y1 - y0) * t) - half, width, width);
  }
}

/**
 * Paint one vehicle onto a transparent 96x64 context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{kind?:'boat'|'truck',frame?:number}} [options]
 */
export function drawVehicle(ctx, options = {}) {
  if (!ctx) return;
  const kind = String(options.kind || 'boat').toLowerCase();
  const frameValue = Number(options.frame);
  const frame = Number.isFinite(frameValue) ? Math.abs(floor(frameValue)) : 0;
  if (kind === 'truck' || kind === 'pickup' || kind === 'car') drawTruck(ctx, frame);
  else drawBoat(ctx, frame);
}

// A hand-authored section outline keeps the hull readable as a solid wooden
// bowl rather than a collection of unrelated rectangles.
const HULL = [
  [33, 20, 64], [34, 17, 70], [35, 15, 76], [36, 14, 82], [37, 13, 86],
  [38, 12, 89], [39, 11, 90], [40, 10, 91], [41, 10, 91], [42, 9, 91],
  [43, 9, 91], [44, 10, 90], [45, 11, 89], [46, 12, 88], [47, 14, 86],
  [48, 16, 84], [49, 18, 82], [50, 21, 79], [51, 24, 76], [52, 28, 72],
  [53, 32, 68], [54, 37, 63], [55, 43, 57], [56, 48, 52],
];

function hullExtent(y) {
  const row = HULL.find(entry => entry[0] === y);
  return row ? [row[1], row[2]] : [999, -1];
}

function fillHullBand(ctx, y0, y1, color) {
  for (let y = y0; y <= y1; y += 1) {
    const [left, right] = hullExtent(y);
    if (right >= left) px(ctx, color, left, y, right - left + 1, 1);
  }
}

function drawBoat(ctx, frame) {
  const f = wrap(frame, 4);
  drawBoatBackWater(ctx, f);

  // Stowed oar behind the centre bench.
  pixelLine(ctx, 16, 32, 46, 25, INK, 3);
  pixelLine(ctx, 16, 31, 45, 24, WOOD, 1);
  px(ctx, WOOD_PALE, 17, 30, 12, 2);
  px(ctx, WOOD_DARK, 16, 32, 8, 2);
  px(ctx, WOOD_LIGHT, 18, 31, 4, 1);

  // Prow wedge, then hull silhouette and planks.
  const prow = [
    [27, 86, 90], [28, 84, 92], [29, 82, 92], [30, 80, 92], [31, 78, 92],
    [32, 75, 91], [33, 72, 90], [34, 68, 89], [35, 64, 88], [36, 60, 87],
  ];
  prow.forEach(([y, left, right]) => px(ctx, INK, left, y, right - left + 1, 1));
  prow.forEach(([y, left, right]) => px(ctx, WOOD_DARK, left + 1, y, right - left - 1, 1));

  fillHullBand(ctx, 33, 56, INK);
  fillHullBand(ctx, 34, 56, WOOD_DARK);
  fillHullBand(ctx, 35, 55, WOOD);
  fillHullBand(ctx, 36, 54, WOOD_LIGHT);
  fillHullBand(ctx, 44, 50, WOOD);
  fillHullBand(ctx, 51, 55, WOOD_DARK);
  // Upper-left lit gunwale and a dark waterline.
  for (let y = 34; y <= 40; y += 1) {
    const [left, right] = hullExtent(y);
    px(ctx, WOOD_PALE, left + 1, y, Math.max(2, right - left - 2), 1);
  }
  fillHullBand(ctx, 53, 56, WOOD_DEEP);

  // Plank seams and clustered grain.
  [43, 47, 51].forEach((y, index) => {
    const [left, right] = hullExtent(y);
    px(ctx, WOOD_DEEP, left + 2, y, right - left - 3, 1);
    px(ctx, WOOD_LIGHT, left + 3, y + 1, Math.max(3, right - left - 9), 1);
    for (let x = left + 6 + index * 7; x < right - 5; x += 17) {
      px(ctx, WOOD_DARK, x, y + 2, 3, 1);
      px(ctx, WOOD_PALE, x + 2, y + 3, 2, 1);
      px(ctx, WOOD_DARK, x - 1, y + 4, 2, 1);
    }
  });
  // Nails along the near gunwale.
  for (let x = 22; x <= 78; x += 14) {
    px(ctx, WOOD_DEEP, x, 39, 1, 1);
    px(ctx, WOOD_PALE, x + 1, 38, 1, 1);
  }

  // Recessed interior: far rim, dark floor and visible ribs.
  for (let y = 32; y <= 39; y += 1) {
    const inset = y < 35 ? 2 : 1;
    px(ctx, '#2b2725', 22 + inset, y, 52 - inset * 2, 1);
    if (y < 36) px(ctx, '#1b2020', 26 + inset, y, 44 - inset * 2, 1);
  }
  px(ctx, WOOD_DARK, 22, 33, 52, 2);
  px(ctx, WOOD_LIGHT, 24, 33, 18, 1);
  px(ctx, WOOD_PALE, 26, 34, 9, 1);
  px(ctx, '#3a2b23', 26, 37, 44, 1);
  px(ctx, '#241f1e', 30, 38, 36, 1);
  [31, 44, 57, 68].forEach(x => {
    px(ctx, WOOD_DARK, x, 36, 1, 3);
    px(ctx, WOOD_LIGHT, x + 1, 36, 1, 2);
  });
  // Far interior highlights read as depth under the far gunwale.
  px(ctx, '#50615c', 27, 35, 12, 1);
  px(ctx, '#3b4c49', 43, 35, 14, 1);

  // Centre bench, deliberately low so the hero's feet sit at y=38.
  px(ctx, INK, 38, 36, 20, 6);
  px(ctx, WOOD_DARK, 39, 36, 18, 5);
  px(ctx, WOOD, 40, 36, 16, 2);
  px(ctx, WOOD_LIGHT, 41, 36, 14, 1);
  px(ctx, WOOD_PALE, 42, 37, 8, 1);
  px(ctx, WOOD_DARK, 41, 39, 2, 4);
  px(ctx, WOOD_DARK, 53, 39, 2, 4);
  px(ctx, WOOD_DEEP, 39, 41, 18, 1);

  // Bow deck and metal fittings.
  px(ctx, WOOD_LIGHT, 76, 30, 12, 2);
  px(ctx, WOOD, 78, 32, 10, 3);
  px(ctx, WOOD_DARK, 80, 35, 7, 2);
  px(ctx, WOOD_PALE, 84, 29, 4, 1);
  px(ctx, METAL_DARK, 35, 34, 3, 2);
  px(ctx, METAL, 36, 34, 1, 1);
  px(ctx, METAL_DARK, 63, 34, 3, 2);
  px(ctx, METAL, 64, 34, 1, 1);

  // Stern rope coil and a small travelling lantern.
  px(ctx, WOOD_DEEP, 15, 40, 9, 5);
  px(ctx, CREAM_DARK, 16, 40, 7, 1);
  px(ctx, CREAM, 16, 41, 6, 1);
  px(ctx, CREAM_DARK, 17, 42, 5, 1);
  px(ctx, CREAM, 18, 43, 3, 1);
  px(ctx, WOOD_DARK, 13, 26, 2, 13);
  px(ctx, METAL_DARK, 12, 24, 5, 3);
  px(ctx, METAL, 13, 24, 3, 1);
  px(ctx, '#f3b64d', 13, 27, 3, 3);
  px(ctx, '#ffe39a', 14, 28, 1, 2);
  px(ctx, METAL_DARK, 12, 30, 5, 1);
  px(ctx, METAL_DARK, 13, 31, 3, 1);
  px(ctx, '#d4512a', 14, 22 + (f % 2), 2, 2);
  px(ctx, '#f29a35', 14, 21 + (f % 2), 1, 2);
  px(ctx, WOOD_PALE, 13, 32, 1, 3);

  drawBoatWater(ctx, f);
}

function drawBoatBackWater(ctx, frame) {
  // Broken flat wave clusters behind the hull, not a full water rectangle.
  const shift = frame % 4;
  px(ctx, WATER_DEEP, 4, 47, 13, 4);
  px(ctx, WATER_MID, 6, 48, 9, 2);
  px(ctx, WATER_LIGHT, 8, 48, 4, 1);
  px(ctx, WATER_DEEP, 81, 45, 13, 5);
  px(ctx, WATER_MID, 84, 46, 8, 2);
  px(ctx, WATER_LIGHT, 86, 46, 3, 1);
  px(ctx, WATER_DEEP, 67, 43, 9, 3);
  px(ctx, WATER_MID, 69 + shift, 44, 5, 1);
}

function drawBoatWater(ctx, frame) {
  const f = frame % 4;
  // Foreground water occludes the keel, grounding the boat in the sea.
  for (let y = 52; y < 63; y += 1) {
    const t = (y - 52) / 10;
    const left = Math.round(7 - t * 5);
    const right = Math.round(90 + t * 3);
    const color = y < 55 ? WATER_MID : y < 59 ? WATER_DEEP : '#12343b';
    px(ctx, color, left, y, right - left, 1);
  }
  const offsets = [0, 3, 6, 2];
  for (let i = 0; i < 7; i += 1) {
    const x = 10 + i * 12 + offsets[(i + f) % 4];
    px(ctx, WATER_LIGHT, x, 54 + (i % 3), 6, 1);
    px(ctx, WATER_MID, x + 2, 55 + (i % 3), 4, 1);
    if (i % 2 === f % 2) px(ctx, FOAM, x + 1, 53 + (i % 3), 3, 1);
  }
  // Foam at the waterline and a bright bow wake.
  px(ctx, FOAM, 14, 50, 7, 1);
  px(ctx, FOAM_LIGHT, 16, 49 + (f % 2), 4, 1);
  px(ctx, FOAM, 24, 52, 5, 1);
  px(ctx, FOAM, 33, 53, 6, 1);
  px(ctx, FOAM, 62, 53, 5, 1);
  px(ctx, FOAM, 74, 51, 8, 1);
  px(ctx, FOAM_LIGHT, 80, 50, 5, 1);
  px(ctx, FOAM, 88, 48 - (f % 2), 5, 2);
  px(ctx, FOAM_LIGHT, 91, 47 - (f % 2), 3, 1);
  px(ctx, WATER_LIGHT, 84, 52, 9, 1);
  px(ctx, WATER_DEEP, 90, 55, 5, 2);
  px(ctx, WATER_MID, 2, 55, 8, 3);
  px(ctx, FOAM, 4, 54, 4, 1);
  px(ctx, WATER_LIGHT, 3, 57, 5, 1);
  px(ctx, FOAM_LIGHT, 93, 44, 2, 1);
}

const TRUCK = {
  body: '#a34936', light: '#c66a4e', dark: '#742e24', deep: '#4e1e18',
  glass: '#4d7779', glassLight: '#a8c7be', glassDark: '#2c4b50',
  tyre: '#262628', tread: '#3d3c40', hub: '#b08e5c', hubLight: '#d6b87c',
  burlap: '#c9b283', burlapLight: '#e3d2a5', burlapDark: '#967f56',
  crate: '#8c6438', crateLight: '#b18551', crateDark: '#5e4225',
};

function drawTruck(ctx, frame) {
  const f = wrap(frame, 4);
  drawTruckShadow(ctx);
  drawTruckDust(ctx, f);

  drawWheel(ctx, 27, 49, 9, f, true);
  drawWheel(ctx, 72, 49, 9, f, false);

  // Chassis and running gear.
  px(ctx, INK, 10, 47, 78, 4);
  px(ctx, '#3b2922', 11, 48, 76, 2);
  px(ctx, METAL_DARK, 12, 50, 74, 1);

  drawTruckBed(ctx, f);
  drawTruckCab(ctx);
  drawTruckFront(ctx);

  // Fender arches sit over the tyre tops and give the body real depth.
  drawFender(ctx, 27, TRUCK.dark);
  drawFender(ctx, 72, TRUCK.dark);
  drawFenderHighlight(ctx, 27);
  drawFenderHighlight(ctx, 72);
  drawTruckDetails(ctx, f);
}

function drawTruckShadow(ctx) {
  const rows = [[57, 12, 84], [58, 7, 90], [59, 4, 93], [60, 2, 95]];
  rows.forEach(([y, left, right]) => px(ctx, '#2a2422', left, y, right - left, 1));
  px(ctx, '#463a30', 8, 58, 80, 1);
  px(ctx, '#5b4a3b', 15, 59, 64, 1);
}

function drawTruckDust(ctx, frame) {
  const f = frame % 4;
  const lift = f === 1 ? 1 : f === 3 ? -1 : 0;
  px(ctx, '#9c8967', 0, 48, 7, 4);
  px(ctx, '#c4af84', 1, 47 + lift, 5, 2);
  px(ctx, '#ddcba0', 2, 46 + lift, 3, 1);
  px(ctx, '#b6a078', 5, 51, 8, 3);
  px(ctx, '#d3bf92', 6, 50 - lift, 5, 1);
  px(ctx, '#8e7c5c', 11, 54, 6, 2);
  px(ctx, '#c4af84', 13, 53, 3, 1);
  px(ctx, '#b6a078', 4, 42 + lift, 5, 3);
  px(ctx, '#d3bf92', 5, 41 + lift, 3, 1);
  px(ctx, '#dfcda4', 9, 39 - lift, 2, 1);
}

function drawWheel(ctx, cx, cy, radius, frame, rear) {
  const ink = '#171519';
  for (let dy = -radius; dy <= radius; dy += 1) {
    const half = floor(Math.sqrt(Math.max(0, radius * radius - dy * dy)));
    px(ctx, ink, cx - half, cy + dy, half * 2 + 1, 1);
  }
  for (let dy = -radius + 1; dy <= radius - 1; dy += 1) {
    const outer = floor(Math.sqrt(Math.max(0, radius * radius - dy * dy)));
    const inner = floor(Math.sqrt(Math.max(0, (radius - 1) * (radius - 1) - dy * dy)));
    if (outer > inner) {
      px(ctx, TRUCK.tyre, cx - outer, cy + dy, outer - inner, 1);
      px(ctx, TRUCK.tyre, cx + inner + 1, cy + dy, outer - inner, 1);
    }
  }
  // Tread blocks rotate with the wheel; four flat positions avoid any blur.
  const step = Math.PI / 4;
  const phase = (frame % 4) * (Math.PI / 16);
  for (let i = 0; i < 8; i += 1) {
    const angle = i * step + phase;
    const x = cx + Math.round(Math.cos(angle) * (radius - 1));
    const y = cy + Math.round(Math.sin(angle) * (radius - 1));
    px(ctx, TRUCK.tread, x - 1, y, 2, 1);
    px(ctx, ink, x, y + 1, 1, 1);
  }
  // Hub, four rotating spokes and a brass cap.
  for (let dy = -4; dy <= 4; dy += 1) {
    const half = floor(Math.sqrt(Math.max(0, 16 - dy * dy)));
    px(ctx, '#78603f', cx - half, cy + dy, half * 2 + 1, 1);
  }
  for (let dy = -3; dy <= 3; dy += 1) {
    const half = floor(Math.sqrt(Math.max(0, 9 - dy * dy)));
    px(ctx, TRUCK.hub, cx - half, cy + dy, half * 2 + 1, 1);
  }
  const spokePhase = (frame % 4) * (Math.PI / 8);
  for (let i = 0; i < 4; i += 1) {
    const angle = i * (Math.PI / 2) + spokePhase;
    pixelLine(ctx, cx, cy, cx + Math.round(Math.cos(angle) * 3),
      cy + Math.round(Math.sin(angle) * 3), '#6e5535', 1);
  }
  px(ctx, TRUCK.hubLight, cx - 1, cy - 1, 2, 2);
  px(ctx, '#f0e2b6', cx, cy, 1, 1);
  // Light is upper-left, so the crown and left flank of the tyre are lighter.
  px(ctx, '#4b4a4e', cx - radius + 2, cy - 5, 1, 3);
  px(ctx, '#5a585c', cx - 4, cy - radius + 2, 3, 1);
  px(ctx, rear ? '#1d1b1e' : '#211f22', cx + radius - 2, cy + 4, 1, 2);
}

function drawTruckBed(ctx, frame) {
  // Tailgate, wooden sideboards and visible bed floor.
  px(ctx, INK, 7, 29, 9, 22);
  px(ctx, TRUCK.dark, 8, 30, 7, 20);
  px(ctx, WOOD_DARK, 9, 31, 5, 18);
  px(ctx, WOOD, 10, 32, 3, 16);
  px(ctx, CREAM_DARK, 9, 36, 5, 2);
  px(ctx, METAL_DARK, 8, 40, 7, 2);
  px(ctx, METAL, 9, 41, 2, 1);

  px(ctx, INK, 12, 33, 25, 17);
  px(ctx, TRUCK.deep, 12, 34, 25, 15);
  px(ctx, WOOD_DARK, 13, 35, 23, 13);
  px(ctx, WOOD, 14, 37, 22, 10);
  px(ctx, WOOD_LIGHT, 15, 37, 20, 3);
  px(ctx, WOOD_DARK, 14, 42, 22, 1);
  px(ctx, WOOD_LIGHT, 15, 43, 18, 1);
  px(ctx, WOOD_DARK, 14, 47, 22, 1);
  for (let x = 16; x < 35; x += 8) {
    px(ctx, WOOD_DEEP, x, 38, 1, 9);
    px(ctx, WOOD_PALE, x + 1, 38, 1, 2);
  }
  // Top rail and inside floor.
  px(ctx, INK, 9, 31, 30, 3);
  px(ctx, METAL_DARK, 10, 31, 28, 2);
  px(ctx, METAL, 11, 31, 26, 1);
  px(ctx, WOOD_DARK, 14, 30, 23, 2);
  px(ctx, '#5b452f', 15, 31, 21, 2);

  // Cargo: stacked burlap sacks and a slatted crate, kept below the cab roof.
  px(ctx, INK, 17, 22, 13, 12);
  px(ctx, TRUCK.crateDark, 17, 23, 13, 11);
  px(ctx, TRUCK.crate, 18, 23, 11, 10);
  px(ctx, TRUCK.crateLight, 19, 24, 9, 2);
  px(ctx, TRUCK.crateDark, 18, 27, 11, 1);
  px(ctx, TRUCK.crateDark, 18, 30, 11, 1);
  px(ctx, '#47321f', 20, 24, 1, 7);
  px(ctx, '#47321f', 27, 24, 1, 7);
  px(ctx, GOLD, 22, 29, 3, 1);

  px(ctx, INK, 28, 25, 11, 10);
  px(ctx, TRUCK.burlapDark, 29, 26, 9, 8);
  px(ctx, TRUCK.burlap, 29, 26, 8, 7);
  px(ctx, TRUCK.burlapLight, 30, 26, 5, 2);
  px(ctx, TRUCK.burlapDark, 30, 30, 6, 1);
  px(ctx, '#7e6947', 31, 28, 1, 1);
  px(ctx, '#e0ce9f', 35, 27, 1, 4);
  // Rope lash across the cargo.
  pixelLine(ctx, 18, 25, 39, 33, '#7d6645', 1);
  px(ctx, GOLD, 28, 30, 2, 1);
  // One loose produce crate edge peeking over the sideboard.
  px(ctx, '#6e4a2b', 34, 24, 3, 4);
  px(ctx, '#c68f45', 34, 23, 2, 2);
  px(ctx, '#8ca85a', 35, 22, 1, 1);
  if (frame % 2 === 1) px(ctx, '#f2e6bd', 36, 23, 1, 1);
}

function drawTruckCab(ctx) {
  // Cab shell, roof and the side opening that leaves the hero visible.
  px(ctx, INK, 34, 24, 34, 27);
  px(ctx, TRUCK.deep, 35, 24, 32, 26);
  px(ctx, TRUCK.dark, 35, 25, 32, 24);
  px(ctx, TRUCK.body, 36, 25, 30, 22);
  px(ctx, TRUCK.light, 37, 25, 26, 3);
  px(ctx, TRUCK.dark, 64, 25, 3, 23);
  px(ctx, CREAM_DARK, 38, 22, 27, 4);
  px(ctx, CREAM, 39, 21, 25, 3);
  px(ctx, CREAM_LIGHT, 40, 21, 18, 1);
  px(ctx, TRUCK.deep, 36, 49, 30, 1);

  // Rear quarter window and door window, with flat diagonal reflections.
  px(ctx, INK, 37, 27, 10, 11);
  px(ctx, TRUCK.glassDark, 38, 27, 8, 10);
  px(ctx, TRUCK.glass, 38, 28, 7, 7);
  px(ctx, TRUCK.glassLight, 39, 28, 4, 1);
  px(ctx, TRUCK.glassLight, 38, 31, 1, 2);
  px(ctx, CREAM_DARK, 40, 33, 4, 1);
  px(ctx, TRUCK.dark, 43, 27, 1, 10);

  px(ctx, INK, 47, 26, 17, 13);
  px(ctx, TRUCK.glassDark, 48, 26, 15, 12);
  px(ctx, TRUCK.glass, 48, 27, 14, 7);
  px(ctx, TRUCK.glassLight, 49, 27, 5, 1);
  px(ctx, TRUCK.glassLight, 48, 29, 1, 3);
  px(ctx, TRUCK.glassLight, 58, 33, 3, 1);
  px(ctx, TRUCK.glassDark, 48, 35, 14, 3);
  // Bench and the top of the steering column, at the public seat line y=36.
  px(ctx, '#6b4a30', 44, 36, 12, 3);
  px(ctx, '#946846', 45, 36, 10, 1);
  px(ctx, '#3f2c20', 43, 38, 13, 1);
  px(ctx, '#4c3730', 58, 33, 2, 6);
  px(ctx, '#2e2422', 57, 31, 4, 2);
  px(ctx, '#8a6c4b', 58, 31, 2, 1);

  // Door seam, handle, hinge and cream beltline.
  px(ctx, TRUCK.deep, 37, 37, 27, 1);
  px(ctx, TRUCK.dark, 37, 38, 1, 11);
  px(ctx, TRUCK.dark, 63, 38, 1, 11);
  px(ctx, CREAM_DARK, 38, 39, 25, 1);
  px(ctx, CREAM, 39, 40, 24, 1);
  px(ctx, TRUCK.light, 47, 43, 3, 1);
  px(ctx, METAL_DARK, 58, 41, 4, 2);
  px(ctx, METAL_LIGHT, 59, 41, 2, 1);
  px(ctx, METAL_DARK, 61, 45, 2, 2);
  px(ctx, TRUCK.deep, 44, 46, 16, 1);
  px(ctx, '#3a2923', 39, 48, 22, 2);
  // Mirror and door step.
  px(ctx, METAL_DARK, 66, 30, 2, 5);
  px(ctx, '#6e7979', 67, 30, 4, 3);
  px(ctx, '#b9c4bf', 68, 30, 2, 1);
  px(ctx, METAL_DARK, 41, 50, 22, 2);
  px(ctx, METAL, 42, 50, 20, 1);
}

function drawTruckFront(ctx) {
  // Bonnet, grille, lamp and bumper.
  px(ctx, INK, 65, 32, 23, 17);
  px(ctx, TRUCK.deep, 66, 32, 21, 15);
  px(ctx, TRUCK.dark, 66, 33, 21, 13);
  px(ctx, TRUCK.body, 67, 33, 19, 12);
  px(ctx, TRUCK.light, 68, 32, 17, 3);
  px(ctx, TRUCK.light, 68, 32, 10, 1);
  px(ctx, '#d9825f', 69, 34, 6, 1);
  px(ctx, TRUCK.dark, 74, 36, 10, 7);
  px(ctx, CREAM_DARK, 75, 36, 8, 1);
  px(ctx, TRUCK.deep, 75, 37, 9, 5);
  for (let y = 37; y <= 41; y += 2) {
    px(ctx, METAL_DARK, 76, y, 7, 1);
    px(ctx, METAL, 77, y + 1, 5, 1);
  }
  // Round lamp with a flat warm core.
  px(ctx, INK, 81, 32, 6, 6);
  px(ctx, GOLD, 82, 32, 4, 5);
  px(ctx, '#f7dda0', 82, 33, 3, 3);
  px(ctx, '#fff0bd', 82, 33, 2, 1);
  px(ctx, METAL_DARK, 82, 37, 3, 1);
  // Bumper with a metal highlight strip.
  px(ctx, INK, 81, 45, 12, 4);
  px(ctx, METAL_DARK, 82, 45, 10, 3);
  px(ctx, METAL, 83, 45, 8, 1);
  px(ctx, METAL_LIGHT, 84, 45, 4, 1);
  px(ctx, '#3b3f40', 82, 48, 10, 1);
  px(ctx, TRUCK.dark, 66, 46, 16, 1);
}

function drawFender(ctx, cx, color) {
  for (let dy = -12; dy <= -5; dy += 1) {
    const half = floor(Math.sqrt(Math.max(0, 144 - dy * dy)));
    px(ctx, INK, cx - half - 1, 49 + dy, half * 2 + 3, 1);
  }
  for (let dy = -11; dy <= -6; dy += 1) {
    const half = floor(Math.sqrt(Math.max(0, 121 - dy * dy)));
    px(ctx, color, cx - half, 49 + dy, half * 2 + 1, 1);
  }
}

function drawFenderHighlight(ctx, cx) {
  for (let dy = -11; dy <= -8; dy += 1) {
    const half = floor(Math.sqrt(Math.max(0, 121 - dy * dy)));
    px(ctx, TRUCK.light, cx - half + 1, 49 + dy, 2, 1);
  }
}

function drawTruckDetails(ctx, frame) {
  const f = frame % 4;
  // Exhaust puff above the bed, animated in four flat shapes.
  px(ctx, '#9b8a6a', 5, 37 - (f % 2), 4, 3);
  px(ctx, '#c4b28b', 6, 36 - (f % 2), 2, 1);
  px(ctx, '#b6a078', 3, 34 - (f === 2 ? 1 : 0), 3, 2);
  // Tail lamp and number plate block.
  px(ctx, '#7c2d25', 6, 45, 2, 3);
  px(ctx, '#d05a42', 6, 45, 1, 2);
  px(ctx, CREAM_DARK, 8, 44, 5, 3);
  px(ctx, '#8d7b58', 9, 45, 3, 1);
  // Front leaf spring and axle shadow.
  px(ctx, METAL_DARK, 20, 53, 14, 1);
  px(ctx, METAL_DARK, 65, 53, 14, 1);
  px(ctx, '#38291f', 23, 54, 9, 1);
  px(ctx, '#38291f', 68, 54, 9, 1);
  // Bed side bolts.
  for (let x = 16; x <= 32; x += 8) {
    px(ctx, METAL_DARK, x, 44, 1, 1);
    px(ctx, METAL, x, 44, 1, 1);
  }
  // A small sack seam and cargo rope sway.
  px(ctx, TRUCK.burlapDark, 32, 29, 1, 3);
  px(ctx, '#7d6645', 24, 26 + (f === 1 ? 1 : 0), 3, 1);
}
