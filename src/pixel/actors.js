// Pixel adventure actors. All art is original, code-authored Canvas2D pixel work.
//
// Public API
//   drawActor(ctx, { kind = 'hero', frame = 0, direction = 1, pose = 'idle', torch = false, age = 'teen' })
//
// The painter expects a transparent 32 x 48 canvas context. Standing figures
// rest their soles on y = 46. No DOM, random values or external assets are used.
//
// Poses: idle | walk (frames 0-3) | jump | crouch | sit | work | hold | stare
//        | hold-stare
//        'torch' is an idle alias. 'draw' uses four clamped extraction frames:
//        0 reach back, no torch; 1 grasp an unlit torch at the pack;
//        2 extract/raise the unlit torch; 3 raised and lit, ready for idle/walk.
//        Caller: frame=floor(elapsed/1.2*4), torch=frame>=1 for elapsed<1.2s;
//        then idle/walk with torch=true. World glow may start at frame>=2.
// Directions: 1 faces right, -1 faces left, mirrored on the 32px axis.
//             'stare' always faces the viewer and intentionally ignores direction.
//             'hold-stare' faces the viewer while the holding arm follows direction.
// Torch: torch=true shows the held torch; 'draw' controls its visibility/flame
//        as above and preserves the extraction arm. Other poses keep a lit torch.
// Kinds: hero, girl, woman, man, child, boy, elder, baker, farmer, smith,
//        fisher, guard, merchant, vendor, musician, gardener, explorer, npc.
//        'girl' is a teenager by default, sized for a partner beside the hero.
// Age overrides: child, teen, adult, elder. Job kinds stay recognizable at any age.
//
// Animation anchors (pixel coordinates, direction=1):
//   ACTOR_BASELINE      soles line for standing/crouch/work/hold/stare
//   HOLD_HAND           neighbour contact edge; mirrored to x=0 when facing left
//   SIT_SEAT            seat line under a seated figure
//   JUMP_CLEARANCE      sole lift above the baseline in the jump pose

export const ACTOR_WIDTH = 32;
export const ACTOR_HEIGHT = 48;
export const ACTOR_BASELINE = 46;
export const HOLD_HAND = Object.freeze({ x: 31, y: 26 });
export const SIT_SEAT = Object.freeze({ x: 16, y: 40 });
export const JUMP_CLEARANCE = 5;
export const ACTOR_POSES = Object.freeze([
  'idle', 'walk', 'jump', 'crouch', 'sit', 'work', 'hold', 'stare', 'hold-stare', 'draw',
]);
export const ACTOR_KINDS = Object.freeze([
  'hero', 'girl', 'woman', 'man', 'child', 'boy', 'elder', 'baker', 'farmer',
  'smith', 'fisher', 'guard', 'merchant', 'vendor', 'musician', 'gardener',
  'explorer', 'npc',
]);

const INK = '#211a23';
const INK_SOFT = '#352a32';
const WHITE = '#f4ead8';

// Age silhouette table. Larger heads and shorter legs read younger; a lower
// crown and stopped shoulders read older. All coordinates are integer pixels.
const BODIES = {
  child: { headW: 11, headH: 10, torsoW: 9, torsoH: 8, legH: 8, shoeH: 3, neckH: 0, limb: 3 },
  teen: { headW: 11, headH: 11, torsoW: 11, torsoH: 12, legH: 11, shoeH: 4, neckH: 1, limb: 4 },
  adult: { headW: 11, headH: 10, torsoW: 13, torsoH: 12, legH: 13, shoeH: 4, neckH: 1, limb: 4 },
  elder: { headW: 11, headH: 10, torsoW: 11, torsoH: 11, legH: 10, shoeH: 3, neckH: 0, limb: 3 },
};

const SKIN = {
  warm: ['#e7ae83', '#f8cfa2', '#c58a62', '#9f6648'],
  tan: ['#d59a6f', '#edbd8e', '#ae7351', '#8a543c'],
  deep: ['#a96f4e', '#c78f65', '#824f38', '#603828'],
  fair: ['#f0c29a', '#ffe0b5', '#cc9a76', '#a37255'],
  rose: ['#e3a487', '#f7c6a7', '#bd7c63', '#955c49'],
};

const COMMON = {
  metal: '#9aa3a4', metalLight: '#c8d0cb', metalDark: '#5f696a',
  gold: '#d7a84e', goldLight: '#f0d184', goldDark: '#966d2f',
  flameOuter: '#d4512a', flame: '#f29a35', flameCore: '#ffe49a',
  glass: '#8eb5b4', glassLight: '#c6dfd9', glassDark: '#4f7578',
  sole: '#3a3335',
};

function makeStyle(skinName, overrides) {
  const [skin, skinLight, skinShade, skinDeep] = SKIN[skinName] || SKIN.warm;
  return {
    ...COMMON, skin, skinLight, skinShade, skinDeep,
    hair: '#2d2229', hairLight: '#4d343d', hairDark: '#1b1419',
    coat: '#8d6a49', coatLight: '#b48b62', coatDark: '#614630', coatDeep: '#412e22',
    shirt: '#d9c9a9', shirtLight: '#efe2c4', shirtDark: '#a89576',
    trousers: '#42485a', trousersLight: '#5d6478', trousersDark: '#2b3040',
    shoe: '#6b4a35', shoeLight: '#8f6647', shoeShade: '#4a3125',
    apron: '#d8c7a4', apronLight: '#f0e2c2', apronDark: '#a99573',
    pack: '#8f5434', packLight: '#b97548', packDark: '#623620',
    strap: '#4f3223', accent: '#b64e3d', accentLight: '#dc7457', accentDark: '#7f3228',
    ...overrides,
  };
}

const STYLES = {
  hero: makeStyle('warm', {
    build: 'coat', hairStyle: 'messy', shoes: 'sneaker', packStyle: 'backpack', tool: null,
    coat: '#2d7a74', coatLight: '#59a99b', coatDark: '#1d5250', coatDeep: '#153b3b',
    shirt: '#d8c68c', shirtLight: '#efdbaa', shirtDark: '#aa9765',
    trousers: '#34415f', trousersLight: '#4d5d7c', trousersDark: '#222b42',
    hair: '#2a2026', hairLight: '#4b323b', hairDark: '#191318',
    shoe: '#e7d5b6', shoeLight: '#fbf0d6', shoeShade: '#b9a482',
    pack: '#a85935', packLight: '#cd7a4c', packDark: '#703a25',
    accent: '#b94f3e', accentLight: '#dc7558', accentDark: '#813328',
    straps: '#5a3625',
  }),
  girl: makeStyle('warm', {
    build: 'dress', hairStyle: 'ponytail', shoes: 'shoe', packStyle: 'satchel', tool: null,
    coat: '#b7654d', coatLight: '#d98a66', coatDark: '#854334', coatDeep: '#5e2f26',
    shirt: '#f0d9b4', shirtLight: '#fbe9c8', shirtDark: '#c8ae88',
    skirt: '#a95543', skirtLight: '#c9775d', skirtDark: '#78382d',
    trousers: '#d7b58c', trousersLight: '#eccca4', trousersDark: '#b58f69',
    hair: '#6b3b28', hairLight: '#98603c', hairDark: '#472519',
    shoe: '#6a4430', shoeLight: '#906044', shoeShade: '#4a2e20',
    pack: '#7d6a45', packLight: '#a28a5d', packDark: '#57482e',
    accent: '#e2b95c', accentLight: '#f4d986', accentDark: '#a67f37',
    ribbon: '#d7a64b',
  }),
  woman: makeStyle('rose', {
    build: 'dress', hairStyle: 'long', shoes: 'shoe', packStyle: null, tool: null,
    coat: '#7d4c5c', coatLight: '#a86d7a', coatDark: '#5a3443', coatDeep: '#40242f',
    shirt: '#e9d4bb', shirtLight: '#f8e6cf', shirtDark: '#c1a88e',
    skirt: '#6f4454', skirtLight: '#986173', skirtDark: '#4b2b39',
    trousers: '#6b4d5b', trousersLight: '#8a6878', trousersDark: '#4c3441',
    hair: '#5b3528', hairLight: '#86543a', hairDark: '#3b2119',
    shoe: '#5e3a2d', shoeLight: '#845440', shoeShade: '#3f251d',
    accent: '#d6a55a', accentLight: '#efcd8c', accentDark: '#9c7136',
    apron: '#ddc9a3', apronLight: '#f2e1be', apronDark: '#af9874',
  }),
  man: makeStyle('tan', {
    build: 'vest', hairStyle: 'short', shoes: 'boot', packStyle: null, tool: null,
    coat: '#b1843d', coatLight: '#d4a95e', coatDark: '#856026', coatDeep: '#5d431b',
    shirt: '#dfd2b4', shirtLight: '#f4e8cc', shirtDark: '#b6a687',
    trousers: '#4d523c', trousersLight: '#6b7053', trousersDark: '#343827',
    hair: '#3a2a23', hairLight: '#5d4033', hairDark: '#241a16',
    shoe: '#51382a', shoeLight: '#75513a', shoeShade: '#33221a',
    hatStyle: 'flatcap', hat: '#6f5433', hatLight: '#957448', hatDark: '#493620',
    accent: '#8e4336', accentLight: '#b35f4b', accentDark: '#642c24',
    beard: '#4a382d',
  }),
  child: makeStyle('fair', {
    build: 'overalls', hairStyle: 'tousled', shoes: 'sneaker', packStyle: null, tool: null,
    coat: '#c3903f', coatLight: '#e0b567', coatDark: '#8f6528', coatDeep: '#66471c',
    shirt: '#d7cfb8', shirtLight: '#eee7d2', shirtDark: '#aaa18a',
    trousers: '#b58338', trousersLight: '#d3a65a', trousersDark: '#805a25',
    hair: '#4a3024', hairLight: '#704a32', hairDark: '#2c1c16',
    shoe: '#e3d1b2', shoeLight: '#f8ebd1', shoeShade: '#b49e7d',
    accent: '#a94a39', accentLight: '#cb6b52', accentDark: '#773025',
  }),
  elder: makeStyle('fair', {
    build: 'cardigan', hairStyle: 'elder', shoes: 'boot', packStyle: null, tool: null,
    coat: '#75806e', coatLight: '#9ba591', coatDark: '#535c4f', coatDeep: '#394135',
    shirt: '#ddcfb6', shirtLight: '#f1e6cf', shirtDark: '#b4a48b',
    trousers: '#4b4d4d', trousersLight: '#686b6a', trousersDark: '#323433',
    hair: '#c6c2b8', hairLight: '#e5e1d6', hairDark: '#918e85',
    shoe: '#4a3a2e', shoeLight: '#6b5443', shoeShade: '#2f241c',
    accent: '#9d6e45', accentLight: '#c39263', accentDark: '#704a2d',
    shawl: '#8a927f', shawlLight: '#b3baa4', shawlDark: '#626a58',
  }),
  baker: makeStyle('rose', {
    build: 'apron', hairStyle: 'short', shoes: 'shoe', packStyle: null, tool: 'loaf',
    coat: '#9b4f3e', coatLight: '#c06f55', coatDark: '#713528', coatDeep: '#4d231b',
    shirt: '#ead9b7', shirtLight: '#f9eacb', shirtDark: '#c0ad8b',
    trousers: '#54463a', trousersLight: '#725e4d', trousersDark: '#3a3028',
    hair: '#5c3926', hairLight: '#855a3a', hairDark: '#3b2116',
    hatStyle: 'baker', hat: '#f1e5c9', hatLight: '#fff7e4', hatDark: '#c7b996',
    accent: '#c88e45', accentLight: '#e8b974', accentDark: '#94642e',
  }),
  farmer: makeStyle('tan', {
    build: 'overalls', hairStyle: 'tousled', shoes: 'boot', packStyle: null, tool: 'hoe',
    coat: '#557a45', coatLight: '#7a9d61', coatDark: '#3c5b31', coatDeep: '#294021',
    shirt: '#a65444', shirtLight: '#c87661', shirtDark: '#76382e',
    trousers: '#4f7141', trousersLight: '#718f5a', trousersDark: '#38512c',
    hair: '#6a4a2e', hairLight: '#947046', hairDark: '#452d1b',
    shoe: '#4a3421', shoeLight: '#6c4e32', shoeShade: '#2f2015',
    hatStyle: 'straw', hat: '#d8b968', hatLight: '#f2d98e', hatDark: '#a3833f',
    accent: '#d7bc77', accentLight: '#f0dda0', accentDark: '#a48b4f',
  }),
  smith: makeStyle('deep', {
    build: 'apron', hairStyle: 'bandana', shoes: 'boot', packStyle: null, tool: 'hammer',
    coat: '#8d4038', coatLight: '#b25d50', coatDark: '#652b27', coatDeep: '#431c1a',
    shirt: '#7e392f', shirtLight: '#a9584b', shirtDark: '#58241e',
    trousers: '#3d3b3a', trousersLight: '#5a5755', trousersDark: '#282726',
    hair: '#2b2321', hairLight: '#493a35', hairDark: '#181312',
    apron: '#5f432e', apronLight: '#896443', apronDark: '#412b1c',
    hatStyle: 'bandana', hat: '#3f6670', hatLight: '#628d94', hatDark: '#28464d',
    accent: '#d06b37', accentLight: '#f0985d', accentDark: '#914422',
  }),
  fisher: makeStyle('tan', {
    build: 'raincoat', hairStyle: 'short', shoes: 'boot', packStyle: null, tool: 'rod',
    coat: '#c4a14b', coatLight: '#e0c06a', coatDark: '#94762e', coatDeep: '#68521e',
    shirt: '#728089', shirtLight: '#96a3aa', shirtDark: '#4f5b62',
    trousers: '#3e4a51', trousersLight: '#5c6a72', trousersDark: '#2b343a',
    hair: '#4b4038', hairLight: '#6f5e50', hairDark: '#2d2621',
    hatStyle: 'bucket', hat: '#4f6468', hatLight: '#758b8d', hatDark: '#354648',
    shoe: '#3b4347', shoeLight: '#58646a', shoeShade: '#242a2d',
    accent: '#9b3f36', accentLight: '#be6353', accentDark: '#6a2822',
  }),
  guard: makeStyle('warm', {
    build: 'tabard', hairStyle: 'short', shoes: 'boot', packStyle: null, tool: 'spear',
    coat: '#3e5570', coatLight: '#627d98', coatDark: '#293b51', coatDeep: '#1b2939',
    shirt: '#a9b2b3', shirtLight: '#cfd5d2', shirtDark: '#7d8789',
    trousers: '#3e4650', trousersLight: '#5b6571', trousersDark: '#292f36',
    hair: '#3a2b22', hairLight: '#5a4434', hairDark: '#241a14',
    hatStyle: 'helmet', hat: '#8e999b', hatLight: '#c2cbca', hatDark: '#5a6668',
    apron: '#cbb57e', apronLight: '#e5d3a2', apronDark: '#9d8958',
    accent: '#c39a43', accentLight: '#e3c06c', accentDark: '#8c6928',
    shoe: '#4a3830', shoeLight: '#6c5445', shoeShade: '#2f221b',
  }),
  merchant: makeStyle('deep', {
    build: 'coat', hairStyle: 'short', shoes: 'boot', packStyle: 'satchel', tool: null,
    coat: '#3f5f78', coatLight: '#6487a0', coatDark: '#2b4559', coatDeep: '#1b2e3d',
    shirt: '#d7c6a7', shirtLight: '#efe0c1', shirtDark: '#aa997b',
    trousers: '#574737', trousersLight: '#76614a', trousersDark: '#3b3025',
    hair: '#322821', hairLight: '#514134', hairDark: '#1f1915',
    hatStyle: 'brim', hat: '#5b3f2c', hatLight: '#836045', hatDark: '#3c291c',
    pack: '#8a5d3a', packLight: '#b17e50', packDark: '#5d3b22',
    accent: '#d2a64b', accentLight: '#edcb7d', accentDark: '#96702c',
  }),
  vendor: makeStyle('tan', {
    build: 'apron', hairStyle: 'bun', shoes: 'shoe', packStyle: null, tool: 'basket',
    coat: '#7c5540', coatLight: '#a37659', coatDark: '#573a2c', coatDeep: '#3a261d',
    shirt: '#e2cba5', shirtLight: '#f6e3c1', shirtDark: '#baa17e',
    trousers: '#5a4c48', trousersLight: '#79665e', trousersDark: '#3e332f',
    hair: '#4a2c22', hairLight: '#714734', hairDark: '#2e1a13',
    hatStyle: 'scarf', hat: '#b65f4d', hatLight: '#d98a70', hatDark: '#853f33',
    apron: '#c47952', apronLight: '#e1a075', apronDark: '#915433',
    accent: '#e0c27c', accentLight: '#f5e2ac', accentDark: '#a98c4b',
  }),
  musician: makeStyle('fair', {
    build: 'coat', hairStyle: 'long', shoes: 'shoe', packStyle: null, tool: 'lute',
    coat: '#6f4b73', coatLight: '#946a96', coatDark: '#4f3352', coatDeep: '#362337',
    shirt: '#e7d4b7', shirtLight: '#f7e7ce', shirtDark: '#beaa8c',
    trousers: '#454155', trousersLight: '#615b74', trousersDark: '#2f2c3d',
    hair: '#3b2930', hairLight: '#5e4148', hairDark: '#251920',
    hatStyle: 'brim', hat: '#7a4a3d', hatLight: '#a56e5b', hatDark: '#543026',
    shoe: '#4d3429', shoeLight: '#704d3c', shoeShade: '#321f18',
    accent: '#cf8347', accentLight: '#eda46b', accentDark: '#96592e',
  }),
  gardener: makeStyle('fair', {
    build: 'apron', hairStyle: 'bun', shoes: 'boot', packStyle: null, tool: 'can',
    coat: '#a06e43', coatLight: '#c79360', coatDark: '#744b2c', coatDeep: '#4f321d',
    shirt: '#e5d7ba', shirtLight: '#f7ebcf', shirtDark: '#b9aa8e',
    trousers: '#536048', trousersLight: '#727f63', trousersDark: '#394231',
    hair: '#5b3b28', hairLight: '#80593b', hairDark: '#3b2418',
    hatStyle: 'straw', hat: '#cdb069', hatLight: '#e8d08f', hatDark: '#9c7d41',
    apron: '#64825a', apronLight: '#88a77b', apronDark: '#475f40',
    accent: '#c55b49', accentLight: '#e2836d', accentDark: '#8e392d',
  }),
  explorer: makeStyle('tan', {
    build: 'coat', hairStyle: 'tousled', shoes: 'boot', packStyle: 'satchel', tool: null,
    coat: '#8b6c45', coatLight: '#b08c5e', coatDark: '#634b2e', coatDeep: '#43321f',
    shirt: '#cdbfa3', shirtLight: '#e6d9bd', shirtDark: '#a09075',
    trousers: '#4b5145', trousersLight: '#68705f', trousersDark: '#33382f',
    hair: '#4a372b', hairLight: '#6e5541', hairDark: '#2b1f18',
    pack: '#6f5539', packLight: '#957650', packDark: '#4b3824',
    hatStyle: 'brim', hat: '#705637', hatLight: '#98754d', hatDark: '#4a3823',
    accent: '#b65b3f', accentLight: '#d9835f', accentDark: '#7f3a28',
  }),
  npc: makeStyle('warm', {
    build: 'vest', hairStyle: 'short', shoes: 'shoe', packStyle: null, tool: null,
    coat: '#6f7d55', coatLight: '#94a173', coatDark: '#4f5b3c', coatDeep: '#363f29',
    shirt: '#d8c7a6', shirtLight: '#eddfc0', shirtDark: '#ac9b7c',
    trousers: '#4d4a44', trousersLight: '#6b675f', trousersDark: '#34322e',
    hair: '#3b2b25', hairLight: '#5c4437', hairDark: '#251a16',
    hatStyle: null,
    accent: '#aa5f3f', accentLight: '#c98462', accentDark: '#783f28',
  }),
};

const KIND_ALIAS = {
  kid: 'child', youngster: 'child', boy: 'child', schoolboy: 'child',
  grandma: 'elder', grandmother: 'elder', grandpa: 'elder', grandfather: 'elder',
  senior: 'elder', old: 'elder', shopkeeper: 'merchant', trader: 'merchant',
  traveler: 'explorer', traveller: 'explorer', walker: 'explorer', hiker: 'explorer',
  resident: 'npc', town: 'npc', villager: 'npc', person: 'npc',
  cook: 'baker', blacksmith: 'smith', fisherman: 'fisher', sailor: 'fisher',
  minstrel: 'musician', bard: 'musician', florist: 'gardener',
};

const floor = Math.floor;
const wrap = (value, length) => ((value % length) + length) % length;

function px(ctx, color, x, y, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// Thick pixel line built from square stamps, never a smoothed canvas stroke.
function pixelLine(ctx, x0, y0, x1, y1, color, width) {
  const steps = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
  const half = floor(width / 2);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    px(ctx, color, Math.round(x0 + (x1 - x0) * t) - half,
      Math.round(y0 + (y1 - y0) * t) - half, width, width);
  }
}

function outlinedLine(ctx, x0, y0, x1, y1, color, width) {
  pixelLine(ctx, x0, y0, x1, y1, INK, width + 2);
  pixelLine(ctx, x0, y0, x1, y1, color, width);
}

function pathLine(ctx, points, color, width) {
  for (let i = 1; i < points.length; i += 1) {
    pixelLine(ctx, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, color, width);
  }
}

function outlinedPath(ctx, points, color, width) {
  pathLine(ctx, points, INK, width + 2);
  pathLine(ctx, points, color, width);
  const [last] = points.slice(-1);
  px(ctx, INK, last.x - floor((width + 2) / 2), last.y - floor((width + 2) / 2), width + 2, width + 2);
}

function resolveKind(kind) {
  const raw = String(kind || 'hero').toLowerCase();
  return KIND_ALIAS[raw] || raw;
}

function resolveAge(kind, age) {
  if (kind === 'child' || kind === 'boy') return 'child';
  if (kind === 'elder') return 'elder';
  if (kind === 'hero' || kind === 'girl') {
    if (/child|kid|young/.test(String(age).toLowerCase())) return 'child';
    if (/elder|old|senior/.test(String(age).toLowerCase())) return 'elder';
    return 'teen';
  }
  const value = String(age || 'adult').toLowerCase();
  if (/child|kid|young/.test(value)) return 'child';
  if (/elder|old|senior/.test(value)) return 'elder';
  if (/teen/.test(value)) return 'teen';
  if (/adult|mature|grown/.test(value)) return 'adult';
  return 'adult';
}

function figureFor(kind, age) {
  const ageKey = resolveAge(kind, age);
  const metrics = BODIES[ageKey];
  const top = ACTOR_BASELINE - metrics.shoeH - metrics.legH - metrics.torsoH
    - metrics.headH - metrics.neckH;
  const torsoY = top + metrics.headH + metrics.neckH;
  return {
    ageKey, metrics, top, torsoY,
    torsoX: 16 - floor(metrics.torsoW / 2),
    headX: 16 - floor(metrics.headW / 2),
    shoulderY: torsoY + 3,
    hipY: torsoY + metrics.torsoH - 1,
    headDY: ageKey === 'elder' ? 1 : 0,
  };
}

function styleFor(kind, ageKey) {
  const style = STYLES[kind] || STYLES.npc;
  if (ageKey !== 'elder' || kind === 'elder') return style;
  return {
    ...style,
    hair: '#b9b5ab', hairLight: '#dcd8cd', hairDark: '#85827a',
    skinShade: style.skinShade, skinDeep: style.skinDeep,
  };
}

/**
 * Paint one actor onto a transparent 32x48 context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{kind?:string,frame?:number,direction?:number|string,pose?:string,torch?:boolean,age?:string}} [options]
 */
export function drawActor(ctx, options = {}) {
  if (!ctx) return;
  const kind = resolveKind(options.kind);
  const poseName = String(options.pose || 'idle').toLowerCase();
  const pose = poseName === 'torch' ? 'idle' : poseName;
  const frameValue = Number(options.frame);
  const frame = Number.isFinite(frameValue) ? Math.abs(floor(frameValue)) : 0;
  const torch = Boolean(options.torch) || poseName === 'torch';
  const direction = options.direction === -1 || options.direction === 'left' ? -1 : 1;
  const figure = figureFor(kind, options.age);
  const style = styleFor(kind, figure.ageKey);

  if (pose === 'stare') {
    drawFrontActor(ctx, figure, style, frame, false, torch);
    return;
  }
  if (pose === 'hold-stare') {
    ctx.save();
    if (direction < 0) {
      ctx.translate(ACTOR_WIDTH, 0);
      ctx.scale(-1, 1);
    }
    drawFrontActor(ctx, figure, style, frame, true, torch);
    ctx.restore();
    return;
  }

  ctx.save();
  if (direction < 0) {
    ctx.translate(ACTOR_WIDTH, 0);
    ctx.scale(-1, 1);
  }
  if (pose === 'sit') drawSeatedActor(ctx, figure, style, frame, torch);
  else drawStandingActor(ctx, figure, style, pose, frame, torch);
  ctx.restore();
}

function poseLayout(figure, style, pose, frame, torch) {
  const { metrics } = figure;
  const cx = 16;
  const f = wrap(frame, 4);
  const torsoX = figure.torsoX;
  const torsoY = figure.torsoY;
  const shoulderY = figure.shoulderY;
  const hipY = figure.hipY;
  let bodyDY = 0;
  let torsoDX = 0;
  let headDX = 0;
  let headDY = 0;
  let armSwing = 0;
  let legNear = { dx: 2, lift: 0, kneeDX: 0, kneeDY: 0 };
  let legFar = { dx: -2, lift: 0, kneeDX: 0, kneeDY: 0 };
  let nearArmHand = { x: torsoX + metrics.torsoW + 1, y: hipY - 2 };
  let farArmHand = { x: torsoX - 1, y: hipY - 3 };
  let nearElbow = { x: nearArmHand.x - 1, y: shoulderY + 4 };
  let farElbow = { x: torsoX + 2, y: shoulderY + 4 };

  if (pose === 'walk') {
    const phases = [
      { near: 4, far: -4, liftNear: 0, liftFar: 0, swing: -2, bob: 0 },
      { near: 2, far: -2, liftNear: 0, liftFar: 2, swing: 0, bob: -1 },
      { near: -4, far: 4, liftNear: 0, liftFar: 0, swing: 2, bob: 0 },
      { near: -2, far: 2, liftNear: 2, liftFar: 0, swing: 0, bob: -1 },
    ];
    const phase = phases[f];
    bodyDY = phase.bob;
    headDX = f === 1 ? 1 : f === 3 ? -1 : 0;
    armSwing = phase.swing;
    legNear = { dx: phase.near, lift: phase.liftNear, kneeDX: phase.near > 0 ? 1 : 0, kneeDY: 0 };
    legFar = { dx: phase.far, lift: phase.liftFar, kneeDX: phase.far > 0 ? -1 : 0, kneeDY: 0 };
    nearArmHand = { x: torsoX + metrics.torsoW + 2 + armSwing, y: hipY - 2 + bodyDY };
    farArmHand = { x: torsoX - 1 - armSwing, y: hipY - 2 + bodyDY };
    nearElbow = { x: nearArmHand.x - 2, y: shoulderY + 4 + bodyDY };
    farElbow = { x: farArmHand.x + 2, y: shoulderY + 4 + bodyDY };
  } else if (pose === 'jump') {
    bodyDY = -2;
    headDY = -1;
    torsoDX = f % 2;
    legNear = { dx: 2, lift: JUMP_CLEARANCE, kneeDX: 4, kneeDY: -1 };
    legFar = { dx: -2, lift: JUMP_CLEARANCE, kneeDX: -3, kneeDY: 0 };
    nearArmHand = { x: torsoX + metrics.torsoW + 3, y: shoulderY - 5 };
    farArmHand = { x: torsoX - 2, y: shoulderY - 6 };
    nearElbow = { x: torsoX + metrics.torsoW + 2, y: shoulderY - 2 };
    farElbow = { x: torsoX + 1, y: shoulderY - 3 };
  } else if (pose === 'crouch') {
    bodyDY = 4;
    headDY = 1;
    torsoDX = 1;
    legNear = { dx: 3, lift: 0, kneeDX: 4, kneeDY: 1 };
    legFar = { dx: -4, lift: 0, kneeDX: -4, kneeDY: 1 };
    nearArmHand = { x: cx + 6, y: hipY + 1 };
    farArmHand = { x: cx - 6, y: hipY + 1 };
    nearElbow = { x: cx + 6, y: shoulderY + 3 };
    farElbow = { x: cx - 5, y: shoulderY + 3 };
  } else if (pose === 'work') {
    bodyDY = 1;
    headDY = 1;
    torsoDX = 1;
    legNear = { dx: 2, lift: 0, kneeDX: 1, kneeDY: 0 };
    legFar = { dx: -2, lift: 0, kneeDX: -1, kneeDY: 0 };
    const bob = f % 2;
    nearArmHand = { x: cx + 7, y: hipY - 1 + bob };
    farArmHand = { x: cx - 3, y: hipY - 2 };
    nearElbow = { x: cx + 4, y: shoulderY + 3 };
    farElbow = { x: cx - 5, y: shoulderY + 4 };
  } else if (pose === 'hold') {
    nearArmHand = { x: HOLD_HAND.x - 2, y: HOLD_HAND.y - 1 };
    farArmHand = { x: torsoX - 1, y: hipY - 2 };
    nearElbow = { x: 25, y: nearArmHand.y - 2 };
    farElbow = { x: torsoX + 2, y: shoulderY + 4 };
    legNear = { dx: 2, lift: 0, kneeDX: 0, kneeDY: 0 };
    legFar = { dx: -2, lift: 0, kneeDX: 0, kneeDY: 0 };
  } else if (pose === 'draw') {
    const phase = Math.min(frame, 3);
    headDY = phase < 2 ? 1 : 0;
    torsoDX = phase < 2 ? -1 : 0;
    const hands = [
      { x: torsoX - 1, y: torsoY + 5 },
      { x: torsoX - 4, y: torsoY + 2 },
      { x: torsoX + metrics.torsoW + 1, y: shoulderY - 4 },
      { x: torsoX + metrics.torsoW + 3, y: shoulderY + 1 },
    ];
    const elbows = [
      { x: torsoX + 2, y: shoulderY + 6 },
      { x: torsoX, y: shoulderY + 5 },
      { x: torsoX + metrics.torsoW + 2, y: shoulderY + 1 },
      { x: torsoX + metrics.torsoW + 2, y: shoulderY + 4 },
    ];
    nearArmHand = hands[phase];
    nearElbow = elbows[phase];
    // Match the settled idle torch pose at the end of the extraction.
    legNear = { dx: 2, lift: 0, kneeDX: 1, kneeDY: 0 };
    legFar = { dx: -2, lift: 0, kneeDX: -1, kneeDY: 0 };
  } else {
    // idle: a quiet one-pixel breath and weight shift.
    bodyDY = f % 2 ? -1 : 0;
    headDX = f % 2 ? 1 : 0;
    legNear = { dx: 2, lift: 0, kneeDX: 1, kneeDY: 0 };
    legFar = { dx: -2, lift: 0, kneeDX: -1, kneeDY: 0 };
    nearArmHand = { x: torsoX + metrics.torsoW + 1, y: hipY - 2 + bodyDY };
    farArmHand = { x: torsoX - 1, y: hipY - 3 + bodyDY };
    nearElbow = { x: nearArmHand.x, y: shoulderY + 4 + bodyDY };
    farElbow = { x: torsoX + 2, y: shoulderY + 4 + bodyDY };
  }

  // The shoulder is the arm origin. Torch handling replaces the forward arm
  // with a raised grip, except in hold where the off hand carries the torch.
  let torchArm = null;
  if (torch && pose !== 'draw') {
    if (pose === 'hold') torchArm = 'far';
    else torchArm = 'near';
    if (torchArm === 'near') {
      nearArmHand = { x: torsoX + metrics.torsoW + 3, y: shoulderY + 1 };
      nearElbow = { x: torsoX + metrics.torsoW + 2, y: shoulderY + 4 };
    } else {
      farArmHand = { x: torsoX - 3, y: shoulderY + 1 };
      farElbow = { x: torsoX + 1, y: shoulderY + 4 };
    }
  }

  const tx = torsoX + torsoDX;
  const ty = torsoY + bodyDY;
  const sy = shoulderY + bodyDY;
  const hy = hipY + bodyDY;
  const nearShoulder = { x: tx + metrics.torsoW - 1, y: sy };
  const farShoulder = { x: tx + 1, y: sy + 1 };
  const nearHip = { x: cx + 3, y: hy };
  const farHip = { x: cx - 3, y: hy };
  const shoeBaseY = (lift) => ACTOR_BASELINE - 4 - lift;
  const makeLeg = (hip, spec) => {
    const foot = { x: cx + spec.dx, y: shoeBaseY(spec.lift) };
    return {
      hip, foot,
      knee: {
        x: Math.round(hip.x + (foot.x - hip.x) * 0.45) + spec.kneeDX,
        y: Math.round(hip.y + (foot.y - hip.y) * 0.58) + spec.kneeDY,
      },
      lift: spec.lift,
    };
  };

  return {
    bodyDY, torsoDX, headDX, headDY,
    torso: { x: tx, y: ty },
    shoulderY: sy,
    hipY: hy,
    nearArm: { shoulder: nearShoulder, elbow: nearElbow, hand: nearArmHand },
    farArm: { shoulder: farShoulder, elbow: farElbow, hand: farArmHand },
    nearLeg: makeLeg(nearHip, legNear),
    farLeg: makeLeg(farHip, legFar),
    torchArm,
  };
}

function drawStandingActor(ctx, figure, style, pose, frame, torch) {
  const layout = poseLayout(figure, style, pose, frame, torch);
  drawBackpack(ctx, figure, style, layout, pose);
  drawLeg(ctx, figure, style, layout.farLeg, true, pose, frame);
  drawLeg(ctx, figure, style, layout.nearLeg, false, pose, frame);
  drawArm(ctx, figure, style, layout.farArm, true, pose);
  drawTorso(ctx, figure, style, layout, pose, frame);
  drawSkirtOrApron(ctx, figure, style, layout, pose, frame);
  drawArm(ctx, figure, style, layout.nearArm, false, pose);
  drawHead(ctx, figure, style, layout, pose, frame);
  drawStraps(ctx, figure, style, layout);
  if (pose === 'draw') {
    const phase = Math.min(frame, 3);
    if (torch && phase >= 1) drawTorchAt(ctx, style, layout.nearArm.hand, phase, phase === 3);
  } else if (torch) {
    drawTorchAt(ctx, style, layout.torchArm === 'far' ? layout.farArm.hand : layout.nearArm.hand, frame);
  }
  drawTool(ctx, style, layout, pose, frame);
}

function drawBackpack(ctx, figure, style, layout, pose) {
  if (!style.packStyle) return;
  const { metrics } = figure;
  const tx = layout.torso.x;
  const ty = layout.torso.y;
  if (style.packStyle === 'satchel') {
    const x = tx - 4;
    const y = ty + Math.max(5, metrics.torsoH - 5);
    px(ctx, INK, x - 1, y - 1, 7, 7);
    px(ctx, style.packDark, x, y, 6, 6);
    px(ctx, style.pack, x, y, 5, 5);
    px(ctx, style.packLight, x + 1, y + 1, 2, 1);
    px(ctx, style.gold, x + 2, y + 2, 2, 2);
    px(ctx, style.goldLight, x + 2, y + 2, 1, 1);
    px(ctx, style.strap, x + 1, y + 5, 4, 1);
    return;
  }
  const packW = Math.max(5, Math.min(7, metrics.torsoW - 4));
  const packH = Math.max(7, metrics.torsoH - 2);
  const x = tx - packW + 1;
  const y = ty + 2;
  // Rounded pack silhouette with a bedroll and a side pocket.
  px(ctx, INK, x, y + 1, packW, packH - 2);
  px(ctx, INK, x + 1, y, packW - 2, packH);
  px(ctx, style.packDark, x + 1, y + 1, packW - 2, packH - 2);
  px(ctx, style.pack, x + 1, y + 2, packW - 2, packH - 4);
  px(ctx, style.packLight, x + 2, y + 2, Math.max(2, packW - 4), 1);
  // Top flap and rolled blanket.
  px(ctx, style.packDark, x, y - 1, packW, 2);
  px(ctx, style.pack, x + 1, y - 2, packW - 2, 2);
  px(ctx, style.packLight, x + 2, y - 2, packW - 4, 1);
  px(ctx, style.packDark, x + 1, y + 3, packW - 2, 1);
  px(ctx, style.gold, x + 2, y + 5, 2, 1);
  px(ctx, style.goldLight, x + 2, y + 5, 1, 1);
  px(ctx, style.strap, x + 1, y + 6, packW - 2, 1);
  // Side pocket and stitched patch add readable texture without noise.
  px(ctx, style.packDark, x + packW - 3, y + packH - 5, 3, 4);
  px(ctx, style.packLight, x + packW - 3, y + packH - 5, 2, 1);
  px(ctx, style.strap, x + packW - 3, y + packH - 3, 3, 1);
  px(ctx, style.packLight, x + 2, y + packH - 6, 2, 1);
  if (pose === 'sit') px(ctx, style.packDark, x, y + packH - 2, packW, 1);
}

function drawLeg(ctx, figure, style, leg, far, pose, frame) {
  const { metrics } = figure;
  const width = Math.max(2, metrics.limb - 1 - (far ? 1 : 0));
  const base = far ? style.trousersDark : style.trousers;
  const light = far ? style.trousers : style.trousersLight;
  const dark = style.trousersDark;
  outlinedPath(ctx, [leg.hip, leg.knee, leg.foot], base, Math.max(2, width));
  if (!far) {
    px(ctx, light, leg.hip.x - 1, leg.hip.y, 1, Math.max(2, metrics.legH - 4));
    px(ctx, light, leg.knee.x - 1, leg.knee.y - 1, 2, 1);
  }
  px(ctx, dark, leg.knee.x + 1, leg.knee.y, 2, 2);
  // Trouser cuff just above the shoe.
  px(ctx, style.trousersDark, leg.foot.x - 1, leg.foot.y - 2, 3, 1);
  drawShoe(ctx, style, leg.foot, far, leg.lift, pose, frame);
}

function drawShoe(ctx, style, foot, far, lift, pose, frame) {
  const kind = style.shoes;
  const x = foot.x - 2;
  const y = foot.y;
  if (kind === 'boot') {
    const top = y - 2;
    px(ctx, INK, x - 1, top - 1, 6, 7);
    px(ctx, style.shoeShade, x, top, 5, 5);
    px(ctx, far ? style.shoeShade : style.shoe, x, top, 4, 5);
    px(ctx, far ? style.shoeShade : style.shoeLight, x + 1, top, 2, 1);
    px(ctx, style.shoeShade, x, top, 4, 2);
    px(ctx, style.sole, x - 1, y + 4, 6, 1);
    px(ctx, style.gold, x + 1, top, 1, 1);
    return;
  }
  if (kind === 'sneaker') {
    px(ctx, INK, x - 1, y - 1, 6, 5);
    px(ctx, far ? style.shoeShade : style.shoe, x, y, 5, 4);
    px(ctx, far ? style.shoeShade : style.shoeLight, x + 1, y, 4, 1);
    px(ctx, style.accent, x + 1, y + 1, 3, 1);
    px(ctx, style.accentLight, x + 2, y + 1, 1, 1);
    px(ctx, style.sole, x - 1, y + 4, 6, 1);
    px(ctx, style.shoeShade, x, y + 3, 4, 1);
    if (!far) {
      px(ctx, style.shoeShade, x + 2, y + 1, 1, 1);
      px(ctx, style.shoeLight, x + 3, y + 1, 1, 1);
    }
    return;
  }
  // Neat leather town shoe.
  px(ctx, INK, x - 1, y, 5, 5);
  px(ctx, far ? style.shoeShade : style.shoe, x, y + 1, 4, 3);
  px(ctx, far ? style.shoeShade : style.shoeLight, x + 1, y + 1, 2, 1);
  px(ctx, style.sole, x - 1, y + 4, 5, 1);
  if (!far && pose === 'walk' && frame % 2 === 0) px(ctx, style.accent, x + 3, y + 2, 1, 1);
  if (lift > 1) px(ctx, style.shoeShade, x + 1, y + 4, 2, 1);
}

function drawArm(ctx, figure, style, arm, far, pose) {
  const { metrics } = figure;
  const width = Math.max(2, metrics.limb - 1);
  const sleeve = far ? style.coatDark : style.coat;
  const elbow = arm.elbow;
  const wrist = { x: arm.hand.x + 1, y: arm.hand.y + 1 };
  const rolled = style.sleeves === 'rolled';
  const short = style.sleeves === 'short';
  if (short) {
    outlinedLine(ctx, arm.shoulder.x, arm.shoulder.y, elbow.x, elbow.y, sleeve, width);
    outlinedLine(ctx, elbow.x, elbow.y, wrist.x, wrist.y, far ? style.skinShade : style.skin, width - 1);
  } else if (rolled) {
    outlinedPath(ctx, [arm.shoulder, elbow, wrist], sleeve, width - 1);
    pixelLine(ctx, arm.elbow.x, arm.elbow.y, arm.hand.x + 1, arm.hand.y + 1,
      far ? style.skinShade : style.skin, width - 1);
    px(ctx, style.coatDark, elbow.x - 1, elbow.y - 1, 3, 2);
    px(ctx, far ? style.coatDark : style.coatLight, elbow.x - 1, elbow.y - 1, 2, 1);
  } else {
    outlinedPath(ctx, [arm.shoulder, elbow, wrist], sleeve, width);
    if (!far) {
      px(ctx, style.coatLight, arm.shoulder.x - 2, arm.shoulder.y + 1, 1, 2);
      px(ctx, style.coatLight, elbow.x - 1, elbow.y, 1, 1);
    }
    px(ctx, style.coatDark, wrist.x - 1, wrist.y - 1, 2, 1);
    px(ctx, style.shirtLight, wrist.x - 1, wrist.y, 2, 1);
  }
  const hand = arm.hand;
  px(ctx, INK, hand.x - 1, hand.y - 1, 4, 4);
  px(ctx, far ? style.skinShade : style.skin, hand.x, hand.y, 3, 3);
  px(ctx, far ? style.skinShade : style.skinLight, hand.x, hand.y, 2, 1);
  if (pose === 'hold' && !far) {
    px(ctx, style.skinLight, hand.x + 2, hand.y, 1, 2);
    px(ctx, style.skinShade, hand.x + 1, hand.y + 2, 2, 1);
  }
}

function torsoRows(x, y, w) {
  return [
    [x + 2, y, w - 4],
    [x + 1, y + 1, w - 2],
    [x, y + 2, w],
  ];
}

function drawTorso(ctx, figure, style, layout, pose) {
  const { metrics } = figure;
  const x = layout.torso.x;
  const y = layout.torso.y;
  const w = metrics.torsoW;
  const h = metrics.torsoH;
  const base = style.coat;
  const light = style.coatLight;
  const dark = style.coatDark;
  // Structured shoulders, then texture clusters and an upper-left light edge.
  torsoRows(x, y, w).forEach(([rx, ry, rw]) => px(ctx, INK, rx, ry, rw, 1));
  for (let row = 0; row < h; row += 1) {
    const inset = row < 2 ? 2 - row : 0;
    px(ctx, base, x + inset, y + row, w - inset * 2, 1);
  }
  px(ctx, dark, x + w - 2, y + 2, 2, h - 3);
  px(ctx, dark, x + 1, y + h - 1, w - 2, 1);
  px(ctx, light, x + 1, y + 2, 1, Math.max(2, h - 5));
  px(ctx, light, x + 3, y + 1, Math.max(2, w - 7), 1);
  px(ctx, style.coatDeep, x, y + h - 2, 2, 1);
  px(ctx, style.coatDeep, x + w - 2, y + h - 2, 2, 1);

  const beltY = y + h - 3;
  const build = style.build;
  if (build === 'coat') {
    // Open jacket showing a shirt wedge, drawcord and zip.
    px(ctx, style.shirt, x + w - 5, y + 1, 3, 3);
    px(ctx, style.shirtLight, x + w - 4, y + 1, 1, 2);
    px(ctx, dark, x + w - 6, y + 1, 1, 5);
    px(ctx, style.accent, x + w - 4, y + 3, 1, h - 7);
    px(ctx, style.accentDark, x + w - 4, y + 3, 1, 1);
    px(ctx, dark, x + 2, y + 3, w - 4, 1);
    px(ctx, light, x + 3, y + 2, 2, 1);
    px(ctx, style.coatDeep, x + 2, beltY, w - 4, 2);
    px(ctx, style.gold, x + 2, beltY, 2, 2);
    px(ctx, style.goldLight, x + 2, beltY, 1, 1);
    px(ctx, style.trousersDark, x + w - 7, y + h - 5, 3, 2);
    px(ctx, style.accentDark, x + w - 7, y + h - 5, 3, 1);
  } else if (build === 'vest') {
    px(ctx, style.shirt, x + 1, y + 1, w - 2, h - 3);
    px(ctx, style.shirtLight, x + 2, y + 1, 2, 1);
    px(ctx, style.coat, x + 1, y + 2, 4, h - 3);
    px(ctx, style.coat, x + w - 5, y + 2, 4, h - 3);
    px(ctx, style.coatDark, x + 1, y + 2, 1, h - 3);
    px(ctx, style.coatLight, x + w - 5, y + 2, 1, 2);
    px(ctx, style.shirtDark, x + 5, y + 2, 1, h - 5);
    px(ctx, style.gold, x + 6, y + 5, 1, 1);
    px(ctx, style.gold, x + 6, y + 9, 1, 1);
    px(ctx, style.accent, x + 5, y + 3, 1, 1);
  } else if (build === 'dress') {
    px(ctx, style.shirt, x + w - 6, y + 1, 4, 3);
    px(ctx, style.shirtLight, x + w - 5, y + 1, 2, 1);
    px(ctx, dark, x + 4, y + 4, w - 5, 1);
    px(ctx, style.accent, x + 2, y + 5, w - 4, 1);
    px(ctx, style.accentLight, x + 3, y + 5, 2, 1);
    px(ctx, style.gold, x + w - 5, y + 6, 2, 2);
    px(ctx, style.goldLight, x + w - 5, y + 6, 1, 1);
    px(ctx, style.coatLight, x + 2, y + 2, 1, 3);
    px(ctx, style.coatDeep, x + 4, y + h - 2, w - 7, 1);
  } else if (build === 'overalls') {
    px(ctx, style.shirt, x + 1, y + 1, w - 2, h - 2);
    px(ctx, style.shirtLight, x + 2, y + 1, 2, 1);
    px(ctx, style.coat, x + 3, y + 3, w - 6, h - 4);
    px(ctx, style.coatLight, x + 4, y + 3, 2, 1);
    px(ctx, style.coatDark, x + 3, y + 3, 1, h - 4);
    px(ctx, style.coat, x + 3, y + 1, 2, 2);
    px(ctx, style.coat, x + w - 5, y + 1, 2, 2);
    px(ctx, style.gold, x + 3, y + 2, 1, 1);
    px(ctx, style.gold, x + w - 4, y + 2, 1, 1);
    px(ctx, style.coatDark, x + 3, y + h - 3, w - 6, 2);
    px(ctx, style.goldLight, x + 4, y + h - 3, 1, 1);
  } else if (build === 'raincoat') {
    px(ctx, style.shirt, x + w - 5, y + 1, 3, 2);
    px(ctx, dark, x + 4, y + 2, 1, h - 4);
    px(ctx, style.coatDark, x + w - 5, y + 2, 1, h - 5);
    px(ctx, style.gold, x + w - 5, y + 4, 1, 1);
    px(ctx, style.gold, x + w - 5, y + 7, 1, 1);
    px(ctx, style.gold, x + w - 5, y + 10, 1, 1);
    px(ctx, style.coatDark, x + 1, y + 1, w - 2, 2);
    px(ctx, style.coatLight, x + 2, y + 1, 2, 1);
    px(ctx, style.coatDark, x + 2, y + h - 2, w - 4, 1);
  } else if (build === 'tabard') {
    px(ctx, style.shirt, x + 1, y + 1, w - 2, h - 2);
    px(ctx, style.shirtLight, x + 2, y + 1, 2, 1);
    px(ctx, style.apron, x + 4, y + 2, w - 8, h - 3);
    px(ctx, style.apronLight, x + 5, y + 2, 2, 1);
    px(ctx, style.apronDark, x + 4, y + 2, 1, h - 3);
    px(ctx, style.accent, x + 4, y + 2, w - 8, 1);
    px(ctx, style.accent, x + 4, y + h - 3, w - 8, 1);
    px(ctx, style.accent, x + 6, y + 5, 1, 4);
    px(ctx, style.accentLight, x + 6, y + 5, 1, 1);
    px(ctx, style.metal, x + w - 7, y + 4, 2, 2);
  } else if (build === 'cardigan') {
    px(ctx, style.shirt, x + 2, y + 1, w - 4, h - 3);
    px(ctx, style.shirtLight, x + 3, y + 1, 2, 1);
    px(ctx, style.shawl, x + 1, y + 1, 4, 3);
    px(ctx, style.shawlLight, x + 2, y + 1, 2, 1);
    px(ctx, style.shawl, x + w - 5, y + 1, 4, 3);
    px(ctx, style.shawlDark, x + 1, y + 3, 3, 1);
    px(ctx, style.coatDark, x + 5, y + 4, 1, h - 5);
    px(ctx, style.gold, x + 6, y + 6, 1, 1);
    px(ctx, style.gold, x + 6, y + 9, 1, 1);
    px(ctx, style.coatDark, x + 1, y + h - 2, w - 2, 1);
  } else if (build === 'apron') {
    px(ctx, style.shirt, x + 1, y + 1, w - 2, h - 2);
    px(ctx, style.shirtLight, x + 2, y + 1, 2, 1);
    px(ctx, style.apron, x + 3, y + 3, w - 6, h - 3);
    px(ctx, style.apronLight, x + 4, y + 3, 2, 1);
    px(ctx, style.apronDark, x + 3, y + 3, 1, h - 3);
    px(ctx, style.apronDark, x + 3, y + h - 3, w - 6, 2);
    px(ctx, style.strap, x + 3, y + 1, 1, 3);
    px(ctx, style.strap, x + w - 4, y + 1, 1, 3);
    px(ctx, style.gold, x + 4, y + 4, 1, 1);
    px(ctx, style.gold, x + w - 5, y + 4, 1, 1);
    px(ctx, style.apronDark, x + 5, y + h - 5, 2, 2);
    if (style === STYLES.vendor) {
      px(ctx, style.apronDark, x + 3, y + 6, w - 6, 1);
      px(ctx, style.apron, x + 5, y + 9, w - 9, 1);
    }
  }
  px(ctx, style.gold, x + 2, beltY, 2, 2);
  px(ctx, style.goldLight, x + 2, beltY, 1, 1);
  if (pose === 'work') {
    px(ctx, style.coatDark, x + 2, y + 5, 2, 2);
    px(ctx, style.coatLight, x + 3, y + 5, 1, 1);
  }
}

function drawSkirtOrApron(ctx, figure, style, layout, pose, frame) {
  const { metrics } = figure;
  const x = layout.torso.x;
  const y = layout.torso.y;
  const w = metrics.torsoW;
  const h = metrics.torsoH;
  const waistY = y + h - 3;
  const needSkirt = style.build === 'dress';
  const needApron = style.build === 'apron';
  if (!needSkirt && !needApron) return;
  const fabric = needSkirt ? style.skirt : style.apron;
  const fabricLight = needSkirt ? style.skirtLight : style.apronLight;
  const fabricDark = needSkirt ? style.skirtDark : style.apronDark;

  if (pose === 'sit') {
    const rows = Math.max(4, Math.round(metrics.legH * 0.5));
    for (let row = 0; row < rows; row += 1) {
      const t = row / rows;
      const left = x + 1 - Math.round(t * 2);
      const right = x + w + Math.round(t * 5);
      px(ctx, fabric, left, waistY + row, right - left, 1);
      if (row === 0) px(ctx, fabricLight, left + 1, waistY, Math.max(2, right - left - 3), 1);
      if (row === rows - 1) px(ctx, fabricDark, left, waistY + row, right - left, 1);
    }
    px(ctx, fabricDark, x + w - 1, waistY, 1, rows);
    px(ctx, fabricLight, x + 1, waistY, 1, Math.min(3, rows));
    return;
  }

  const length = Math.max(4, Math.round(metrics.legH * (pose === 'crouch' ? 0.4 : 0.58)));
  const sway = pose === 'walk' ? (frame % 2 ? 1 : -1) : 0;
  const start = waistY + 1;
  const topLeft = x + (needSkirt ? 0 : 1);
  const topWidth = needSkirt ? w : w - 4;
  for (let row = 0; row < length; row += 1) {
    const t = row / length;
    const left = topLeft - Math.round(t * 3) + sway;
    const right = topLeft + topWidth + Math.round(t * (needSkirt ? 4 : 3)) + sway;
    px(ctx, fabric, left, start + row, right - left, 1);
    if (row === 0) px(ctx, fabricLight, left + 1, start + row, Math.max(2, right - left - 3), 1);
    if (row === length - 1) px(ctx, fabricDark, left, start + row, right - left, 1);
  }
  const hemY = start + length - 1;
  const hemLeft = topLeft - 3 + sway;
  const hemRight = topLeft + topWidth + (needSkirt ? 4 : 3) + sway;
  px(ctx, fabricDark, x + Math.round(w / 2) + sway, start + 2, 1, length - 3);
  if (needSkirt) {
    px(ctx, fabricDark, x + 3 + sway, start + 3, 1, length - 4);
    px(ctx, fabricLight, x + w - 2 + sway, start + 2, 1, 2);
    px(ctx, style.accent, x, waistY, w, 1);
    px(ctx, style.accentLight, x + 1, waistY, 3, 1);
    px(ctx, style.gold, x + Math.round(w / 2), waistY, 2, 2);
    px(ctx, style.goldLight, x + Math.round(w / 2), waistY, 1, 1);
  } else {
    // Patch pocket, ties and a stitched hem make work clothes read.
    px(ctx, fabricDark, x + 3 + sway, start + 2, 2, 2);
    px(ctx, fabricLight, x + 4 + sway, start + 2, 1, 1);
    px(ctx, fabricDark, hemLeft, hemY, hemRight - hemLeft, 1);
    px(ctx, style.strap, x + 1, waistY, 2, 1);
    px(ctx, style.strap, x + w - 1, waistY, 2, 1);
  }
  if (pose === 'work') px(ctx, fabricLight, hemLeft + 2, hemY - 1, Math.max(2, hemRight - hemLeft - 5), 1);
}

function drawStraps(ctx, figure, style, layout) {
  if (!style.packStyle) return;
  const { metrics } = figure;
  const x = layout.torso.x;
  const y = layout.torso.y;
  const w = metrics.torsoW;
  if (style.packStyle === 'backpack') {
    pixelLine(ctx, x + w - 3, y + 1, x + w - 4, y + metrics.torsoH - 4, style.strap, 1);
    px(ctx, style.gold, x + w - 4, y + 5, 2, 2);
    px(ctx, style.goldLight, x + w - 4, y + 5, 1, 1);
    px(ctx, style.strap, x + 2, y + 2, 1, 4);
  } else {
    pixelLine(ctx, x + 2, y + 1, x + w - 3, y + metrics.torsoH - 4, style.strap, 1);
    px(ctx, style.gold, x + w - 5, y + 4, 2, 2);
    px(ctx, style.goldLight, x + w - 5, y + 4, 1, 1);
  }
}

function drawHead(ctx, figure, style, layout, pose, frame) {
  const { metrics } = figure;
  const hx = figure.headX + layout.headDX + layout.torsoDX;
  const hy = figure.top + layout.bodyDY + layout.headDY + figure.headDY;
  const hw = metrics.headW;
  const hh = metrics.headH;
  const cx = 16 + layout.torsoDX;
  const neckTop = hy + hh - 2;
  px(ctx, INK_SOFT, cx - 2, neckTop, 4, 4);
  px(ctx, style.skinShade, cx - 1, neckTop, 3, 3);
  px(ctx, style.skin, cx - 1, neckTop, 2, 2);

  drawBackHair(ctx, figure, style, hx, hy, hw, hh, layout);

  // Face is a three-quarter turn toward the right edge of the canvas.
  px(ctx, style.skinShade, hx + 1, hy + 2, hw - 1, hh - 2);
  px(ctx, style.skin, hx + 2, hy + 2, hw - 2, hh - 3);
  px(ctx, style.skinLight, hx + 3, hy + 3, 3, 1);
  px(ctx, style.skinShade, hx + 3, hy + hh - 3, hw - 4, 1);
  px(ctx, style.skinShade, hx + 2, hy + hh - 2, 1, 1);
  px(ctx, style.skinShade, hx + hw - 2, hy + 4, 1, 4);
  px(ctx, style.skinDeep, hx + hw - 1, hy + 6, 1, 2);
  // Ear and jaw.
  px(ctx, style.skinShade, hx + 1, hy + 5, 1, 2);
  px(ctx, style.skin, hx + 1, hy + 5, 1, 1);
  px(ctx, style.skinDeep, hx + 2, hy + hh - 2, hw - 5, 1);

  drawHairFront(ctx, figure, style, hx, hy, hw, hh);
  drawFaceSide(ctx, figure, style, hx, hy, hw, hh, pose, frame);
  drawHatSide(ctx, style, hx, hy, hw, hh);
}

function drawBackHair(ctx, figure, style, hx, hy, hw, hh) {
  const hair = style.hair;
  const dark = style.hairDark;
  const light = style.hairLight;
  if (style.hairStyle === 'long' || style.hairStyle === 'ponytail') {
    px(ctx, INK, hx - 2, hy + 1, 4, hh);
    px(ctx, dark, hx - 1, hy + 2, 3, hh + 3);
    px(ctx, hair, hx - 1, hy + 2, 2, hh + 2);
    px(ctx, light, hx - 1, hy + 3, 1, 3);
    if (style.hairStyle === 'ponytail') {
      px(ctx, INK, hx - 4, hy + 3, 3, 8);
      px(ctx, dark, hx - 3, hy + 3, 2, 7);
      px(ctx, hair, hx - 3, hy + 2, 2, 6);
      px(ctx, light, hx - 3, hy + 3, 1, 2);
      px(ctx, style.ribbon || style.accent, hx - 3, hy + 2, 2, 2);
    }
  } else if (style.hairStyle === 'bun' || style.hairStyle === 'elder') {
    px(ctx, INK, hx - 2, hy, 5, 4);
    px(ctx, dark, hx - 1, hy + 1, 3, 2);
    px(ctx, hair, hx - 1, hy, 3, 2);
    px(ctx, light, hx, hy, 1, 1);
    px(ctx, style.skinShade, hx, hy + 2, 1, 2);
  } else if (style.hairStyle === 'tousled') {
    px(ctx, dark, hx - 1, hy + 1, 2, 5);
    px(ctx, hair, hx, hy + 2, 1, 3);
  }
}

function drawHairFront(ctx, figure, style, hx, hy, hw) {
  const hair = style.hair;
  const dark = style.hairDark;
  const light = style.hairLight;
  const hairStyle = style.hairStyle;
  if (hairStyle === 'short' || hairStyle === 'bandana') {
    px(ctx, INK, hx + 1, hy, hw - 2, 4);
    px(ctx, dark, hx + 1, hy + 1, hw - 2, 3);
    px(ctx, hair, hx + 2, hy, hw - 3, 3);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, hair, hx + 1, hy + 3, 2, 4);
    px(ctx, dark, hx + 2, hy + 5, 1, 3);
    px(ctx, hair, hx + hw - 3, hy + 2, 1, 2);
  } else if (hairStyle === 'elder') {
    px(ctx, INK, hx + 1, hy + 1, hw - 2, 3);
    px(ctx, dark, hx + 1, hy + 1, hw - 2, 2);
    px(ctx, hair, hx + 2, hy, hw - 3, 2);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, hair, hx + 1, hy + 2, 2, 3);
    px(ctx, hair, hx + hw - 3, hy + 1, 2, 3);
    px(ctx, style.skinShade, hx + 4, hy + 1, hw - 6, 1);
  } else if (hairStyle === 'long' || hairStyle === 'ponytail' || hairStyle === 'bun') {
    px(ctx, INK, hx, hy, hw - 1, 4);
    px(ctx, dark, hx, hy + 1, hw - 1, 3);
    px(ctx, hair, hx + 1, hy, hw - 2, 3);
    px(ctx, light, hx + 2, hy, 4, 1);
    px(ctx, hair, hx + 1, hy + 3, 4, 2);
    px(ctx, hair, hx + hw - 2, hy + 2, 1, 2);
    px(ctx, hair, hx, hy + 3, 2, 5);
    px(ctx, dark, hx + 1, hy + 6, 1, 3);
    if (hairStyle === 'bun') px(ctx, style.ribbon || style.accent, hx + 2, hy + 1, 2, 1);
  } else {
    // Messy teenage crown: dark mass with three readable spikes and a fringe.
    px(ctx, INK, hx, hy, hw - 1, 5);
    px(ctx, dark, hx + 1, hy - 1, hw - 3, 5);
    px(ctx, hair, hx + 1, hy, hw - 2, 4);
    px(ctx, dark, hx, hy + 2, 2, 5);
    px(ctx, hair, hx - 1, hy + 1, 2, 2);
    px(ctx, hair, hx + 2, hy - 1, 2, 1);
    px(ctx, hair, hx + 6, hy - 2, 2, 2);
    px(ctx, hair, hx + 9, hy, 2, 2);
    px(ctx, light, hx + 2, hy, 3, 1);
    px(ctx, light, hx + 7, hy - 1, 1, 1);
    px(ctx, hair, hx + 2, hy + 3, 5, 1);
    px(ctx, dark, hx + 5, hy + 4, 1, 1);
    px(ctx, hair, hx + 7, hy + 3, 1, 2);
    px(ctx, dark, hx + 1, hy + 5, 1, 2);
  }
}

function drawFaceSide(ctx, figure, style, hx, hy, hw, hh, pose, frame) {
  const eyeY = hy + Math.max(4, Math.round(hh * 0.47));
  const eyeX = hx + Math.max(5, hw - 4);
  const browY = eyeY - 1;
  const blink = pose === 'idle' && frame % 5 === 4;
  px(ctx, style.hairDark, eyeX - 1, browY, 3, 1);
  if (pose === 'work' || pose === 'crouch') px(ctx, style.hairDark, eyeX - 1, browY - 1, 2, 1);
  if (pose === 'jump') px(ctx, style.hairDark, eyeX - 1, browY - 1, 3, 1);
  if (blink) {
    px(ctx, style.hairDark, eyeX, eyeY + 1, 2, 1);
  } else {
    px(ctx, style.skinLight, eyeX, eyeY, 2, 1);
    px(ctx, style.hairDark, eyeX + 1, eyeY, 1, 2);
    px(ctx, WHITE, eyeX, eyeY, 1, 1);
  }
  // Nose, cheek and mouth sit on the three-quarter front plane.
  px(ctx, style.skinLight, hx + hw - 1, eyeY + 1, 1, 1);
  px(ctx, style.skinShade, hx + hw - 1, eyeY + 2, 1, 1);
  px(ctx, style.skinDeep, hx + hw - 2, eyeY + 3, 1, 1);
  const mouthY = hy + hh - 3;
  if (pose === 'jump') {
    px(ctx, style.accentDark, hx + hw - 4, mouthY, 2, 2);
    px(ctx, style.skinDeep, hx + hw - 3, mouthY + 1, 1, 1);
  } else if (pose === 'work' || pose === 'crouch') {
    px(ctx, style.skinDeep, hx + hw - 4, mouthY, 2, 1);
    px(ctx, style.skinShade, hx + hw - 5, mouthY + 1, 1, 1);
  } else {
    px(ctx, style.skinDeep, hx + hw - 4, mouthY, 2, 1);
    px(ctx, style.skinLight, hx + hw - 4, mouthY - 1, 1, 1);
  }
  if (figure.ageKey === 'child' || style.build === 'dress') {
    px(ctx, style.accentLight, hx + hw - 3, mouthY - 1, 1, 1);
  }
}

function drawHatSide(ctx, style, hx, hy, hw) {
  const hat = style.hat;
  const light = style.hatLight || style.hat;
  const dark = style.hatDark || style.hat;
  if (!style.hatStyle || !hat) return;
  if (style.hatStyle === 'baker') {
    px(ctx, INK, hx + 2, hy - 3, hw - 3, 5);
    px(ctx, hat, hx + 3, hy - 3, hw - 5, 2);
    px(ctx, light, hx + 4, hy - 3, 3, 1);
    px(ctx, dark, hx + 3, hy - 1, hw - 5, 1);
    px(ctx, dark, hx + 2, hy, hw - 3, 2);
    px(ctx, style.hat, hx + 2, hy + 1, hw - 3, 1);
    return;
  }
  if (style.hatStyle === 'straw') {
    px(ctx, INK, hx - 1, hy, hw + 1, 3);
    px(ctx, INK, hx + 2, hy - 2, hw - 4, 4);
    px(ctx, dark, hx + 3, hy - 1, hw - 6, 2);
    px(ctx, hat, hx + 3, hy - 1, hw - 5, 2);
    px(ctx, light, hx + 4, hy - 1, 3, 1);
    px(ctx, hat, hx - 1, hy + 1, hw + 2, 1);
    px(ctx, dark, hx, hy + 2, hw + 1, 1);
    px(ctx, style.accent, hx + hw - 5, hy, 2, 1);
    px(ctx, style.accentLight, hx + hw - 5, hy, 1, 1);
    return;
  }
  if (style.hatStyle === 'bucket') {
    px(ctx, INK, hx + 2, hy - 1, hw - 3, 4);
    px(ctx, dark, hx + 2, hy, hw - 3, 3);
    px(ctx, hat, hx + 3, hy - 1, hw - 5, 3);
    px(ctx, light, hx + 4, hy - 1, 3, 1);
    px(ctx, hat, hx, hy + 2, hw + 1, 1);
    px(ctx, dark, hx, hy + 3, hw + 1, 1);
    px(ctx, style.strap, hx + 3, hy + 2, hw - 5, 1);
    return;
  }
  if (style.hatStyle === 'helmet') {
    px(ctx, INK, hx + 1, hy - 1, hw - 2, 5);
    px(ctx, dark, hx + 1, hy, hw - 2, 4);
    px(ctx, hat, hx + 2, hy - 1, hw - 4, 3);
    px(ctx, light, hx + 3, hy - 1, 3, 1);
    px(ctx, light, hx + 2, hy, 1, 2);
    px(ctx, style.metalDark, hx + 1, hy + 3, hw - 2, 1);
    px(ctx, style.metal, hx + hw - 3, hy + 3, 1, 3);
    px(ctx, style.gold, hx + 4, hy + 1, 1, 1);
    return;
  }
  if (style.hatStyle === 'brim') {
    px(ctx, INK, hx - 1, hy + 1, hw + 1, 2);
    px(ctx, INK, hx + 2, hy - 2, hw - 4, 4);
    px(ctx, dark, hx + 1, hy + 1, hw - 1, 1);
    px(ctx, hat, hx - 1, hy + 2, hw + 1, 1);
    px(ctx, dark, hx, hy + 3, hw, 1);
    px(ctx, hat, hx + 3, hy - 1, hw - 6, 3);
    px(ctx, light, hx + 4, hy - 1, 2, 1);
    px(ctx, style.accent, hx + hw - 5, hy - 2, 2, 1);
    px(ctx, style.accentLight, hx + hw - 4, hy - 3, 1, 1);
    return;
  }
  if (style.hatStyle === 'scarf') {
    px(ctx, INK, hx + 1, hy - 1, hw - 2, 5);
    px(ctx, dark, hx + 1, hy, hw - 2, 4);
    px(ctx, hat, hx + 2, hy - 1, hw - 3, 3);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, dark, hx + 2, hy + 3, hw - 3, 1);
    px(ctx, hat, hx - 1, hy + 1, 2, 2);
    px(ctx, dark, hx - 2, hy + 2, 2, 3);
    return;
  }
  if (style.hatStyle === 'flatcap') {
    px(ctx, INK, hx + 1, hy - 1, hw - 1, 4);
    px(ctx, dark, hx + 1, hy, hw - 1, 3);
    px(ctx, hat, hx + 2, hy - 1, hw - 3, 2);
    px(ctx, light, hx + 3, hy - 1, 3, 1);
    px(ctx, dark, hx + 2, hy + 2, hw - 2, 1);
    px(ctx, hat, hx + hw - 2, hy + 1, 3, 1);
    return;
  }
  if (style.hatStyle === 'bandana') {
    px(ctx, INK, hx + 1, hy, hw - 2, 3);
    px(ctx, dark, hx + 1, hy + 1, hw - 2, 2);
    px(ctx, hat, hx + 2, hy, hw - 3, 2);
    px(ctx, light, hx + 3, hy, 2, 1);
    px(ctx, hat, hx - 1, hy + 2, 2, 2);
    px(ctx, dark, hx - 2, hy + 3, 2, 3);
  }
}

function drawTorchAt(ctx, style, hand, frame, lit = true) {
  const f = wrap(frame, 4);
  const x = hand.x + 1;
  const top = hand.y - 8 - (f === 1 ? 1 : 0);
  px(ctx, INK, x - 1, top, 3, 12);
  px(ctx, style.strap, x, top + 1, 1, 8);
  px(ctx, '#8a5b34', x, top + 2, 1, 7);
  px(ctx, style.goldDark, x - 1, top + 5, 3, 1);
  px(ctx, style.gold, x, top + 5, 1, 1);
  if (!lit) {
    // Wrapped dark wick remains visible while the shaft leaves the backpack.
    px(ctx, style.strap, x - 1, top - 2, 3, 3);
    px(ctx, style.packLight, x, top - 2, 1, 2);
    return;
  }
  // Layered flat flame clusters (never a gradient).
  const flick = f === 0 ? 0 : f === 1 ? 1 : f === 2 ? -1 : 0;
  px(ctx, style.flameOuter, x - 2 + flick, top - 4, 3, 4);
  px(ctx, style.flameOuter, x, top - 5, 2, 3);
  px(ctx, style.flame, x - 1 + flick, top - 3, 2, 4);
  px(ctx, style.flame, x, top - 4, 1, 3);
  px(ctx, style.flameCore, x - 1, top - 2, 1, 3);
  px(ctx, style.flameCore, x, top - 3, 1, 1);
  px(ctx, style.flameOuter, x + 2 - flick, top - 2, 1, 1);
  px(ctx, style.flame, x - 2, top - 5 + (f % 2), 1, 1);
  if (f === 3) px(ctx, style.flameCore, x + 2, top - 4, 1, 1);
}

function drawTool(ctx, style, layout, pose, frame) {
  if (pose !== 'work' || !style.tool) return;
  const hand = layout.nearArm.hand;
  const x = hand.x;
  const y = hand.y;
  const bob = frame % 2;
  if (style.tool === 'hoe') {
    pixelLine(ctx, x, y, x + 5, 44, INK, 2);
    pixelLine(ctx, x, y, x + 4, 43, '#8a5b34', 1);
    px(ctx, style.metalDark, x + 3, 42, 4, 2);
    px(ctx, style.metal, x + 3, 43, 3, 1);
    px(ctx, style.metalLight, x + 3, 43, 1, 1);
  } else if (style.tool === 'hammer') {
    pixelLine(ctx, x, y, x + 3, y + 5, '#6b442a', 2);
    px(ctx, style.metalDark, x + 1, y + 4 - bob, 5, 3);
    px(ctx, style.metal, x + 2, y + 4 - bob, 3, 1);
    px(ctx, style.metalLight, x + 2, y + 4 - bob, 1, 1);
  } else if (style.tool === 'loaf') {
    px(ctx, INK, x + 1, y - 2, 5, 4);
    px(ctx, style.gold, x + 1, y - 1, 4, 2);
    px(ctx, style.goldLight, x + 2, y - 1, 2, 1);
    px(ctx, style.goldDark, x + 1, y + 1, 4, 1);
    px(ctx, style.apronLight, x + 3, y - 1, 1, 1);
  } else if (style.tool === 'rod') {
    pixelLine(ctx, x, y, x + 6, y - 10, '#7a5233', 1);
    px(ctx, style.metalDark, x - 1, y - 1, 3, 3);
    px(ctx, style.gold, x, y, 1, 1);
    pixelLine(ctx, x + 6, y - 10, x + 6, y + 2, '#d6d2bd', 1);
    px(ctx, style.accent, x + 5, y + 2, 2, 2);
    px(ctx, style.accentLight, x + 5, y + 2, 1, 1);
  } else if (style.tool === 'spear') {
    const sx = x + 2;
    pixelLine(ctx, sx, 9, sx, 45, '#765034', 2);
    px(ctx, INK, sx - 2, 5, 5, 6);
    px(ctx, style.metalDark, sx - 1, 6, 3, 4);
    px(ctx, style.metal, sx, 5, 1, 5);
    px(ctx, style.metalLight, sx, 6, 1, 1);
    px(ctx, style.gold, sx - 1, 10, 3, 1);
    px(ctx, style.accentDark, sx + 1, 12, 2, 3);
    px(ctx, style.accent, sx + 1, 12, 1, 2);
  } else if (style.tool === 'basket') {
    px(ctx, INK, x + 1, y - 1, 7, 5);
    px(ctx, style.apron, x + 1, y, 6, 3);
    px(ctx, style.apronLight, x + 2, y, 2, 1);
    px(ctx, style.strap, x + 1, y + 2, 6, 1);
    px(ctx, style.strap, x + 2, y - 2, 4, 1);
    px(ctx, style.accent, x + 2, y - 1, 1, 1);
    px(ctx, style.apronDark, x + 5, y - 1, 1, 1);
  } else if (style.tool === 'lute') {
    px(ctx, INK, x + 1, y - 2, 5, 5);
    px(ctx, style.pack, x + 1, y - 1, 4, 3);
    px(ctx, style.packLight, x + 2, y - 1, 2, 1);
    px(ctx, style.packDark, x + 1, y + 1, 4, 1);
    px(ctx, style.strap, x + 5, y - 8, 1, 8);
    px(ctx, style.gold, x + 2, y - 1, 2, 1);
    px(ctx, WHITE, x + 5, y - 8, 1, 1);
  } else if (style.tool === 'can') {
    px(ctx, INK, x + 1, y - 1, 5, 5);
    px(ctx, style.metal, x + 1, y, 4, 3);
    px(ctx, style.metalLight, x + 2, y, 2, 1);
    px(ctx, style.metalDark, x + 1, y + 2, 4, 1);
    pixelLine(ctx, x + 5, y + 1, x + 7, y - 1, style.metal, 1);
    px(ctx, style.glassLight, x + 7, y, 1, 4);
    px(ctx, style.glass, x + 7, y + 3, 1, 1);
    if (bob) px(ctx, style.glassLight, x + 8, y + 4, 1, 1);
  }
}

function drawSeatedActor(ctx, figure, style, frame, torch) {
  const { metrics } = figure;
  const seatDY = figure.ageKey === 'child' ? 5 : 7;
  const torsoY = figure.torsoY + seatDY;
  const hipY = figure.hipY + seatDY;
  const shoulderY = figure.shoulderY + seatDY;
  const torsoX = figure.torsoX;
  const cx = 16;
  const footY = ACTOR_BASELINE - 4;
  const nearArmHand = { x: cx + 4, y: hipY - 1 };
  const farArmHand = { x: cx - 4, y: hipY - 1 };
  const layout = {
    bodyDY: seatDY,
    torsoDX: 0,
    headDX: 0,
    headDY: 1,
    torso: { x: torsoX, y: torsoY },
    shoulderY,
    hipY,
    nearArm: {
      shoulder: { x: torsoX + metrics.torsoW - 1, y: shoulderY },
      elbow: { x: cx + 7, y: shoulderY + 4 },
      hand: nearArmHand,
    },
    farArm: {
      shoulder: { x: torsoX + 1, y: shoulderY + 1 },
      elbow: { x: cx - 6, y: shoulderY + 4 },
      hand: farArmHand,
    },
    nearLeg: {
      hip: { x: cx + 2, y: hipY },
      knee: { x: cx + 7, y: hipY + 1 },
      foot: { x: cx + 8, y: footY },
      lift: 0,
    },
    farLeg: {
      hip: { x: cx - 2, y: hipY },
      knee: { x: cx + 4, y: hipY + 2 },
      foot: { x: cx + 6, y: footY },
      lift: 0,
    },
    torchArm: torch ? 'near' : null,
  };
  if (torch) {
    layout.nearArm.hand = { x: torsoX + metrics.torsoW + 2, y: shoulderY + 1 };
    layout.nearArm.elbow = { x: torsoX + metrics.torsoW + 1, y: shoulderY + 4 };
    layout.torchArm = 'near';
  }
  drawBackpack(ctx, figure, style, layout, 'sit');
  drawLeg(ctx, figure, style, layout.farLeg, true, 'sit', frame);
  drawLeg(ctx, figure, style, layout.nearLeg, false, 'sit', frame);
  drawArm(ctx, figure, style, layout.farArm, true, 'sit');
  drawTorso(ctx, figure, style, layout, 'sit', frame);
  drawSkirtOrApron(ctx, figure, style, layout, 'sit', frame);
  drawArm(ctx, figure, style, layout.nearArm, false, 'sit');
  drawHead(ctx, figure, style, layout, 'sit', frame);
  drawStraps(ctx, figure, style, layout);
  if (torch) drawTorchAt(ctx, style, layout.nearArm.hand, frame);
}

function drawFrontActor(ctx, figure, style, frame, hold, torch) {
  const { metrics } = figure;
  const cx = 16;
  const torsoX = figure.torsoX;
  const torsoY = figure.torsoY;
  const shoulderY = figure.shoulderY;
  const hipY = figure.hipY;
  const footY = ACTOR_BASELINE - 4;
  const layout = {
    torso: { x: torsoX, y: torsoY },
    shoulderY,
    hipY,
  };

  drawFrontPack(ctx, figure, style);
  // Staggered feet keep the silhouette from becoming a flat slab.
  drawFrontLeg(ctx, figure, style, cx - 3, hipY, footY, true);
  drawFrontLeg(ctx, figure, style, cx + 2, hipY, footY, false);
  drawFrontArm(ctx, figure, style, torsoX - 1, shoulderY, hipY, true, hold, torch);
  drawTorso(ctx, figure, style, layout, 'stare', frame);
  drawFrontTorsoExtras(ctx, figure, style, torsoX, torsoY, shoulderY, hipY);
  drawFrontSkirt(ctx, figure, style, torsoX, torsoY, hipY);
  drawFrontArm(ctx, figure, style, torsoX + metrics.torsoW, shoulderY, hipY, false, hold, torch);
  drawFrontHairBack(ctx, figure, style, torsoY);
  drawFrontHead(ctx, figure, style, frame);
  drawFrontStraps(ctx, figure, style, torsoX, torsoY);
  if (hold) {
    drawHoldArm(ctx, figure, style, torsoX + metrics.torsoW - 1, shoulderY);
  }
  if (torch) {
    const torchHand = hold
      ? { x: torsoX - 4, y: shoulderY + 1 }
      : { x: torsoX + metrics.torsoW + 1, y: shoulderY + 1 };
    drawTorchAt(ctx, style, torchHand, frame);
  }
}

function drawFrontPack(ctx, figure, style) {
  if (style.packStyle !== 'backpack') return;
  const { metrics } = figure;
  const x = figure.torsoX;
  const y = figure.torsoY;
  px(ctx, INK, x - 3, y + 2, 4, metrics.torsoH - 1);
  px(ctx, style.packDark, x - 2, y + 2, 3, metrics.torsoH - 2);
  px(ctx, style.pack, x - 2, y + 3, 2, metrics.torsoH - 4);
  px(ctx, INK, x + metrics.torsoW - 1, y + 2, 4, metrics.torsoH - 1);
  px(ctx, style.packDark, x + metrics.torsoW - 1, y + 2, 3, metrics.torsoH - 2);
  px(ctx, style.pack, x + metrics.torsoW, y + 3, 2, metrics.torsoH - 4);
  px(ctx, style.pack, x + 2, y, metrics.torsoW - 4, 2);
  px(ctx, style.packLight, x + 3, y, 3, 1);
}

function drawFrontLeg(ctx, figure, style, x, hipY, footY, far) {
  const { metrics } = figure;
  const color = far ? style.trousersDark : style.trousers;
  const light = far ? style.trousers : style.trousersLight;
  outlinedLine(ctx, x, hipY - 1, x, footY, color, Math.max(2, metrics.limb - 1));
  if (!far) px(ctx, light, x - 1, hipY, 1, Math.max(2, footY - hipY - 3));
  px(ctx, style.trousersDark, x + 1, Math.round((hipY + footY) / 2), 1, 3);
  // Front-facing shoes.
  if (style.shoes === 'boot') {
    px(ctx, INK, x - 2, footY - 1, 5, 5);
    px(ctx, style.shoeShade, x - 2, footY, 5, 4);
    px(ctx, far ? style.shoeShade : style.shoe, x - 1, footY, 4, 3);
    px(ctx, far ? style.shoeShade : style.shoeLight, x, footY, 2, 1);
    px(ctx, style.sole, x - 2, footY + 3, 5, 1);
  } else if (style.shoes === 'sneaker') {
    px(ctx, INK, x - 2, footY - 1, 5, 5);
    px(ctx, far ? style.shoeShade : style.shoe, x - 2, footY, 5, 4);
    px(ctx, far ? style.shoeShade : style.shoeLight, x - 1, footY, 3, 1);
    px(ctx, style.accent, x - 2, footY + 1, 5, 1);
    px(ctx, style.sole, x - 2, footY + 4, 5, 1);
    px(ctx, WHITE, x, footY + 2, 1, 1);
  } else {
    px(ctx, INK, x - 2, footY, 5, 4);
    px(ctx, far ? style.shoeShade : style.shoe, x - 2, footY + 1, 4, 2);
    px(ctx, style.sole, x - 2, footY + 3, 5, 1);
    px(ctx, far ? style.shoeShade : style.shoeLight, x - 1, footY + 1, 2, 1);
  }
}

function drawFrontArm(ctx, figure, style, x, shoulderY, hipY, far, hold, torch) {
  if (torch && far === hold) {
    // The off arm holds the torch in a raised grip.
    outlinedPath(ctx, [{ x, y: shoulderY }, { x: x - 2, y: shoulderY + 4 }, { x: far ? figure.torsoX - 4 : figure.torsoX + figure.metrics.torsoW + 1, y: shoulderY + 1 }],
      far ? style.coatDark : style.coat, Math.max(2, figure.metrics.limb - 1));
    px(ctx, style.skinShade, x - 2, shoulderY, 2, 2);
    px(ctx, style.coatDark, x - 1, shoulderY + 2, 2, 1);
    return;
  }
  if ((!far && hold)) return; // The extended holding arm is drawn separately.
  const width = Math.max(2, figure.metrics.limb - 1);
  const sleeve = far ? style.coatDark : style.coat;
  const top = shoulderY;
  const bottom = hipY - 1;
  outlinedLine(ctx, x, top, x, bottom, sleeve, width);
  if (!far) {
    px(ctx, style.coatLight, x - 1, top + 1, 1, 3);
    px(ctx, style.shirtLight, x - 1, bottom, 2, 1);
  }
  px(ctx, INK, x - 1, bottom - 1, 4, 4);
  px(ctx, far ? style.skinShade : style.skin, x, bottom - 1, 2, 2);
  px(ctx, far ? style.skinShade : style.skinLight, x, bottom - 1, 1, 1);
}

function drawHoldArm(ctx, figure, style, shoulderX, shoulderY) {
  const hand = { x: 29, y: HOLD_HAND.y - 1 };
  outlinedPath(ctx, [
    { x: shoulderX, y: shoulderY + 1 },
    { x: 25, y: shoulderY + 4 },
    { x: hand.x + 1, y: hand.y + 1 },
  ], style.coat, Math.max(2, figure.metrics.limb - 1));
  px(ctx, style.coatLight, 24, shoulderY + 4, 2, 1);
  px(ctx, style.shirtLight, 27, hand.y + 1, 2, 1);
  // Three-pixel hand reaches the exact HOLD_HAND edge at x=31, y=26.
  px(ctx, INK, hand.x - 1, hand.y - 1, 4, 4);
  px(ctx, style.skin, hand.x, hand.y, 3, 2);
  px(ctx, style.skinLight, hand.x, hand.y, 2, 1);
  px(ctx, style.skinShade, hand.x + 1, hand.y + 1, 2, 1);
}

function drawFrontTorsoExtras(ctx, figure, style, x, y, shoulderY) {
  const { metrics } = figure;
  const w = metrics.torsoW;
  const build = style.build;
  const cx = 16;
  if (build === 'coat') {
    px(ctx, style.accent, cx, y + 4, 1, metrics.torsoH - 7);
    px(ctx, style.accentDark, cx, y + metrics.torsoH - 4, 1, 1);
    px(ctx, style.coatDark, x + 2, y + metrics.torsoH - 5, 2, 2);
    px(ctx, style.coatDark, x + w - 4, y + metrics.torsoH - 5, 2, 2);
    px(ctx, style.shirtLight, cx - 2, y + 1, 1, 2);
    px(ctx, style.shirtLight, cx + 1, y + 1, 1, 2);
  } else if (build === 'vest') {
    px(ctx, style.gold, cx, y + 5, 1, 1);
    px(ctx, style.gold, cx, y + 8, 1, 1);
    px(ctx, style.shirtDark, cx - 1, y + 2, 1, metrics.torsoH - 5);
  } else if (build === 'dress') {
    px(ctx, style.accent, x + 2, y + 5, w - 4, 1);
    px(ctx, style.gold, cx, y + 6, 1, 2);
    px(ctx, style.shirtLight, cx - 2, y + 1, 4, 1);
  } else if (build === 'overalls') {
    px(ctx, style.gold, x + 3, y + 2, 1, 1);
    px(ctx, style.gold, x + w - 4, y + 2, 1, 1);
    px(ctx, style.coatDark, x + 4, y + 4, w - 8, 1);
  } else if (build === 'apron') {
    px(ctx, style.apronLight, x + 4, y + 4, 2, 1);
    px(ctx, style.apronDark, x + 4, y + metrics.torsoH - 3, w - 8, 1);
  } else if (build === 'raincoat') {
    px(ctx, style.gold, cx, y + 4, 1, 1);
    px(ctx, style.gold, cx, y + 7, 1, 1);
    px(ctx, style.gold, cx, y + 10, 1, 1);
  } else if (build === 'tabard') {
    px(ctx, style.accent, cx, y + 3, 1, 6);
    px(ctx, style.accentLight, cx, y + 3, 1, 1);
    px(ctx, style.metal, cx - 1, y + 5, 3, 1);
  } else if (build === 'cardigan') {
    px(ctx, style.shawlLight, x + 3, y + 1, 2, 1);
    px(ctx, style.shawlLight, x + w - 5, y + 1, 2, 1);
    px(ctx, style.gold, cx, y + 5, 1, 1);
    px(ctx, style.gold, cx, y + 8, 1, 1);
  }
  px(ctx, style.gold, x + 2, shoulderY + metrics.torsoH - 6, 2, 2);
}

function drawFrontSkirt(ctx, figure, style, x, y) {
  const { metrics } = figure;
  const w = metrics.torsoW;
  const isDress = style.build === 'dress';
  const isApron = style.build === 'apron';
  if (!isDress && !isApron) return;
  const fabric = isDress ? style.skirt : style.apron;
  const light = isDress ? style.skirtLight : style.apronLight;
  const dark = isDress ? style.skirtDark : style.apronDark;
  const waistY = y + metrics.torsoH - 3;
  const length = Math.max(3, Math.round(metrics.legH * (isDress ? 0.52 : 0.4)));
  const maxHalf = isDress ? Math.round(w / 2) + 4 : Math.round(w / 2) + 1;
  for (let row = 0; row < length; row += 1) {
    const half = Math.round((w - 1) / 2) + Math.round((row / length) * (maxHalf - Math.round((w - 1) / 2)));
    const left = 16 - half;
    px(ctx, fabric, left, waistY + row, half * 2 + 1, 1);
    if (row === 0) px(ctx, light, left + 1, waistY, half * 2 - 2, 1);
    if (row === length - 1) px(ctx, dark, left, waistY + row, half * 2 + 1, 1);
  }
  px(ctx, dark, 16, waistY + 2, 1, length - 3);
  if (isDress) {
    px(ctx, fabricDarkSafe(style), 16 - Math.round(w / 2), waistY + 2, 1, length - 3);
    px(ctx, fabricDarkSafe(style), 16 + Math.round(w / 2), waistY + 2, 1, length - 3);
    px(ctx, style.accent, x, waistY - 1, w, 1);
    px(ctx, style.gold, 16, waistY, 2, 2);
    px(ctx, style.goldLight, 16, waistY, 1, 1);
  } else {
    px(ctx, dark, x + 2, waistY + 1, 2, 2);
    px(ctx, style.strap, x + 1, waistY, 1, 1);
    px(ctx, style.strap, x + w - 2, waistY, 1, 1);
  }
}

function fabricDarkSafe(style) {
  return style.skirtDark || style.apronDark;
}

function drawFrontHairBack(ctx, figure, style, torsoY) {
  const { metrics } = figure;
  const hx = 16 - Math.floor(metrics.headW / 2);
  const hy = figure.top;
  const hair = style.hair;
  const dark = style.hairDark;
  const light = style.hairLight;
  if (style.hairStyle === 'long' || style.hairStyle === 'ponytail') {
    const end = torsoY + 4;
    px(ctx, INK, hx - 1, hy + 2, 3, end - hy);
    px(ctx, dark, hx, hy + 3, 2, end - hy - 2);
    px(ctx, hair, hx, hy + 3, 1, end - hy - 4);
    px(ctx, light, hx, hy + 4, 1, 3);
    px(ctx, INK, hx + metrics.headW - 2, hy + 2, 3, end - hy);
    px(ctx, dark, hx + metrics.headW - 2, hy + 3, 2, end - hy - 2);
    px(ctx, hair, hx + metrics.headW - 1, hy + 3, 1, end - hy - 4);
    if (style.hairStyle === 'ponytail') {
      px(ctx, dark, hx + metrics.headW, hy + 1, 3, 8);
      px(ctx, hair, hx + metrics.headW, hy + 2, 2, 6);
      px(ctx, style.ribbon || style.accent, hx + metrics.headW, hy + 2, 2, 2);
    }
  } else if (style.hairStyle === 'bun' || style.hairStyle === 'elder') {
    if (style.hairStyle === 'bun') {
      px(ctx, INK, hx + 4, hy - 3, 5, 4);
      px(ctx, hair, hx + 5, hy - 3, 3, 3);
      px(ctx, light, hx + 5, hy - 3, 1, 1);
    }
  }
}

function drawFrontHead(ctx, figure, style, frame) {
  const { metrics } = figure;
  const hx = 16 - Math.floor(metrics.headW / 2);
  const hy = figure.top;
  const hw = metrics.headW;
  const hh = metrics.headH;
  const blink = frame % 7 === 6;
  // Face silhouette, wider and rounder than the three-quarter head.
  px(ctx, style.skinShade, hx + 1, hy + 2, hw - 1, hh - 2);
  px(ctx, style.skin, hx + 2, hy + 2, hw - 3, hh - 3);
  px(ctx, style.skinLight, hx + 3, hy + 3, 3, 1);
  px(ctx, style.skinLight, hx + 2, hy + 5, 1, 2);
  px(ctx, style.skinShade, hx + 3, hy + hh - 3, hw - 5, 1);
  px(ctx, style.skinDeep, hx + 4, hy + hh - 2, hw - 7, 1);
  // Front hair mass with a centre part.
  const hair = style.hair;
  const dark = style.hairDark;
  const light = style.hairLight;
  if (style.hairStyle === 'short' || style.hairStyle === 'bandana') {
    px(ctx, INK, hx + 1, hy, hw - 2, 4);
    px(ctx, dark, hx + 1, hy + 1, hw - 2, 3);
    px(ctx, hair, hx + 2, hy, hw - 3, 3);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, hair, hx + 1, hy + 3, 2, 4);
    px(ctx, hair, hx + hw - 3, hy + 3, 2, 4);
  } else if (style.hairStyle === 'elder') {
    px(ctx, INK, hx + 1, hy + 1, hw - 2, 3);
    px(ctx, dark, hx + 1, hy + 1, hw - 2, 2);
    px(ctx, hair, hx + 2, hy, hw - 3, 2);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, hair, hx + 1, hy + 2, 2, 3);
    px(ctx, hair, hx + hw - 3, hy + 2, 2, 3);
  } else if (style.hairStyle === 'long' || style.hairStyle === 'ponytail' || style.hairStyle === 'bun') {
    px(ctx, INK, hx, hy, hw - 1, 5);
    px(ctx, dark, hx, hy + 1, hw - 1, 4);
    px(ctx, hair, hx + 1, hy, hw - 2, 4);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, hair, hx + 1, hy + 4, 3, 1);
    px(ctx, hair, hx + hw - 4, hy + 4, 3, 1);
    px(ctx, dark, hx + 4, hy + 4, 1, 1);
    px(ctx, hair, hx, hy + 4, 2, 5);
    px(ctx, hair, hx + hw - 2, hy + 4, 2, 5);
  } else {
    px(ctx, INK, hx, hy, hw - 1, 5);
    px(ctx, dark, hx + 1, hy - 1, hw - 3, 5);
    px(ctx, hair, hx + 1, hy, hw - 2, 4);
    px(ctx, dark, hx, hy + 2, 2, 4);
    px(ctx, hair, hx - 1, hy + 1, 2, 2);
    px(ctx, hair, hx + 2, hy - 1, 2, 1);
    px(ctx, hair, hx + 6, hy - 2, 2, 2);
    px(ctx, hair, hx + 9, hy, 2, 2);
    px(ctx, light, hx + 2, hy, 3, 1);
    px(ctx, light, hx + 7, hy - 1, 1, 1);
    px(ctx, hair, hx + 2, hy + 3, 2, 2);
    px(ctx, hair, hx + hw - 4, hy + 3, 2, 2);
  }
  drawFrontFace(ctx, figure, style, hx, hy, hw, hh, blink);
  drawFrontHat(ctx, style, hx, hy, hw, hh);
}

function drawFrontFace(ctx, figure, style, hx, hy, hw, hh, blink) {
  const eyeY = hy + Math.max(5, Math.round(hh * 0.5));
  const leftEye = hx + 3;
  const rightEye = hx + hw - 5;
  px(ctx, style.hairDark, leftEye - 1, eyeY - 2, 3, 1);
  px(ctx, style.hairDark, rightEye, eyeY - 2, 3, 1);
  if (blink) {
    px(ctx, style.hairDark, leftEye, eyeY + 1, 2, 1);
    px(ctx, style.hairDark, rightEye, eyeY + 1, 2, 1);
  } else {
    px(ctx, WHITE, leftEye, eyeY, 2, 2);
    px(ctx, WHITE, rightEye, eyeY, 2, 2);
    px(ctx, style.hairDark, leftEye + 1, eyeY, 1, 2);
    px(ctx, style.hairDark, rightEye + 1, eyeY, 1, 2);
    px(ctx, style.skinLight, leftEye, eyeY, 1, 1);
    px(ctx, style.skinLight, rightEye, eyeY, 1, 1);
  }
  // Nose, mouth and the two-pixel cheek planes.
  px(ctx, style.skinShade, hx + Math.round(hw / 2), eyeY + 2, 1, 2);
  px(ctx, style.skinShade, hx + 2, eyeY + 2, 1, 1);
  px(ctx, style.skinShade, hx + hw - 3, eyeY + 2, 1, 1);
  const mouthY = hy + hh - 3;
  px(ctx, style.skinDeep, hx + Math.floor(hw / 2) - 1, mouthY, 2, 1);
  px(ctx, style.skinLight, hx + Math.floor(hw / 2), mouthY - 1, 1, 1);
  if (figure.ageKey === 'child') {
    px(ctx, style.accentLight, hx + 2, mouthY - 1, 1, 1);
    px(ctx, style.accentLight, hx + hw - 3, mouthY - 1, 1, 1);
  }
}

function drawFrontHat(ctx, style, hx, hy, hw) {
  const hat = style.hat;
  const light = style.hatLight || style.hat;
  const dark = style.hatDark || style.hat;
  if (!style.hatStyle || !hat) return;
  if (style.hatStyle === 'straw' || style.hatStyle === 'brim') {
    const wide = style.hatStyle === 'straw' ? 2 : 1;
    px(ctx, INK, hx - wide, hy + 1, hw + wide * 2, 3);
    px(ctx, dark, hx - wide, hy + 2, hw + wide * 2, 1);
    px(ctx, hat, hx - wide, hy + 2, hw + wide * 2, 1);
    px(ctx, dark, hx + 2, hy - 2, hw - 4, 4);
    px(ctx, hat, hx + 3, hy - 2, hw - 6, 3);
    px(ctx, light, hx + 4, hy - 2, 3, 1);
    if (style.hatStyle === 'brim') {
      px(ctx, style.accent, hx + hw - 4, hy - 3, 2, 1);
      px(ctx, style.accentLight, hx + hw - 3, hy - 4, 1, 1);
    } else {
      px(ctx, style.accent, hx + hw - 5, hy - 1, 2, 1);
    }
    return;
  }
  if (style.hatStyle === 'baker') {
    px(ctx, INK, hx + 2, hy - 3, hw - 3, 5);
    px(ctx, hat, hx + 2, hy - 3, hw - 3, 2);
    px(ctx, light, hx + 3, hy - 3, 3, 1);
    px(ctx, dark, hx + 2, hy - 1, hw - 3, 2);
    px(ctx, hat, hx + 2, hy, hw - 3, 1);
    return;
  }
  if (style.hatStyle === 'bucket' || style.hatStyle === 'helmet' || style.hatStyle === 'flatcap') {
    px(ctx, INK, hx + 1, hy - 1, hw - 2, 4);
    px(ctx, dark, hx + 1, hy, hw - 2, 3);
    px(ctx, hat, hx + 2, hy - 1, hw - 4, 3);
    px(ctx, light, hx + 3, hy - 1, 3, 1);
    px(ctx, dark, hx, hy + 2, hw + 1, 1);
    px(ctx, hat, hx, hy + 2, hw + 1, 1);
    if (style.hatStyle === 'helmet') {
      px(ctx, style.metal, hx + Math.floor(hw / 2), hy + 2, 1, 2);
      px(ctx, style.gold, hx + 3, hy, 1, 1);
    }
    return;
  }
  if (style.hatStyle === 'scarf') {
    px(ctx, INK, hx + 1, hy - 1, hw - 2, 5);
    px(ctx, hat, hx + 2, hy - 1, hw - 3, 3);
    px(ctx, light, hx + 3, hy, 3, 1);
    px(ctx, dark, hx + 2, hy + 2, hw - 3, 1);
    px(ctx, hat, hx - 1, hy + 2, 2, 2);
    px(ctx, dark, hx - 2, hy + 3, 2, 2);
    return;
  }
  if (style.hatStyle === 'bandana') {
    px(ctx, INK, hx + 1, hy, hw - 2, 3);
    px(ctx, hat, hx + 2, hy, hw - 3, 2);
    px(ctx, light, hx + 3, hy, 2, 1);
    px(ctx, dark, hx + 1, hy + 2, hw - 2, 1);
    px(ctx, hat, hx - 1, hy + 2, 2, 2);
  }
}

function drawFrontStraps(ctx, figure, style, x, y) {
  if (!style.packStyle) return;
  const w = figure.metrics.torsoW;
  const h = figure.metrics.torsoH;
  if (style.packStyle === 'backpack') {
    px(ctx, style.strap, x + 2, y + 1, 1, h - 5);
    px(ctx, style.strap, x + w - 3, y + 1, 1, h - 5);
    px(ctx, style.gold, x + 2, y + 5, 2, 1);
    px(ctx, style.gold, x + w - 4, y + 5, 2, 1);
    px(ctx, style.goldLight, x + 2, y + 5, 1, 1);
    px(ctx, style.goldLight, x + w - 4, y + 5, 1, 1);
  } else {
    pixelLine(ctx, x + 2, y + 1, x + w - 3, y + h - 4, style.strap, 1);
    px(ctx, style.gold, x + w - 5, y + 4, 2, 2);
  }
}
