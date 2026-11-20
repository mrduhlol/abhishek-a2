/**
 * Original Canvas2D props. All coordinates below use a two-pixel art grid.
 * Paint onto a fresh transparent canvas; painters preserve the caller's state.
 *
 * Integration anchors (actual canvas pixels, x right / y down):
 *   obstacle 96x64: feet (48,60), passage x=30..66, y=32..58.
 *   portal   96x96: threshold (48,90), opening x=32..66, y=42..88.
 *   platform 128x64: deck center (64,32), front deck lip y=44,
 *                   contact (64,60). Place passengers on the deck, not contact.
 *   plinth   64x64: feet (32,60), logo seat (32,28).
 *                   Keep the original logo above y=28; no logo is painted here.
 * Parent owns world scale, collision geometry, positioning and texture lifecycle.
 */

const rect = (ctx, color, x, y, w, h) => {
  ctx.fillStyle = color;
  ctx.fillRect(x * 2, y * 2, w * 2, h * 2);
};

// Scan-convert authored facets into grid cells: no antialiased polygon edges.
function facet(ctx, color, points) {
  const ys = points.map((p) => p[1]);
  for (let y = Math.min(...ys); y < Math.max(...ys); y++) {
    const cuts = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      if ((a[1] <= y + 0.5 && b[1] > y + 0.5) ||
          (b[1] <= y + 0.5 && a[1] > y + 0.5)) {
        cuts.push(a[0] + ((y + 0.5 - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    cuts.sort((a, b) => a - b);
    for (let i = 0; i + 1 < cuts.length; i += 2) {
      const x = Math.ceil(cuts[i] - 0.5), end = Math.ceil(cuts[i + 1] - 0.5);
      if (end > x) rect(ctx, color, x, y, end - x, 1);
    }
  }
}

function shadow(ctx, x, y, w) {
  rect(ctx, '#101c2630', x - 2, y, w + 4, 1);
  rect(ctx, '#10171f60', x, y - 1, w, 2);
  rect(ctx, '#10171f85', x + 3, y - 1, w - 6, 1);
}

function moss(ctx, x, y, snow = false) {
  rect(ctx, '#243e35', x, y, 7, 2);
  rect(ctx, '#456348', x + 1, y - 1, 5, 2);
  rect(ctx, '#78935b', x + 1, y - 1, 2, 1);
  rect(ctx, '#9caf70', x + 4, y - 1, 1, 1);
  rect(ctx, '#38513a', x + 5, y + 1, 1, 2);
  if (snow) {
    rect(ctx, '#b5ced3', x, y - 2, 6, 1);
    rect(ctx, '#edf3df', x + 1, y - 3, 4, 1);
  }
}

function crystal(ctx, x, foot, height, violet = false) {
  const p = violet
    ? ['#2d294d', '#694e9a', '#a47adc', '#e2c3ff']
    : ['#173d52', '#286d87', '#60bfd0', '#c1f6e7'];
  facet(ctx, p[0], [[x, foot], [x - 2, foot - height + 3], [x + 1, foot - height], [x + 4, foot - height + 3], [x + 3, foot]]);
  facet(ctx, p[1], [[x, foot - 1], [x - 1, foot - height + 3], [x + 1, foot - height + 1], [x + 1, foot - 2]]);
  facet(ctx, p[2], [[x + 1, foot - height + 1], [x + 3, foot - height + 3], [x + 2, foot - 2], [x + 1, foot - 2]]);
  rect(ctx, p[3], x + 1, foot - height + 2, 1, 3);
}

function rock(ctx, x, y, w, h, hot = false, palette) {
  const p = palette || (hot
    ? ['#24252c', '#3c3a40', '#595158', '#777071']
    : ['#292d40', '#454b60', '#697284', '#99a2a5']);
  facet(ctx, p[0], [[x, y + 2], [x + 2, y], [x + w - 2, y], [x + w, y + 2], [x + w - 1, y + h], [x + 1, y + h]]);
  facet(ctx, p[1], [[x + 1, y + 2], [x + w - 3, y + 1], [x + w - 2, y + h - 1], [x + 2, y + h - 1]]);
  facet(ctx, p[2], [[x + 1, y + 2], [x + 3, y], [x + w - 2, y + 1], [x + w - 3, y + 3], [x + 2, y + 3]]);
  rect(ctx, p[3], x + 2, y + 1, Math.max(1, w - 5), 1);
  rect(ctx, p[0], x + w - 3, y + 4, 1, Math.max(1, h - 5));
  rect(ctx, p[2], x + 2, y + h - 2, 2, 1);
}

function log(ctx, chapter) {
  const night = chapter === 1;
  const p = night
    ? ['#202c2c', '#453d32', '#695239', '#94734a', '#b99b63']
    : ['#352e29', '#624332', '#93633e', '#b58a52', '#dfbb7a'];
  shadow(ctx, 5, 29, 38);
  facet(ctx, p[0], [[3, 20], [7, 16], [35, 15], [42, 18], [45, 22], [44, 28], [38, 30], [8, 29], [3, 26]]);
  facet(ctx, p[1], [[5, 20], [10, 18], [36, 17], [42, 20], [42, 27], [36, 28], [8, 27]]);
  facet(ctx, p[2], [[6, 20], [11, 17], [35, 16], [40, 18], [35, 21], [10, 22]]);
  rect(ctx, p[3], 11, 18, 13, 1);
  rect(ctx, p[3], 27, 17, 8, 1);
  // Broken branch, root spur and long, interrupted bark furrows.
  facet(ctx, p[0], [[23, 18], [22, 12], [25, 11], [29, 18]]);
  rect(ctx, p[2], 24, 13, 1, 4);
  rect(ctx, p[4], 23, 11, 2, 1);
  facet(ctx, p[1], [[10, 26], [7, 30], [4, 30], [7, 25]]);
  for (const [x, y, w] of [[12, 23, 8], [24, 22, 7], [16, 26, 9], [29, 25, 7], [7, 24, 3]]) {
    rect(ctx, p[0], x, y, w, 1);
    rect(ctx, p[2], x + 1, y - 1, Math.max(1, w - 3), 1);
  }
  // End grain is a stepped oval, with nested cut rings and a heart crack.
  facet(ctx, p[0], [[36, 18], [40, 17], [44, 20], [45, 25], [42, 28], [37, 28], [34, 24], [34, 21]]);
  facet(ctx, p[3], [[37, 19], [40, 18], [43, 21], [44, 25], [41, 27], [38, 26], [36, 23]]);
  rect(ctx, p[4], 38, 20, 3, 1);
  rect(ctx, p[4], 37, 21, 1, 3);
  rect(ctx, p[1], 39, 21, 2, 1);
  rect(ctx, p[1], 38, 22, 1, 3);
  rect(ctx, p[1], 39, 25, 3, 1);
  rect(ctx, p[1], 42, 22, 1, 3);
  rect(ctx, p[4], 40, 23, 1, 1);
  rect(ctx, p[0], 42, 26, 1, 2);
  moss(ctx, 13, 17, chapter === 0);
  moss(ctx, 28, 17, chapter === 0);
  if (chapter === 2) {
    rect(ctx, '#7a573f', 8, 28, 1, 2);
    rect(ctx, '#d0a46b', 6, 27, 4, 1);
    rect(ctx, '#eee0b1', 7, 26, 2, 1);
  }
}

function ridge(ctx, hot) {
  shadow(ctx, 4, 29, 39);
  rock(ctx, 4, 24, 13, 6, hot);
  rock(ctx, 15, 21, 15, 9, hot);
  rock(ctx, 29, 24, 14, 6, hot);
  if (hot) {
    rock(ctx, 8, 19, 10, 8, true);
    rock(ctx, 25, 16, 10, 12, true);
    for (const [x, y, w] of [[13, 26, 8], [19, 27, 5], [28, 23, 5], [33, 27, 7]]) {
      rect(ctx, '#7d3836', x, y, w, 2);
      rect(ctx, '#ed713b', x, y, w - 2, 1);
      rect(ctx, '#ffd18a', x + 1, y, 2, 1);
    }
    rect(ctx, '#e28c52', 8, 28, 2, 1);
  } else {
    crystal(ctx, 11, 26, 12);
    crystal(ctx, 20, 25, 18, true);
    crystal(ctx, 28, 28, 12, true);
    crystal(ctx, 35, 28, 9);
    rect(ctx, '#b5b0da', 8, 29, 3, 1);
    rect(ctx, '#578896', 39, 28, 2, 1);
  }
}

function branches(ctx, chapter) {
  const night = chapter === 1;
  shadow(ctx, 3, 29, 10);
  shadow(ctx, 35, 29, 10);
  facet(ctx, '#2b3029', [[4, 29], [6, 20], [5, 10], [8, 6], [11, 10], [10, 18], [13, 29]]);
  facet(ctx, '#2b3029', [[35, 29], [38, 18], [37, 9], [41, 7], [43, 13], [41, 22], [44, 29]]);
  facet(ctx, night ? '#5c4834' : '#805537', [[6, 28], [8, 19], [7, 10], [9, 9], [9, 21], [10, 28]]);
  facet(ctx, '#8d7147', [[38, 28], [40, 19], [39, 10], [41, 11], [40, 25]]);
  facet(ctx, '#333027', [[5, 7], [17, 5], [29, 7], [43, 5], [45, 9], [32, 12], [19, 10], [7, 12]]);
  facet(ctx, '#78543b', [[7, 7], [18, 6], [29, 8], [42, 6], [42, 8], [29, 10], [17, 8], [7, 10]]);
  rect(ctx, '#ae8754', 11, 7, 7, 1);
  rect(ctx, '#ae8754', 30, 8, 6, 1);
  // Dense, staggered leaf clusters; hanging leaves stop above the passage.
  for (const [x, y, w] of [[2, 5, 9], [9, 3, 10], [18, 5, 9], [27, 4, 10], [36, 3, 9], [8, 9, 6], [31, 10, 6]]) {
    rect(ctx, night ? '#193b36' : '#314d32', x, y, w, 4);
    rect(ctx, night ? '#2c5c45' : '#567344', x + 1, y - 1, w - 2, 3);
    rect(ctx, night ? '#487f55' : '#8b9f55', x + 2, y - 1, 3, 1);
    rect(ctx, night ? '#69945c' : '#b2bc75', x + 2, y, 1, 1);
    rect(ctx, '#264235', x + w - 2, y + 3, 1, 2);
  }
  moss(ctx, 4, 27, chapter === 0);
  moss(ctx, 36, 28, chapter === 0);
  if (chapter === 0) {
    rect(ctx, '#acc6cb', 11, 3, 6, 1);
    rect(ctx, '#edf4e2', 12, 2, 4, 1);
    rect(ctx, '#d3e4df', 30, 4, 5, 1);
  }
}

function arch(ctx, hot) {
  shadow(ctx, 2, 29, 12);
  shadow(ctx, 34, 29, 12);
  // The center stays transparent: no full-width slab beneath the lintel.
  for (const [x, y, w, h] of [[3, 22, 11, 8], [4, 15, 10, 8], [6, 8, 10, 8], [11, 4, 12, 8], [21, 3, 12, 8], [31, 6, 10, 9], [35, 14, 10, 9], [35, 22, 11, 8]]) {
    rock(ctx, x, y, w, h, hot);
  }
  rect(ctx, hot ? '#946c5a' : '#777792', 19, 10, 8, 1);
  rect(ctx, '#20212f', 16, 12, 18, 2);
  if (hot) {
    rect(ctx, '#973e35', 9, 17, 1, 7);
    rect(ctx, '#e77942', 9, 18, 1, 3);
    rect(ctx, '#a34434', 37, 10, 1, 5);
    rect(ctx, '#ffd58b', 37, 10, 1, 2);
    rect(ctx, '#b95239', 27, 4, 1, 4);
  } else {
    crystal(ctx, 6, 27, 7);
    crystal(ctx, 40, 12, 8, true);
    rect(ctx, '#5d8790', 11, 5, 3, 1);
    rect(ctx, '#83b0b0', 13, 4, 2, 1);
  }
}

export function drawObstacle(ctx, { obstacle }) {
  ctx.save();
  try {
    const { chapter, type } = obstacle;
    if (type === 'crouch') {
      if (chapter === 5 || chapter === 6) arch(ctx, chapter === 6);
      else branches(ctx, chapter);
    } else if (chapter === 5 || chapter === 6) ridge(ctx, chapter === 6);
    else log(ctx, chapter);
  } finally { ctx.restore(); }
}

export function drawPortal(ctx) {
  ctx.save();
  try {
    shadow(ctx, 4, 45, 40);
    // Recessed interior, inset behind the irregular vault and jambs.
    facet(ctx, '#172330', [[12, 44], [12, 21], [18, 13], [30, 12], [37, 21], [37, 44]]);
    facet(ctx, '#101923', [[15, 44], [15, 23], [20, 17], [28, 16], [33, 23], [34, 44]]);
    facet(ctx, '#0a121b', [[19, 43], [18, 27], [22, 21], [28, 21], [31, 28], [30, 43]]);
    rect(ctx, '#22303a', 14, 42, 21, 3);
    rect(ctx, '#33404b', 17, 43, 15, 1);
    for (const [x, y, w, h] of [[3, 34, 12, 11], [4, 25, 11, 10], [5, 17, 11, 9], [9, 10, 12, 9], [16, 5, 12, 10], [26, 6, 11, 10], [34, 12, 9, 11], [36, 22, 10, 12], [35, 33, 11, 12]]) {
      rock(ctx, x, y, w, h);
    }
    // Wedge-shaped inner stones frame the deep opening without filling it.
    facet(ctx, '#858991', [[16, 18], [20, 13], [23, 14], [19, 20]]);
    facet(ctx, '#a2a6a3', [[22, 12], [26, 12], [27, 17], [22, 17]]);
    facet(ctx, '#636d7a', [[28, 14], [32, 17], [33, 22], [29, 19]]);
    rect(ctx, '#353b48', 14, 26, 2, 15);
    rect(ctx, '#606b74', 33, 26, 2, 16);
    // Warm enclosed lanterns, metal brackets and crystal outcrops.
    for (const x of [11, 36]) {
      rect(ctx, '#232c33', x - 1, 25, 4, 7);
      rect(ctx, '#90724b', x, 26, 2, 4);
      rect(ctx, '#dc9b50', x, 27, 2, 2);
      rect(ctx, '#ffe5a0', x, 27, 1, 2);
      rect(ctx, '#a88e61', x - 1, 25, 4, 1);
      rect(ctx, '#1b2630', x, 31, 3, 1);
    }
    crystal(ctx, 5, 43, 9, true);
    crystal(ctx, 41, 44, 7);
    rock(ctx, 1, 42, 8, 3);
    rock(ctx, 39, 42, 8, 3);
    moss(ctx, 8, 13);
    moss(ctx, 28, 7);
    rect(ctx, '#788365', 6, 36, 1, 3);
  } finally { ctx.restore(); }
}

function rope(ctx, x, y, width) {
  for (let i = 0; i < width; i++) {
    const sag = Math.min(3, Math.floor(Math.min(i, width - i - 1) / 3));
    rect(ctx, '#493e31', x + i, y + sag + 1, 1, 1);
    rect(ctx, i % 3 === 0 ? '#e4ce94' : '#b79864', x + i, y + sag, 1, 1);
  }
}

function post(ctx, x, y) {
  rect(ctx, '#382e28', x, y, 3, 12);
  rect(ctx, '#80603e', x, y, 2, 11);
  rect(ctx, '#b49460', x, y, 1, 9);
  rect(ctx, '#d4b57a', x, y, 3, 1);
  rect(ctx, '#4c3c2e', x + 1, y + 3, 2, 1);
  rect(ctx, '#d3b67e', x, y + 5, 3, 1);
  rect(ctx, '#a18559', x - 1, y + 6, 4, 1);
}

export function drawPlatform(ctx) {
  ctx.save();
  try {
    // Broken water reflections and dark contact stay beneath the timber hull.
    rect(ctx, '#214c5160', 5, 27, 54, 3);
    rect(ctx, '#96ddd575', 4, 29, 13, 1);
    rect(ctx, '#8bdbd46a', 23, 30, 17, 1);
    rect(ctx, '#b1e5d285', 48, 28, 12, 1);
    facet(ctx, '#392e26', [[3, 18], [10, 9], [56, 9], [61, 18], [59, 26], [6, 27]]);
    facet(ctx, '#654a30', [[5, 20], [60, 19], [58, 25], [7, 26]]);
    rect(ctx, '#9b7145', 8, 23, 49, 1);
    // Seven deck boards follow the same oblique top plane.
    const wood = ['#b18a54', '#a17a49', '#bd945e', '#ac8151'];
    for (let i = 0; i < 7; i++) {
      const y = 10 + i * 2, left = 10 - Math.floor(i / 2), right = 55 + Math.floor(i / 2);
      rect(ctx, wood[i % wood.length], left, y, right - left, 2);
      rect(ctx, '#d4af74', left + 1, y, right - left - 2, 1);
      rect(ctx, '#684a31', left, y + 1, right - left, 1);
      rect(ctx, '#8e663e', left + 5 + (i % 3) * 7, y, 6, 1);
      rect(ctx, '#4b3d2c', left + 2, y, 1, 1);
      rect(ctx, '#4b3d2c', right - 3, y, 1, 1);
    }
    rect(ctx, '#5c4430', 15, 24, 3, 4);
    rect(ctx, '#5c4430', 48, 24, 3, 4);
    rect(ctx, '#ac8751', 15, 24, 1, 3);
    rect(ctx, '#ac8751', 48, 24, 1, 3);
    // Rear rail leaves the central passenger and logo area unobstructed.
    rope(ctx, 12, 6, 18);
    rope(ctx, 32, 6, 20);
    post(ctx, 9, 3);
    post(ctx, 29, 3);
    post(ctx, 52, 3);
    post(ctx, 5, 14);
    post(ctx, 57, 14);
    rope(ctx, 8, 18, 8);
    rope(ctx, 49, 18, 8);
    rect(ctx, '#6e8760', 9, 25, 3, 1);
    rect(ctx, '#397c74', 54, 25, 3, 1);
  } finally { ctx.restore(); }
}

export function drawPlinth(ctx, { chapter }) {
  ctx.save();
  try {
    shadow(ctx, 5, 29, 22);
    if (chapter === 1 || chapter === 2 || chapter === 4) {
      // Small pegged timber stand, with a quiet seat for the original mark.
      rect(ctx, '#382e29', 7, 16, 18, 12);
      rect(ctx, '#765038', 9, 17, 14, 10);
      rect(ctx, '#ac8150', 9, 17, 2, 10);
      rect(ctx, '#4c3b2e', 13, 18, 1, 8);
      rect(ctx, '#4c3b2e', 19, 18, 1, 8);
      rect(ctx, '#d0a76c', 10, 20, 11, 1);
      rect(ctx, '#c79b60', 10, 25, 11, 1);
      facet(ctx, '#382e29', [[4, 16], [8, 12], [25, 12], [28, 16], [27, 18], [5, 18]]);
      facet(ctx, '#b28e5b', [[5, 15], [9, 13], [24, 13], [26, 15]]);
      rect(ctx, '#ddbc80', 8, 13, 16, 1);
      rect(ctx, '#75583a', 6, 16, 20, 1);
      for (const x of [8, 23]) {
        rect(ctx, '#ccb278', x, 19, 2, 2);
        rect(ctx, '#463d2c', x, 19, 1, 1);
      }
      if (chapter === 4) {
        rect(ctx, '#4f8e8090', 5, 29, 8, 1);
        rect(ctx, '#9ad6c580', 22, 30, 7, 1);
      } else moss(ctx, 5, 27);
    } else {
      const hot = chapter === 6;
      const sandstone = chapter === 3
        ? ['#6f4939', '#9f6845', '#c5925b', '#e1b679']
        : undefined;
      rock(ctx, 5, 24, 23, 6, hot, sandstone);
      rock(ctx, 8, 17, 17, 9, hot, sandstone);
      rock(ctx, 4, 12, 24, 7, hot, sandstone);
      rect(ctx, chapter === 3 ? '#c5925b' : '#8e969a', 7, 13, 17, 1);
      rect(ctx, '#303441', 13, 21, 6, 1);
      rect(ctx, '#303441', 18, 22, 1, 3);
      if (chapter === 0) {
        moss(ctx, 4, 26, true);
        rect(ctx, '#c4d9d9', 8, 12, 9, 1);
        rect(ctx, '#eef1db', 9, 11, 6, 1);
      } else if (chapter === 5) {
        crystal(ctx, 5, 28, 7, true);
        crystal(ctx, 27, 28, 5);
      } else if (hot) {
        rect(ctx, '#a24b38', 21, 26, 4, 1);
        rect(ctx, '#f9a75e', 22, 26, 2, 1);
      } else {
        rect(ctx, '#b58e60', 9, 23, 3, 1);
        rect(ctx, '#d4ad73', 6, 28, 4, 1);
      }
    }
  } finally { ctx.restore(); }
}
