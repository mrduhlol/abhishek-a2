/** An alpine pass: sunlit switchbacks, a suspended crossing and glacial peaks. */
export default function buildBiome({ THREE, kit }) {
  const { group } = kit;
  const slate = kit.material('#617785', { roughness: 0.95, flatShading: true });
  const darkSlate = kit.material('#3f5562', { roughness: 1, flatShading: true });
  const sunStone = kit.material('#9bada9', { roughness: 0.93, flatShading: true });
  const snow = kit.material('#eff4e9', { roughness: 0.88, flatShading: true });
  const timber = kit.material('#8f6840', { roughness: 0.94 });
  const rope = kit.material('#c8ad76', { roughness: 1 });
  const gravel = kit.material('#b5b5a0', { roughness: 1 });
  kit.ground('#6d8070', { roughness: 1, segments: 64 });

  function geometry(positions, colors) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (colors) geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }

  function triangle(out, a, b, c) {
    out.push(...a, ...b, ...c);
  }

  // Every secondary surface stops behind the parent's unobstructed corridor.
  const rear = (x) => Math.min(-4, kit.pathZ(x) - 2.9);
  function apronHeight(x, z) {
    const rise = Math.max(0, rear(x) - z) * 0.38;
    // A deep cleft separates the two abutments, below the suspended deck.
    const cleft = x > -3 && x < 8 ? Math.sin(((x + 3) / 11) * Math.PI) : 0;
    return kit.height(x, z) + rise * (1 - 0.92 * cleft);
  }

  const apron = [];
  const apronColors = [];
  const stoneColors = ['#71858a', '#778b8c', '#7c908f', '#829591'].map((c) => new THREE.Color(c));
  for (let ix = 0; ix < 46; ix++) {
    for (let iz = 0; iz < 10; iz++) {
      const point = (i, j) => {
        const x = -23 + i;
        const z = rear(x) + (-14.2 - rear(x)) * j / 10;
        return [x, apronHeight(x, z), z];
      };
      const a = point(ix, iz);
      const b = point(ix + 1, iz);
      const c = point(ix, iz + 1);
      const d = point(ix + 1, iz + 1);
      triangle(apron, a, b, c);
      triangle(apron, b, d, c);
      const stratum = Math.sin(iz * 0.72 + Math.sin(ix * 0.24) * 0.8);
      const color = stoneColors[Math.max(0, Math.min(3, Math.floor((stratum + 1) * 1.8)))];
      for (let k = 0; k < 6; k++) apronColors.push(color.r, color.g, color.b);
    }
  }
  kit.mesh(geometry(apron, apronColors), kit.material('#ffffff', { vertexColors: true, roughness: 1, flatShading: true }));

  // Angular, offset geological shelves; broad horizontal seams catch the sun.
  function shelf(x, z, width, depth, height, seed) {
    if (z + depth * 0.65 > kit.pathZ(x) - 2.1) return;
    const base = kit.height(x, z) - 0.12;
    const count = 9;
    const ring = (y, scale, offset) => Array.from({ length: count }, (_, i) => {
      const angle = i / count * Math.PI * 2;
      const radius = 0.86 + Math.sin(i * 7.1 + seed) * 0.12;
      return [x + Math.cos(angle) * width * radius * scale + offset, base + y, z + Math.sin(angle) * depth * radius * scale];
    });
    const bands = [[0, 0.42, 1, darkSlate], [0.42, 0.49, 1.025, sunStone], [0.49, 0.89, 0.94, slate], [0.89, 1, 0.96, sunStone]];
    for (const [bottom, top, scale, material] of bands) {
      const lower = ring(height * bottom, scale, 0);
      const upper = ring(height * top, scale * 0.96, -0.09);
      const vertices = [];
      for (let i = 0; i < count; i++) {
        const next = (i + 1) % count;
        triangle(vertices, lower[i], upper[i], lower[next]);
        triangle(vertices, lower[next], upper[i], upper[next]);
        triangle(vertices, [x - 0.09, base + height * top, z], upper[next], upper[i]);
      }
      kit.mesh(geometry(vertices), material);
    }
  }
  for (const [x, z, w, d, h, seed] of [
    [-19, -7.9, 3, 1.3, 1.6, 2], [-13, -9, 3.5, 1.55, 2.1, 4],
    [-6, -11.8, 2.8, 1.5, 3.2, 1], [10.3, -11.8, 2.3, 1.8, 3.25, 5],
    [16, -8.4, 3.6, 1.4, 1.9, 8], [21, -7.3, 2.1, 1.1, 1.1, 3],
  ]) shelf(x, z, w, d, h, seed);

  // A shared irregular snowline makes the snow conform to the rock, not float.
  function peak(x, z, width, depth, height, seed) {
    const base = kit.height(x, z) - 0.25;
    const count = 11;
    const rings = [[], [], []];
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const r = 0.85 + 0.13 * Math.sin(i * 4.7 + seed);
      rings[0].push([x + Math.cos(a) * width * r, base, z + Math.sin(a) * depth * r]);
      rings[1].push([x + Math.cos(a) * width * r * (0.62 + 0.17 * Math.sin(i * 2.2 + seed)) - 0.4, base + height * (0.35 + 0.15 * Math.sin(i * 1.7 + seed)), z + Math.sin(a) * depth * r * 0.69]);
      rings[2].push([x + Math.cos(a) * width * r * (0.29 + 0.08 * Math.sin(i * 1.9)) - width * 0.15, base + height * (0.69 + 0.11 * Math.sin(i * 2.9 + seed)), z + Math.sin(a) * depth * r * 0.3 + 0.18]);
    }
    const tip = [x - width * 0.22, base + height, z + 0.4];
    const rock = [];
    const cap = [];
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      for (let ring = 0; ring < 2; ring++) {
        triangle(rock, rings[ring][i], rings[ring + 1][i], rings[ring][next]);
        triangle(rock, rings[ring][next], rings[ring + 1][i], rings[ring + 1][next]);
      }
      triangle(cap, rings[2][i], tip, rings[2][next]);
    }
    kit.mesh(geometry(rock), slate);
    kit.mesh(geometry(cap), snow);
  }
  peak(-16.2, -17.1, 6.3, 2.5, 9.2, 2);
  peak(-4.7, -16.8, 7.6, 2.8, 13.4, 5);
  peak(12.8, -17.2, 8.1, 2.4, 10.8, 7);

  // Raised gravel ribbons track the actual slope through two long hairpins.
  const switchback = [[-22, -5.2], [-16, -5.9], [-9, -6.8], [-7.3, -7.8], [-12, -8.8], [-18, -9.5], [-18.9, -10.4], [-14, -11.6], [-7, -11.1], [-3.3, -10.7]];
  const trailVertices = [];
  for (let i = 0; i < switchback.length - 1; i++) {
    const a = new THREE.Vector2(...switchback[i]);
    const b = new THREE.Vector2(...switchback[i + 1]);
    const tangent = b.clone().sub(a).normalize();
    const normal = new THREE.Vector2(-tangent.y, tangent.x).multiplyScalar(0.34);
    const steps = Math.ceil(a.distanceTo(b) * 2);
    for (let j = 0; j < steps; j++) {
      const point = (t, side) => {
        const p = a.clone().lerp(b, t).addScaledVector(normal, side);
        p.y = Math.min(p.y, rear(p.x) - 0.4);
        return [p.x, apronHeight(p.x, p.y) + 0.045, p.y];
      };
      const p = point(j / steps, -1);
      const q = point(j / steps, 1);
      const r = point((j + 1) / steps, -1);
      const s = point((j + 1) / steps, 1);
      triangle(trailVertices, p, q, r);
      triangle(trailVertices, r, q, s);
    }
  }
  kit.mesh(geometry(trailVertices), gravel);

  function instances(geo, material, transforms) {
    const mesh = new THREE.InstancedMesh(geo, material, transforms.length);
    const dummy = new THREE.Object3D();
    transforms.forEach(({ position, scale, rotation = [0, 0, 0] }, i) => {
      dummy.position.set(...position);
      dummy.scale.set(...scale);
      dummy.rotation.set(...rotation);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
    return mesh;
  }

  // A catenary silhouette, spaced hangers, pegged planks and timber A-frames.
  const bridgeZ = -10.7;
  const left = -3.3;
  const right = 8.5;
  const yLeft = apronHeight(left, bridgeZ) + 0.16;
  const yRight = apronHeight(right, bridgeZ) + 0.16;
  const deckY = (t) => THREE.MathUtils.lerp(yLeft, yRight, t) - 0.72 * Math.sin(t * Math.PI);
  const plankTransforms = [];
  const nailTransforms = [];
  for (let i = 0; i < 32; i++) {
    const t = (i + 0.5) / 32;
    const x = THREE.MathUtils.lerp(left, right, t);
    const pitch = Math.atan2(deckY(Math.min(1, t + 0.01)) - deckY(Math.max(0, t - 0.01)), 0.02 * (right - left));
    plankTransforms.push({ position: [x, deckY(t), bridgeZ], scale: [0.33, 0.13, 1.65], rotation: [0, 0.015 * Math.sin(i * 3), pitch] });
    for (const side of [-1, 1]) nailTransforms.push({ position: [x, deckY(t) + 0.075, bridgeZ + side * 0.61], scale: [0.035, 0.025, 0.035] });
  }
  instances(new THREE.BoxGeometry(1, 1, 1), timber, plankTransforms);
  instances(new THREE.BoxGeometry(1, 1, 1), darkSlate, nailTransforms);
  function cable(points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return kit.mesh(new THREE.TubeGeometry(curve, 36, radius, 5, false), material);
  }
  for (const side of [-1, 1]) {
    for (const rise of [0.1, 1.24]) {
      cable(Array.from({ length: 17 }, (_, i) => {
        const t = i / 16;
        return [THREE.MathUtils.lerp(left - 0.2, right + 0.2, t), deckY(t) + rise, bridgeZ + side * 0.78];
      }), rise > 1 ? 0.055 : 0.04, rope);
    }
  }
  const hangers = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    for (const side of [-1, 1]) hangers.push({ position: [THREE.MathUtils.lerp(left, right, t), deckY(t) + 0.68, bridgeZ + side * 0.78], scale: [0.033, 1.15, 0.033] });
  }
  instances(new THREE.CylinderGeometry(1, 1, 1, 5), rope, hangers);
  for (const [x, y] of [[left - 0.1, yLeft], [right + 0.1, yRight]]) {
    for (const side of [-1, 1]) {
      kit.box(timber, [x, y + 0.8, bridgeZ + side * 0.95], [0.22, 2.15, 0.22], [side * -0.12, 0, 0]);
      kit.box(rope, [x, y + 1.25, bridgeZ + side * 0.89], [0.26, 0.12, 0.28]);
    }
    kit.box(timber, [x, y + 1.87, bridgeZ], [0.28, 0.22, 2.55]);
  }
  cable([[right, yRight + 0.03, bridgeZ], [12, apronHeight(12, -10) + 0.05, -10], [17, apronHeight(17, -7.5) + 0.05, -7.5]], 0.23, gravel);

  // Jagged whorls and exposed trunks give the treeline a wind-pruned silhouette.
  const crown = [];
  for (let tier = 0; tier < 5; tier++) {
    const y = 0.18 + tier * 0.145;
    const radius = 0.37 * (1 - tier * 0.16);
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + tier * 0.43;
      const b = (i + 1) / n * Math.PI * 2 + tier * 0.43;
      const r1 = radius * (i % 2 ? 0.77 : 1);
      const r2 = radius * (i % 2 ? 1 : 0.77);
      const p = [Math.cos(a) * r1, y - (i % 2) * 0.055, Math.sin(a) * r1];
      const q = [Math.cos(b) * r2, y - ((i + 1) % 2) * 0.055, Math.sin(b) * r2];
      triangle(crown, p, [0.025, y + 0.35 - tier * 0.024, -0.025], q);
      triangle(crown, [0, y + 0.025, 0], p, q);
    }
  }
  const trunks = [];
  const pineTransforms = [];
  const treeSites = [[-22, -10], [-21, -13], [-17, -12.8], [-12, -13.5], [-9, -12.8], [10.5, -13], [14, -12], [17.5, -10.3], [20.5, -12.8], [21.4, -8.6], [-21, 5], [-17, 6], [16.8, 6], [21, 4.6]];
  for (const [x, z] of treeSites) {
    const h = 2.6 + kit.random() * 1.75;
    if (Math.abs(z - kit.pathZ(x)) < 1.6 + h * 0.39) continue;
    const y = z < rear(x) ? apronHeight(x, z) : kit.height(x, z);
    const rotation = [0.035 * (kit.random() - 0.5), kit.random() * Math.PI * 2, -0.035];
    trunks.push({ position: [x, y + h * 0.4, z], scale: [0.075 * h, h * 0.8, 0.075 * h], rotation });
    pineTransforms.push({ position: [x, y, z], scale: [h, h, h], rotation });
  }
  instances(new THREE.CylinderGeometry(0.65, 1, 1, 6), kit.material('#68543c', { roughness: 1 }), trunks);
  const needles = instances(geometry(crown), kit.material('#2b574b', { roughness: 0.98, flatShading: true }), pineTransforms);
  pineTransforms.forEach((_, i) => needles.setColorAt(i, new THREE.Color().setHSL(0.38 + kit.random() * 0.035, 0.24, 0.23 + kit.random() * 0.09)));

  // Scree, alpine turf and warm lichen provide close-scale material cues.
  const scree = [];
  const turf = [];
  const lichen = [];
  for (let i = 0; i < 110; i++) {
    const x = -22.5 + kit.random() * 45;
    const z = -13.8 + kit.random() * 24;
    const radius = 0.12 + kit.random() * 0.3;
    if (Math.abs(z - kit.pathZ(x)) < 1.9 + radius) continue;
    // Keep the authored switchback legible and the ravine open.
    if (z < rear(x) && z > -12.5) continue;
    const y = z < rear(x) ? apronHeight(x, z) : kit.height(x, z);
    scree.push({ position: [x, y + radius * 0.28, z], scale: [radius * 1.5, radius * 0.7, radius], rotation: [kit.random(), kit.random() * 6, kit.random()] });
    if (i % 3 === 0) turf.push({ position: [x + radius, y + 0.06, z], scale: [radius * 1.8, 0.12, radius * 1.4] });
    if (i % 7 === 0) lichen.push({ position: [x, y + radius * 0.65, z], scale: [radius * 0.7, 0.025, radius * 0.5] });
  }
  instances(new THREE.IcosahedronGeometry(1, 0), slate, scree);
  instances(new THREE.IcosahedronGeometry(1, 0), kit.material('#637749', { roughness: 1 }), turf);
  instances(new THREE.IcosahedronGeometry(1, 0), kit.material('#c8ab61', { roughness: 1 }), lichen);
  return { group: kit.group };
}
