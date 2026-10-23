/** A walkable, south-facing hilltown. All coordinates are local; +z faces the camera. */
export default function buildTown({ THREE, kit }) {
  const { group } = kit;
  const palette = {
    stone: '#bca486', mortar: '#8e806d', limestone: '#e5ccb0', cream: '#eed6ae',
    ochre: '#c89259', rose: '#d99c83', sage: '#a5ac8a', blue: '#658b95',
    tile: '#ad573d', tileLight: '#c6714c', wood: '#62472f', teak: '#966444',
    dark: '#302c2b', brass: '#bd9753', leaf: '#58774b', leafLight: '#81975a',
  };
  const matte = kit.material('#ffffff', { roughness: 0.91 });
  const metal = kit.material('#ffffff', { roughness: 0.56, metalness: 0.55 });
  const glass = kit.material('#ffe0a2', { roughness: 0.32, emissive: '#e1a34e', emissiveIntensity: 0.35 });
  const waterMaterial = kit.material('#68ada7', { roughness: 0.23, metalness: 0.15, transparent: true, opacity: 0.86 });
  const batches = new Map();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const leafGeometry = new THREE.IcosahedronGeometry(1, 0);
  const fruitGeometry = new THREE.IcosahedronGeometry(1, 0);
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
  const roofTileGeometry = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true, Math.PI / 2, Math.PI);
  const lampCapGeometry = new THREE.ConeGeometry(0.53, 0.4, 4);
  const potGeometry = new THREE.CylinderGeometry(0.7, 0.47, 1, 10);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const vector = new THREE.Vector3();
  const scaleVector = new THREE.Vector3();
  let seed = 75219;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function stamp(key, geometry, material, position, scale, color, rotation = [0, 0, 0]) {
    if (!batches.has(key)) batches.set(key, { geometry, material, items: [] });
    batches.get(key).items.push({ position, scale, color, rotation });
  }
  const box = (color, position, scale, rotation) => stamp('masonry-and-joinery', unitBox, matte, position, scale, color, rotation);
  const cylinder = (color, position, scale, rotation) => stamp('turned-details', cylinderGeometry, matte, position, scale, color, rotation);
  const leaf = (color, position, scale) => stamp('foliage', leafGeometry, matte, position, scale, color);
  const fruit = (color, position, scale) => stamp('flowers-and-produce', fruitGeometry, matte, position, scale, color);
  function rod(a, b, radius = 0.035, color = palette.wood) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const direction = end.clone().sub(start);
    const rotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()));
    cylinder(color, start.add(end).multiplyScalar(0.5).toArray(), [radius, direction.length(), radius], rotation.toArray().slice(0, 3));
  }
  function pot(x, z, size = 1, y = 0, flowers = true) {
    stamp('terracotta-pots', potGeometry, matte, [x, y + size * 0.48, z], [size, size * 0.95, size], '#b86b49');
    cylinder(palette.tileLight, [x, y + size * 0.91, z], [size * 0.75, size * 0.17, size * 0.75]);
    cylinder('#4a4032', [x, y + size, z], [size * 0.62, size * 0.035, size * 0.62]);
    for (let n = 0; n < 5; n++) {
      const angle = n * 2.4;
      const px = x + Math.sin(angle) * size * 0.4;
      const pz = z + Math.cos(angle) * size * 0.4;
      leaf(palette.leaf, [px, y + size * 1.25, pz], [size * 0.35, size * 0.4, size * 0.28]);
      if (flowers) fruit(n % 2 ? '#db6782' : '#f3bd52', [px, y + size * 1.55, pz], [size * 0.16, size * 0.12, size * 0.16]);
    }
  }

  // The plinth is a constructed town floor, with its top exactly at world y=0.
  box('#95836b', [0, -0.42, -2.5], [69, 0.84, 34]);
  box('#c2b095', [0, -0.08, -2.5], [68.4, 0.16, 33.4]);
  // Rounded, individually shaded cobbles, laid in staggered rows over the plaza.
  const cobbleGeometry = new THREE.CylinderGeometry(0.5, 0.47, 0.1, 6);
  for (let row = 0; row < 24; row++) {
    const z = -8.5 + row * 0.85;
    for (let col = 0; col < 57; col++) {
      const x = -23.9 + col * 0.85 + (row % 2) * 0.425;
      if (x > 24 || (x < -21 && z < 1) || (x > 23 && z > -1)) continue;
      stamp('plaza-cobbles', cobbleGeometry, matte, [x, 0.035, z], [0.94 + random() * 0.1, 1, 0.88 + random() * 0.08], ['#bcad98', '#c8b9a1', '#d0c0a9', '#b5aa99'][Math.floor(random() * 4)], [0, random() * 0.25, 0]);
    }
  }
  // Inlaid stone guides the eye from the cave to the village meeting place.
  for (let x = -21; x < 9; x += 0.95) {
    box('#e4d2af', [x, 0.052, 5.7], [0.89, 0.08, 0.22]);
    box('#e4d2af', [x, 0.052, 0.1], [0.89, 0.08, 0.22]);
  }
  for (let x = -33; x < 34; x += 1.4) {
    box(palette.limestone, [x, 0.12, 13.7], [1.32, 0.24, 0.6]);
    box(palette.stone, [x, 0.22, -19.1], [1.32, 0.44, 0.75]);
  }

  function windowAt(x, y, z, width = 1.05, height = 1.45, shutter = palette.blue) {
    box(palette.limestone, [x, y, z], [width + 0.23, height + 0.24, 0.2]);
    box('#383d39', [x, y, z + 0.12], [width, height, 0.07]);
    box('#d0b98a', [x, y, z + 0.17], [0.055, height, 0.065]);
    box('#d0b98a', [x, y + 0.15, z + 0.17], [width, 0.055, 0.065]);
    for (const side of [-1, 1]) {
      box(shutter, [x + side * (width * 0.69), y, z + 0.12], [width * 0.34, height + 0.05, 0.12], [0, side * 0.12, 0]);
      for (let n = 0; n < 4; n++) box('#526e69', [x + side * width * 0.69, y - height * 0.3 + n * height * 0.2, z + 0.21], [width * 0.3, 0.045, 0.07]);
    }
    box(palette.limestone, [x, y - height / 2 - 0.12, z + 0.2], [width + 0.45, 0.18, 0.48]);
  }
  function flowerbox(x, y, z, width = 1.6) {
    box(palette.teak, [x, y, z], [width, 0.35, 0.48]);
    for (let n = 0; n < 5; n++) {
      const px = x - width * 0.4 + n * width * 0.2;
      leaf(palette.leaf, [px, y + 0.25, z], [0.3, 0.25, 0.3]);
      fruit(n % 2 ? '#e492a0' : '#c34f66', [px, y + 0.42, z + 0.08], [0.15, 0.12, 0.16]);
    }
  }
  function roof(x, y, z, w, d, color = palette.tile) {
    const rise = w * 0.24;
    const slope = Math.atan2(rise, w / 2);
    const length = Math.hypot(w / 2 + 0.45, rise);
    for (const side of [-1, 1]) {
      box(color, [x + side * w * 0.25, y + rise * 0.5, z], [length, 0.2, d + 0.8], [0, 0, -side * slope]);
      const nx = Math.ceil(w / 1.05);
      const nz = Math.ceil(d / 0.72);
      for (let i = 0; i < nx; i++) {
        const t = (i + 0.5) / nx;
        for (let j = 0; j < nz; j++) {
          // Half-round barrel tiles produce a real roof silhouette and self shading.
          stamp('barrel-roof-tiles', roofTileGeometry, matte,
            [x + side * t * (w / 2 + 0.25), y + rise * (1 - t) + 0.13, z - d / 2 - 0.18 + j * (d + 0.36) / nz],
            [0.19, (d + 0.4) / nz + 0.08, 0.19], random() > 0.7 ? palette.tileLight : color, [Math.PI / 2, 0, 0]);
        }
      }
    }
    cylinder(palette.tileLight, [x, y + rise + 0.12, z], [0.23, d + 1, 0.23], [Math.PI / 2, 0, 0]);
    // Solid triangular gables, rather than a hollow floating roof.
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-w / 2, 0);
    gableShape.lineTo(w / 2, 0);
    gableShape.lineTo(0, rise);
    gableShape.closePath();
    const gable = new THREE.ExtrudeGeometry(gableShape, { depth: d, bevelEnabled: false });
    kit.mesh(gable, kit.material(palette.cream, { roughness: 0.95 }), [x, y - 0.05, z - d / 2]);
  }
  function house({ x, z, w, d, h, color, shutters = palette.blue, balcony = false }) {
    const front = z + d / 2;
    box(palette.stone, [x, 0.3, z], [w + 0.3, 0.6, d + 0.3]);
    box(color, [x, h / 2 + 0.22, z], [w, h, d]);
    box(palette.limestone, [x, h + 0.2, z], [w + 0.3, 0.26, d + 0.3]);
    box(palette.cream, [x, 3.35, front + 0.05], [w + 0.1, 0.15, 0.16]);
    for (const side of [-1, 1]) {
      for (let level = 0; level < Math.floor(h / 0.65); level++) box(palette.limestone, [x + side * (w / 2 - 0.1), 0.6 + level * 0.65, front + 0.02], [0.38, 0.35, 0.17]);
    }
    box(palette.limestone, [x, 1.35, front + 0.1], [1.7, 2.7, 0.25]);
    box(palette.wood, [x, 1.27, front + 0.25], [1.34, 2.45, 0.15]);
    for (let i = 0; i < 5; i++) box(palette.teak, [x - 0.52 + i * 0.26, 1.27, front + 0.34], [0.035, 2.3, 0.045]);
    stamp('brass-hardware', fruitGeometry, metal, [x + 0.4, 1.25, front + 0.43], [0.075, 0.075, 0.075], palette.brass);
    box(palette.limestone, [x, 0.12, front + 0.48], [2.05, 0.24, 0.9]);
    for (const side of [-1, 1]) {
      windowAt(x + side * w * 0.29, 1.95, front + 0.04, 0.95, 1.3, shutters);
      if (h > 5) {
        windowAt(x + side * w * 0.28, h - 1.5, front + 0.04, 1.05, 1.5, shutters);
        flowerbox(x + side * w * 0.28, h - 2.5, front + 0.45);
      }
    }
    if (balcony) {
      const y = h - 2.5;
      box(palette.teak, [x, y, front + 0.8], [w * 0.62, 0.18, 1.55]);
      rod([x - w * 0.3, y + 1, front + 1.5], [x + w * 0.3, y + 1, front + 1.5], 0.045);
      for (let n = 0; n <= 10; n++) rod([x - w * 0.3 + n * w * 0.06, y, front + 1.5], [x - w * 0.3 + n * w * 0.06, y + 1, front + 1.5], 0.027);
      for (const side of [-1, 1]) rod([x + side * w * 0.3, y - 1.2, front], [x + side * w * 0.3, y, front + 1.4], 0.09);
    }
    roof(x, h + 0.35, z, w, d);
    box(palette.ochre, [x + w * 0.24, h + 1.1, z - d * 0.2], [0.7, 1.8, 0.8]);
    box(palette.limestone, [x + w * 0.24, h + 2, z - d * 0.2], [0.95, 0.18, 1.05]);
    pot(x + w * 0.42, front + 0.7, 0.57);
  }
  [
    { x: -28, z: -12.3, w: 6.5, d: 6, h: 6.5, color: palette.ochre },
    { x: -19, z: -13.5, w: 8, d: 6.6, h: 8.3, color: palette.cream, balcony: true },
    { x: -8.7, z: -13.2, w: 8.6, d: 7, h: 6.5, color: palette.rose, shutters: '#718472' },
    { x: 3.2, z: -14.1, w: 10, d: 7.8, h: 9.2, color: palette.ochre, balcony: true },
    { x: 15.1, z: -13.3, w: 8.6, d: 7, h: 6.2, color: palette.sage },
    { x: 26.5, z: -12.6, w: 7.8, d: 6.8, h: 8, color: palette.cream, balcony: true },
    { x: 28.5, z: 1.3, w: 7, d: 6, h: 4.6, color: palette.rose, shutters: '#6a8671' },
  ].forEach(house);

  // Small domed bell pavilion anchors the skyline without filling the foreground.
  box(palette.cream, [3.2, 11.2, -14.2], [2.65, 3, 2.65]);
  for (const x of [2.35, 4.05]) {
    box(palette.dark, [x, 11.65, -12.84], [0.5, 1.05, 0.08]);
    cylinder(palette.brass, [x, 11.65, -12.68], [0.2, 0.34, 0.2]);
  }
  const dome = new THREE.SphereGeometry(1.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  kit.mesh(dome, kit.material('#6d9691', { roughness: 0.73 }), [3.2, 12.7, -14.2], [1, 0.85, 1]);
  cylinder(palette.brass, [3.2, 14.5, -14.2], [0.07, 0.9, 0.07]);
  fruit(palette.brass, [3.2, 14.95, -14.2], [0.19, 0.19, 0.19]);

  function tree(x, z, size = 1) {
    cylinder(palette.stone, [x, 0.18, z], [1.7 * size, 0.36, 1.7 * size]);
    cylinder('#756548', [x, 0.39, z], [1.4 * size, 0.08, 1.4 * size]);
    cylinder('#786044', [x, 1.9 * size, z], [0.22 * size, 3.8 * size, 0.25 * size]);
    for (let n = 0; n < 5; n++) {
      const a = n * 2.4;
      const px = x + Math.sin(a) * size * 1.2;
      const pz = z + Math.cos(a) * size * 0.95;
      rod([x, 2.2 * size, z], [px, (3.5 + n * 0.18) * size, pz], 0.1 * size, '#786044');
      leaf(n % 2 ? palette.leaf : palette.leafLight, [px, (4 + n * 0.25) * size, pz], [1.55 * size, 1.3 * size, 1.35 * size]);
    }
  }
  [[-17, -5.4, 0.9], [19.5, -5.8, 1], [-31, 10, 0.95], [20.5, 10.2, 0.83], [32, -6, 0.8]].forEach(args => tree(...args));

  function bench(x, z, angle = 0) {
    const point = (px, y, pz) => [x + px * Math.cos(angle) + pz * Math.sin(angle), y, z - px * Math.sin(angle) + pz * Math.cos(angle)];
    for (let n = 0; n < 4; n++) box(palette.teak, point(0, 0.76, -0.33 + n * 0.23), [2.6, 0.13, 0.18], [0, angle, 0]);
    for (let n = 0; n < 3; n++) box(palette.teak, point(0, 1.05 + n * 0.24, -0.46), [2.6, 0.16, 0.13], [0, angle, 0]);
    for (const side of [-1, 1]) {
      box(palette.dark, point(side, 0.4, 0), [0.13, 0.8, 0.85], [0, angle, 0]);
      box(palette.dark, point(side, 1.06, -0.48), [0.1, 0.95, 0.12], [0, angle, 0]);
    }
  }
  bench(-14, -4.3);
  bench(16.8, 8.9, Math.PI);
  bench(-9, 10.8, Math.PI);
  function lamp(x, z) {
    stamp('lamp-metalwork', cylinderGeometry, metal, [x, 0.16, z], [0.34, 0.32, 0.34], '#424943');
    stamp('lamp-metalwork', cylinderGeometry, metal, [x, 2.3, z], [0.075, 4.4, 0.075], '#424943');
    stamp('lantern-glass', unitBox, glass, [x, 4.5, z], [0.5, 0.72, 0.5], '#ffffff');
    for (const dx of [-0.27, 0.27]) for (const dz of [-0.27, 0.27]) box('#424943', [x + dx, 4.5, z + dz], [0.045, 0.83, 0.045]);
    box('#424943', [x, 4.08, z], [0.65, 0.12, 0.65]);
    stamp('lamp-caps', lampCapGeometry, metal, [x, 5.07, z], [1, 1, 1], '#424943', [0, Math.PI / 4, 0]);
    fruit(palette.brass, [x, 5.33, z], [0.09, 0.13, 0.09]);
  }
  [[-20.5, -1.4], [-10.4, -5.2], [10.5, -6.1], [22.5, 7.3], [-17, 9.3]].forEach(args => lamp(...args));

  // Low octagonal fountain sits behind the hero/girl route, leaving their sightline open.
  const fx = 0.1;
  const fz = -3.3;
  cylinder(palette.stone, [fx, 0.11, fz], [2.65, 0.22, 2.65]);
  const basinGeometry = new THREE.TorusGeometry(2.05, 0.3, 6, 12);
  kit.mesh(basinGeometry, kit.material(palette.limestone, { roughness: 0.86 }), [fx, 0.57, fz], [1, 1, 1], [Math.PI / 2, 0, 0]);
  cylinder(palette.stone, [fx, 0.3, fz], [2.13, 0.38, 2.13]);
  const water = kit.mesh(new THREE.CylinderGeometry(1.98, 1.98, 0.04, 32), waterMaterial, [fx, 0.51, fz]);
  water.castShadow = false;
  cylinder(palette.limestone, [fx, 1, fz], [0.28, 1.45, 0.28]);
  kit.mesh(new THREE.CylinderGeometry(0.95, 0.36, 0.3, 16), kit.material(palette.limestone), [fx, 1.68, fz]);
  cylinder('#70bcb6', [fx, 1.85, fz], [0.8, 0.035, 0.8]);
  cylinder(palette.brass, [fx, 2.12, fz], [0.12, 0.5, 0.12]);
  const droplets = [];
  for (let n = 0; n < 12; n++) {
    const a = n * Math.PI / 6;
    const drop = kit.mesh(new THREE.SphereGeometry(0.045, 5, 4), waterMaterial, [fx + Math.cos(a) * 0.82, 1.5, fz + Math.sin(a) * 0.82], [1, 2.2, 1]);
    drop.castShadow = false;
    droplets.push(drop);
  }

  function stall(x, z, color, vegetables = false) {
    const width = 4.1;
    for (const dx of [-1.8, 1.8]) for (const dz of [-0.9, 0.9]) cylinder(palette.wood, [x + dx, 1.45, z + dz], [0.07, 2.9, 0.07]);
    box(palette.teak, [x, 0.75, z + 0.35], [width, 1.45, 1.05]);
    for (let n = 0; n < 11; n++) box(palette.wood, [x - 1.9 + n * 0.38, 0.72, z + 0.9], [0.04, 1.3, 0.05]);
    box(palette.cream, [x, 1.5, z + 0.35], [width + 0.15, 0.12, 1.35]);
    for (let n = 0; n < 8; n++) {
      box(n % 2 ? '#eee0bd' : color, [x - 1.85 + n * 0.53, 2.88, z], [0.53, 0.1, 2.7], [0.12, 0, 0]);
      box(n % 2 ? '#eee0bd' : color, [x - 1.85 + n * 0.53, 2.56, z + 1.32], [0.53, 0.43, 0.08]);
    }
    for (let tray = 0; tray < 3; tray++) {
      const tx = x - 1.3 + tray * 1.3;
      box(palette.wood, [tx, 1.63, z + 0.35], [1.15, 0.2, 0.9]);
      for (let n = 0; n < 12; n++) fruit(vegetables ? ['#c9b24d', '#6e9450', '#ad4a3c'][tray] : ['#dd963e', '#b64f48', '#9c7195'][tray], [tx - 0.4 + (n % 4) * 0.27, 1.83 + Math.floor(n / 8) * 0.12, z + 0.08 + Math.floor(n / 4) * 0.23], [0.15, vegetables ? 0.17 : 0.13, 0.14]);
    }
    pot(x + 2.5, z + 0.7, 0.7, 0, false);
  }
  stall(12, -4.1, '#c17850', true);
  stall(19.3, 1.6, '#5f8f87');
  // Builder's yard and quiet working garden flank the plaza.
  for (let n = 0; n < 6; n++) box(palette.teak, [24, 0.17 + n * 0.17, -5.6], [3.6, 0.14, 0.48], [0, 0.05 * (n % 2), 0]);
  for (let n = 0; n < 3; n++) box(palette.limestone, [26.1 + n * 0.6, 0.32, -5.3], [0.5, 0.64, 0.7]);
  rod([25, 0.1, -8.95], [25, 5, -10], 0.07);
  rod([26, 0.1, -8.95], [26, 5, -10], 0.07);
  for (let n = 0; n < 10; n++) rod([25, 0.35 + n * 0.45, -9 - n * 0.095], [26, 0.35 + n * 0.45, -9 - n * 0.095], 0.045);
  for (const z of [9.5, 12]) {
    box(palette.stone, [9.1, 0.28, z], [7.8, 0.56, 1.8]);
    box('#685342', [9.1, 0.57, z], [7.3, 0.07, 1.4]);
    for (let n = 0; n < 13; n++) {
      const x = 5.8 + n * 0.55;
      leaf(n % 2 ? '#788a50' : '#6b8754', [x, 0.83, z], [0.31, 0.38, 0.5]);
      fruit(n % 3 ? '#edc16e' : '#c66b8e', [x, 1.15, z], [0.14, 0.13, 0.14]);
    }
  }
  cylinder('#657e79', [13.6, 0.42, 10.3], [0.32, 0.75, 0.32]);
  rod([13.8, 0.65, 10.3], [14.6, 1.02, 10.3], 0.08, '#657e79');
  [[-18, 7.8, 0.8], [-5.5, -7.5, 0.85], [8.6, -8.3, 0.65], [23.8, 9.8, 0.9], [-22.1, 9, 0.65]].forEach(args => pot(...args));

  // Strings stay high and behind the main walking route. Pennants are solid cloth wedges.
  const pennantShape = new THREE.Shape();
  pennantShape.moveTo(-0.32, 0);
  pennantShape.lineTo(0.32, 0);
  pennantShape.lineTo(0, -0.8);
  pennantShape.closePath();
  const pennantGeometry = new THREE.ExtrudeGeometry(pennantShape, { depth: 0.025, bevelEnabled: false });
  const banners = [];
  function bunting(a, b, count) {
    const points = [];
    for (let n = 0; n <= count; n++) {
      const t = n / count;
      points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * 0.85, a[2] + (b[2] - a[2]) * t]);
      if (n > 0) rod(points[n - 1], points[n], 0.025);
      if (n > 0 && n < count) {
        const banner = kit.mesh(pennantGeometry, kit.material(['#ca7955', '#dcb96c', '#719d98', '#b8717e'][n % 4], { roughness: 0.95 }), points[n]);
        banners.push({ mesh: banner, phase: n * 0.8 });
      }
    }
  }
  bunting([-20.8, 6.8, -8.4], [-5, 6, -8.9], 15);
  bunting([7, 7.8, -9.8], [24.7, 6.5, -8.9], 17);

  // Cave mouth is a real extruded opening, backed by one clickable dark portal mesh.
  const mouth = new THREE.Shape();
  mouth.moveTo(-2.15, 0);
  mouth.lineTo(-2.15, 2.5);
  mouth.bezierCurveTo(-2.15, 5.2, 2.15, 5.2, 2.15, 2.5);
  mouth.lineTo(2.15, 0);
  mouth.closePath();
  const portal = kit.mesh(new THREE.ExtrudeGeometry(mouth, { depth: 0.24, bevelEnabled: false }), kit.material('#171f23', { roughness: 1, emissive: '#17252d', emissiveIntensity: 0.18 }), [-25, 0, 3.22]);
  portal.name = 'town-cave-portal';
  portal.userData = { ...portal.userData, clickable: true, type: 'portal', destination: 'expedition' };
  const archShape = new THREE.Shape();
  archShape.moveTo(-3.35, 0);
  archShape.lineTo(-3.35, 2.6);
  archShape.bezierCurveTo(-3.35, 7, 3.35, 7, 3.35, 2.6);
  archShape.lineTo(3.35, 0);
  archShape.lineTo(2.15, 0);
  archShape.lineTo(2.15, 2.5);
  archShape.bezierCurveTo(2.15, 5.2, -2.15, 5.2, -2.15, 2.5);
  archShape.lineTo(-2.15, 0);
  archShape.closePath();
  kit.mesh(new THREE.ExtrudeGeometry(archShape, { depth: 2.8, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.16, bevelSegments: 1, curveSegments: 12 }), kit.material('#857e6a', { roughness: 1 }), [-25, 0, 1]);
  for (let n = 0; n < 13; n++) {
    const angle = n / 12 * Math.PI;
    const x = -25 + Math.cos(angle) * 2.95;
    const y = 2.5 + Math.sin(angle) * 2.5;
    box(n % 2 ? '#a69c82' : '#9b9079', [x, y, 4.02], [0.68, 0.9, 0.58], [0, 0, angle - Math.PI / 2]);
  }
  for (const side of [-1, 1]) {
    for (let n = 0; n < 4; n++) box('#a1967d', [-25 + side * 2.75, 0.35 + n * 0.62, 4.02], [0.95, 0.55, 0.6]);
  }
  for (let n = 0; n < 12; n++) {
    // Rock skirt stays outside the walk-through opening and the arrival corridor.
    const side = n < 7 ? -1 : 1;
    const x = -25 + side * (3.9 + random() * 1.7);
    kit.rock(n % 2 ? '#8d8772' : '#a49b82', [x, 0.45 + random() * 0.4, 0.3 + random() * 4], [1.4 + random(), 1.1 + random() * 1.4, 1 + random()], n + 50);
    if (n % 3 === 0) leaf(palette.leaf, [x, 1.9, 1 + n * 0.2], [1.2, 0.55, 0.8]);
  }
  box(palette.stone, [-25, 0.06, 4.35], [4.3, 0.12, 1.7]);
  for (let n = 0; n < 4; n++) box('#b5a38b', [-25, 0.03, 5.5 + n * 0.45], [3.7 + n * 0.25, 0.06, 0.38]);

  // Flush all repeated detail into shared draws. There are no character meshes here.
  for (const [name, { geometry, material, items }] of batches) {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    mesh.name = `town-${name}`;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      vector.fromArray(item.position);
      scaleVector.fromArray(item.scale);
      euler.set(...item.rotation);
      quaternion.setFromEuler(euler);
      matrix.compose(vector, quaternion, scaleVector);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color(item.color));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }

  const npcs = [
    { id: 'town-girl', name: 'Mira', role: 'girl', age: 22, position: [4, 0, 2], working: false, dialogue: 'You found the hidden road! Come sit with me; the fountain has been telling stories all afternoon.' },
    { id: 'town-gardener', name: 'Leela', role: 'gardener', age: 67, position: [8, 0, 8.1], route: [[8, 0, 8.1], [11.8, 0, 8.1]], working: true, dialogue: 'A little water, a little patience. People and marigolds need much the same things.' },
    { id: 'town-builder', name: 'Dev', role: 'builder', age: 38, position: [23, 0, -4.1], working: true, dialogue: 'These old houses lean on one another. I just help them keep their promises.' },
    { id: 'town-shopkeeper', name: 'Farah', role: 'shopkeeper', age: 49, position: [12, 0, -5.4], working: true, dialogue: 'Sweet limes from the valley, fresh this morning. Your first taste is on the house.' },
    { id: 'town-sweeper', name: 'Ravi', role: 'sweeper', age: 56, position: [-9, 0, 7], route: [[-9, 0, 7], [-3, 0, 7], [2, 0, 6.8]], working: true, dialogue: 'Every stone in this square has seen a homecoming. Yours is the newest.' },
    { id: 'town-elder', name: 'Ibrahim', role: 'elder', age: 78, position: [-13.4, 0, -3.1], working: false, dialogue: 'The cave was our shortcut to everywhere when I was young. Some doors never grow old.' },
    { id: 'town-walker', name: 'Nikhil', role: 'walker', age: 19, position: [-16, 0, 2.3], route: [[-16, 0, 2.3], [-9, 0, 3], [-3, 0, 2], [1.8, 0, 3.8], [-9, 0, 4.5]], working: false, dialogue: 'I take the long way home for the smell of bread from the market.' },
    { id: 'town-couple-a', name: 'Asha', role: 'couple', age: 32, position: [15.8, 0, 6], route: [[15.8, 0, 6], [12.6, 0, 5.8], [8, 0, 5.3], [12.6, 0, 5.8]], working: false, dialogue: 'We have walked this square together for ten years, and he still stops for every flower.' },
    { id: 'town-couple-b', name: 'Arun', role: 'couple', age: 34, position: [16.7, 0, 6.4], route: [[16.7, 0, 6.4], [13.5, 0, 6.2], [8.9, 0, 5.7], [13.5, 0, 6.2]], working: false, dialogue: 'She says we are late. But look at the color of those marigolds!' },
    { id: 'town-child', name: 'Tara', role: 'child', age: 8, position: [-5, 0, -0.5], route: [[-5, 0, -0.5], [-4, 0, -4], [-7.8, 0, -3.8], [-7.5, 0, -0.5]], working: false, dialogue: 'I counted all the lanterns! Now I am counting the wishes in the fountain.' },
  ];
  return {
    group,
    npcs,
    portal,
    update(time, dt) {
      // Derive motion from absolute time so pausing and re-entering never accumulate drift.
      if (!Number.isFinite(time)) return;
      const breeze = Math.sin(time * 1.3) * 0.07;
      for (const { mesh, phase } of banners) mesh.rotation.x = breeze + Math.sin(time * 2 + phase) * 0.055;
      for (let n = 0; n < droplets.length; n++) droplets[n].position.y = 0.7 + ((time * 0.75 + n / droplets.length) % 1) * 0.9;
      water.position.y = 0.51 + Math.sin(time * 1.8) * 0.007;
      void dt;
    },
  };
}
