/** Warm sandstone country: eroded windows, wind-cut dunes, and an old survey camp. */
export default function buildBiome({ THREE, kit, index }) {
  const { group } = kit;
  const sand = kit.material('#dcb780', { roughness: 1 });
  const stone = kit.material('#ffffff', { roughness: 0.96, vertexColors: true });
  const masonry = kit.material('#d19c6c', { roughness: 1 });
  const wood = kit.material('#72533d', { roughness: 1 });
  const rope = kit.material('#b49b70', { roughness: 1 });
  const green = kit.material('#557961', { roughness: 0.9 });
  const cactusShade = kit.material('#365c48', { roughness: 0.95 });
  const canvas = kit.material('#d6c498', { roughness: 1, side: THREE.DoubleSide });
  const clay = kit.material('#a75f43', { roughness: 0.94 });
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 8);
  const strata = ['#a66749', '#ba7e55', '#d59967', '#e2b281', '#c78b5d', '#e8bb87'];
  const stoneColors = strata.map((color) => new THREE.Color(color));
  const at = (x, z, rise = 0) => [x, kit.height(x, z) + rise, z];
  const phase = (index ?? 0) * 0.73;

  kit.ground('#d6ae76', { roughness: 1, segments: 64 });
  group.name = 'desert-sandstone-expedition';

  // Every occupied footprint is checked against the curved route, not just its center.
  function clear(x, z, rx, rz) {
    if (Math.abs(x) + rx > 23.85 || Math.abs(z) + rz > 19.8) return false;
    for (let px = x - rx; px <= x + rx + 0.01; px += 0.25) {
      if (Math.abs(z - kit.pathZ(px)) < rz + 1.85) return false;
    }
    return true;
  }

  function shade(geometry, offset = 0) {
    const positions = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const layer = Math.floor((y + offset + 30 + 0.055 * Math.sin(x * 1.9)) * 2.8);
      color.copy(stoneColors[((layer % strata.length) + strata.length) % strata.length]);
      color.multiplyScalar(0.96 + 0.045 * Math.sin(x * 5.1 + z * 3.7 + y));
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }

  // A ring-built weathering profile gives rocks undercuts and rounded shoulders.
  // None of the outcrops are cones or stacks of separate primitive rocks.
  function outcrop(x, z, width, depth, height, seed = 0) {
    if (!clear(x, z, width * 0.65, depth * 0.6)) return;
    const radial = 14;
    const profile = [1, 1.03, 0.91, 0.96, 0.88, 0.9, 0.77, 0.8, 0.72, 0.66, 0.5];
    const vertices = [];
    const indices = [];
    const baseY = kit.height(x, z) - 0.12;
    for (let layer = 0; layer < profile.length; layer++) {
      const t = layer / (profile.length - 1);
      for (let j = 0; j < radial; j++) {
        const angle = j / radial * Math.PI * 2;
        const erosion = 1 + 0.095 * Math.sin(angle * 3 + seed) + 0.04 * Math.cos(angle * 5 - seed + t * 3);
        const radius = profile[layer] * erosion;
        const px = Math.cos(angle) * width * 0.5 * radius + Math.sin(t * 2 + seed) * width * 0.07;
        const pz = Math.sin(angle) * depth * 0.5 * radius;
        const groundDelta = kit.height(x + px, z + pz) - kit.height(x, z);
        const py = height * t + Math.sin(angle * 2 + seed) * height * 0.025 * t + groundDelta * (1 - t) ** 3;
        vertices.push(px, py, pz);
        if (layer < profile.length - 1) {
          const a = layer * radial + j;
          const b = layer * radial + (j + 1) % radial;
          indices.push(a, a + radial, b, b, a + radial, b + radial);
        }
      }
    }
    const cap = vertices.length / 3;
    vertices.push(Math.sin(2 + seed) * width * 0.07, height * 1.005, 0);
    for (let j = 0; j < radial; j++) {
      const a = (profile.length - 1) * radial + j;
      const b = (profile.length - 1) * radial + (j + 1) % radial;
      indices.push(cap, b, a);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return kit.mesh(shade(geometry, seed), stone, [x, baseY, z]);
  }

  function arch(x, z, radius, spring, depth, seed) {
    if (!clear(x, z, radius * 1.4, depth * 0.8)) return;
    const segments = 40;
    const bands = 5;
    const slices = 4;
    const vertices = [];
    const indices = [];
    const vertex = (i, j, k) => (i * (bands + 1) + j) * (slices + 1) + k;
    const quad = (a, b, c, d) => indices.push(a, b, d, b, c, d);
    for (let i = 0; i <= segments; i++) {
      const angle = i / segments * Math.PI;
      for (let j = 0; j <= bands; j++) {
        const t = j / bands;
        const weather = 0.022 * Math.sin(angle * 7 + seed) + 0.015 * Math.sin(angle * 13);
        for (let k = 0; k <= slices; k++) {
          // Rounded exposed edges and recessed sediment seams, all real volume.
          const bevel = (k === 0 || k === slices) ? Math.cos(t * Math.PI) * 0.1 : 0;
          const r = radius * (0.69 + 0.31 * t + weather) + bevel;
          const px = Math.cos(angle) * r * 1.12;
          const py = spring + Math.sin(angle) * r * 0.9;
          const scallop = 1 + 0.055 * Math.sin(py * 5.2 + seed) + 0.035 * Math.cos(angle * 11);
          const pz = (k / slices - 0.5) * depth * scallop + Math.sin(angle * 5 + seed) * 0.07;
          vertices.push(px, py, pz);
        }
      }
    }
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < bands; j++) {
        quad(vertex(i, j, slices), vertex(i, j + 1, slices), vertex(i + 1, j + 1, slices), vertex(i + 1, j, slices));
        quad(vertex(i, j, 0), vertex(i + 1, j, 0), vertex(i + 1, j + 1, 0), vertex(i, j + 1, 0));
      }
      for (let k = 0; k < slices; k++) {
        quad(vertex(i, bands, k), vertex(i + 1, bands, k), vertex(i + 1, bands, k + 1), vertex(i, bands, k + 1));
        quad(vertex(i, 0, k), vertex(i, 0, k + 1), vertex(i + 1, 0, k + 1), vertex(i + 1, 0, k));
      }
    }
    for (let j = 0; j < bands; j++) {
      for (let k = 0; k < slices; k++) {
        quad(vertex(0, j, k), vertex(0, j + 1, k), vertex(0, j + 1, k + 1), vertex(0, j, k + 1));
        quad(vertex(segments, j, k), vertex(segments, j, k + 1), vertex(segments, j + 1, k + 1), vertex(segments, j + 1, k));
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    kit.mesh(shade(geometry, seed), stone, at(x, z));
    const footOffset = radius * 0.94;
    const crownY = kit.height(x, z) + spring;
    outcrop(x - footOffset, z, radius * 0.64, depth * 1.25, crownY - kit.height(x - footOffset, z) + 0.24, seed);
    outcrop(x + footOffset, z, radius * 0.67, depth * 1.32, crownY - kit.height(x + footOffset, z) + 0.3, seed + 1.4);
  }

  arch(-7.7, -10.6, 4.8, 4.25, 2.7, 1.5);
  arch(13.2, -13.6, 2.65, 2.8, 2, 4.8);
  [
    [-20.5, -11, 4.2, 4.4, 7.7], [-17, -15, 4.7, 4, 9.8],
    [-2, -16.5, 5.5, 4.2, 8.2], [3, -15.7, 4.8, 4.5, 6.1],
    [8, -17, 3.4, 3.5, 7.5], [19, -13.2, 4.7, 5.1, 8.7],
    [21, -7.2, 3.4, 3.8, 4.8], [-20, 8.3, 4, 3.1, 2.2],
    [-15.2, 11.9, 3.1, 2.7, 1.4], [19, 10.9, 3.8, 3.1, 1.8],
    [-0.8, -7.4, 2.7, 2.5, 1.1], [17, -6.1, 2.2, 2.3, 1.5],
  ].forEach(([x, z, w, d, h], i) => outcrop(x, z, w, d, h, i * 1.7));

  // Asymmetric lee slopes and low wind ripples are modeled into the sand surface.
  function dune(x, z, width, depth, height, turn) {
    const rx = Math.abs(Math.cos(turn)) * width + Math.abs(Math.sin(turn)) * depth;
    const rz = Math.abs(Math.sin(turn)) * width + Math.abs(Math.cos(turn)) * depth;
    if (!clear(x, z, rx, rz)) return;
    const geometry = new THREE.PlaneGeometry(width * 2, depth * 2, 30, 18);
    geometry.rotateX(-Math.PI / 2);
    geometry.rotateY(turn);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i);
      const pz = positions.getZ(i);
      const u = (px * Math.cos(turn) - pz * Math.sin(turn)) / width;
      const v = (px * Math.sin(turn) + pz * Math.cos(turn)) / depth;
      const envelope = Math.max(0, Math.cos(u * Math.PI / 2) * Math.cos(v * Math.PI / 2));
      const crest = Math.pow(envelope, 1.8) * (1 + 0.3 * Math.sin(v * 2.4));
      const ripples = Math.sin(u * 55 + v * 8) * 0.032 * envelope;
      positions.setY(i, kit.height(x + px, z + pz) + height * crest + ripples - 0.035);
    }
    geometry.computeVertexNormals();
    kit.mesh(geometry, sand, [x, 0, z]);
  }
  dune(-10, 12.8, 7.2, 4, 1.45, -0.12);
  dune(4, 14, 6.8, 4.6, 1.8, 0.16);
  dune(16.5, 6.8, 5, 2.8, 0.85, -0.2);
  dune(-16, -4.8, 4.8, 2.1, 0.58, 0.08);

  function beam(a, b, radius, material) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const direction = end.clone().sub(start);
    const object = kit.mesh(cylinder, material, start.add(end).multiplyScalar(0.5).toArray(), [radius, direction.length(), radius]);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return object;
  }

  function cactus(x, z, height, facing) {
    if (!clear(x, z, height * 0.44, 0.55)) return;
    const y = kit.height(x, z);
    const radius = height * 0.105;
    const trunk = new THREE.CapsuleGeometry(radius, height - radius * 2, 4, 9);
    kit.mesh(trunk, green, [x, y + height * 0.5, z]);
    for (const side of [-1, 1]) {
      const elbow = height * (side < 0 ? 0.4 : 0.59);
      const reach = height * (side < 0 ? 0.33 : 0.29);
      const dx = Math.cos(facing) * reach * side;
      const dz = Math.sin(facing) * reach * side;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, y + elbow, z),
        new THREE.Vector3(x + dx * 0.85, y + elbow + 0.03, z + dz * 0.85),
        new THREE.Vector3(x + dx, y + elbow + height * 0.17, z + dz),
        new THREE.Vector3(x + dx, y + elbow + height * 0.31, z + dz),
      ]);
      kit.mesh(new THREE.TubeGeometry(curve, 10, radius * 0.72, 7, false), green);
      kit.mesh(new THREE.SphereGeometry(radius * 0.72, 7, 5), green, [x + dx, y + elbow + height * 0.31, z + dz]);
    }
    // Raised ribs catch the sun without resorting to painted lines.
    for (let i = 0; i < 5; i++) {
      const angle = i / 5 * Math.PI * 2;
      kit.mesh(cylinder, cactusShade,
        [x + Math.cos(angle) * radius * 0.96, y + height * 0.49, z + Math.sin(angle) * radius * 0.96],
        [radius * 0.065, height * 0.8, radius * 0.065]);
    }
  }
  cactus(-17.9, 4.1, 3.7, 0.1);
  cactus(10.8, 6.1, 3.2, -0.25);
  cactus(20.9, 2.2, 2.5, 0.15);
  cactus(-0.1, -4.9, 2.4, -0.3);
  cactus(-15, 4.7, 1.7, 0.4);

  // A half-buried sandstone courtyard: staggered masonry and a fallen lintel.
  const ruinX = 5.1;
  const ruinZ = -7.9;
  if (clear(ruinX, ruinZ, 3.1, 2.7)) {
    for (let row = 0; row < 3; row++) {
      for (let block = 0; block < 4 - row; block++) {
        const x = ruinX - 2.1 + block * 1.12 + (row % 2) * 0.37;
        const z = ruinZ - 1.3;
        kit.mesh(unitBox, masonry, at(x, z, 0.33 + row * 0.64),
          [1.05, 0.59, 0.67], [0.015 * block, 0.025 * (block - row), 0.018]);
      }
    }
    for (let row = 0; row < 3; row++) {
      kit.mesh(unitBox, '#b77e56', at(ruinX + 1.8, ruinZ + row * 0.77, 0.33),
        [0.7, 0.61, 0.7], [0, -0.03, 0.02]);
    }
    kit.mesh(unitBox, '#ddaa76', at(ruinX + 0.9, ruinZ + 0.1, 1.39), [0.92, 2.7, 0.86], [0.06, 0.1, -0.09]);
    kit.mesh(unitBox, '#c18b60', at(ruinX - 0.8, ruinZ + 1.2, 0.39), [2.15, 0.55, 0.74], [0, 0.4, 0.12]);
    outcrop(ruinX - 2.1, ruinZ + 1.3, 1.4, 1.3, 0.63, 4);
  }

  // Four crooked poles, guy lines, and a sagging sail, with rolled bedding below.
  const campX = -5;
  const campZ = kit.pathZ(campX) + 6.4;
  let sail;
  let sailRest;
  if (clear(campX, campZ, 3.6, 3.4)) {
    const baseY = kit.height(campX, campZ);
    const corners = [[-2, -1.6, 3.2], [2, -1.6, 3.05], [-2, 1.6, 2.7], [2, 1.6, 2.84]];
    corners.forEach(([dx, dz, h], i) => {
      const x = campX + dx;
      const z = campZ + dz;
      const top = [x + (i % 2 ? 0.09 : -0.12), baseY + h + 0.16, z];
      beam(at(x, z, -0.05), top, 0.07, wood);
      const peg = at(x + Math.sign(dx) * 0.85, z + Math.sign(dz) * 0.8, 0.08);
      beam(top, peg, 0.018, rope);
      beam(peg, [peg[0] + 0.1, peg[1] + 0.22, peg[2]], 0.045, wood);
    });
    const geometry = new THREE.PlaneGeometry(4.1, 3.35, 16, 12);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const u = x / 2.05;
      const v = z / 1.675;
      const sag = 0.52 * (1 - u * u) * (1 - v * v);
      positions.setY(i, baseY + 2.95 - v * 0.19 - sag + Math.sin(x * 7 + z) * 0.025);
    }
    geometry.computeVertexNormals();
    sail = kit.mesh(geometry, canvas, [campX, 0, campZ]);
    sailRest = Float32Array.from(positions.array);
    kit.mesh(unitBox, '#ad8060', at(campX - 0.6, campZ + 0.2, 0.085), [2.4, 0.13, 1.35], [0, 0.07, 0]);
    kit.mesh(cylinder, '#8a9478', at(campX - 1.35, campZ + 0.2, 0.3), [0.24, 1.3, 0.24], [Math.PI / 2, 0, 0]);
    kit.mesh(unitBox, wood, at(campX + 1.05, campZ - 0.5, 0.35), [0.85, 0.7, 0.75], [0, -0.12, 0]);
    for (const dx of [-0.26, 0.26]) {
      kit.mesh(unitBox, rope, at(campX + 1.05 + dx, campZ - 0.5, 0.71), [0.055, 0.035, 0.77], [0, -0.12, 0]);
    }
    const jar = new THREE.LatheGeometry([
      new THREE.Vector2(0.12, 0), new THREE.Vector2(0.3, 0.1),
      new THREE.Vector2(0.32, 0.4), new THREE.Vector2(0.18, 0.61),
      new THREE.Vector2(0.15, 0.65), new THREE.Vector2(0.18, 0.7),
    ], 12);
    kit.mesh(jar, clay, at(campX + 1.75, campZ + 0.8));
  }

  // Shared instanced debris keeps the living ground inexpensive.
  const pebbleGeometry = new THREE.IcosahedronGeometry(1, 0);
  const pebbles = [];
  const grass = [];
  for (let i = 0; i < 115; i++) {
    const x = -22.5 + kit.random() * 45;
    const z = -18.2 + kit.random() * 36.4;
    const size = 0.07 + kit.random() * 0.22;
    if (clear(x, z, size, size)) pebbles.push({ x, z, size, turn: kit.random() * Math.PI });
    if (i < 38 && clear(x, z, 0.35, 0.35)) grass.push({ x, z, size: 0.18 + kit.random() * 0.22 });
  }
  const pebbleMesh = new THREE.InstancedMesh(pebbleGeometry, kit.material('#bd8f61', { roughness: 1 }), pebbles.length);
  const matrix = new THREE.Object3D();
  pebbles.forEach(({ x, z, size, turn }, i) => {
    matrix.position.set(...at(x, z, size * 0.25));
    matrix.scale.set(size * 1.5, size * 0.65, size);
    matrix.rotation.set(0.2, turn, 0.1);
    matrix.updateMatrix();
    pebbleMesh.setMatrixAt(i, matrix.matrix);
    pebbleMesh.setColorAt(i, new THREE.Color(i % 3 ? '#c89968' : '#a57450'));
  });
  pebbleMesh.castShadow = true;
  pebbleMesh.receiveShadow = true;
  group.add(pebbleMesh);
  const grassGeometry = new THREE.ConeGeometry(0.065, 1, 4);
  grassGeometry.translate(0, 0.5, 0);
  const grassMesh = new THREE.InstancedMesh(grassGeometry, kit.material('#93834e', { roughness: 1 }), grass.length * 5);
  grass.forEach(({ x, z, size }, i) => {
    for (let blade = 0; blade < 5; blade++) {
      const angle = blade / 5 * Math.PI * 2;
      matrix.position.set(...at(x + Math.cos(angle) * 0.05, z + Math.sin(angle) * 0.05));
      matrix.scale.set(size, size * (0.8 + blade * 0.11), size);
      matrix.rotation.set(Math.cos(angle) * 0.55, angle, Math.sin(angle) * 0.55);
      matrix.updateMatrix();
      grassMesh.setMatrixAt(i * 5 + blade, matrix.matrix);
    }
  });
  grassMesh.castShadow = true;
  grassMesh.receiveShadow = true;
  group.add(grassMesh);

  return {
    group,
    update(time) {
      if (!sail) return;
      const positions = sail.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = sailRest[i * 3];
        const z = sailRest[i * 3 + 2];
        const pinned = Math.max(0, (1 - (x / 2.05) ** 2) * (1 - (z / 1.675) ** 2));
        positions.setY(i, sailRest[i * 3 + 1] + Math.sin(time * 1.6 + x * 1.7 + z + phase) * 0.035 * pinned);
      }
      positions.needsUpdate = true;
      sail.geometry.computeVertexNormals();
    },
  };
}
