export default function buildBiome({ THREE, kit, index }) {
  const { group } = kit;
  const random = () => kit.random();
  const ground = kit.ground(0x343c48, { roughness: 0.96, segments: 64 });
  ground.receiveShadow = true;

  const stone = kit.material(0xffffff, { vertexColors: true, roughness: 0.91 });
  const rubble = kit.material(0x505967, { roughness: 0.88 });
  const limestone = kit.material(0x87968f, { roughness: 0.76 });
  const darkStone = kit.material(0x303b49, { roughness: 0.93 });
  const calcite = kit.material(0x9cb5ad, { roughness: 0.7 });
  const crystalMaterials = [
    kit.material(0x72d9d5, {
      roughness: 0.24, metalness: 0.2, emissive: 0x2aa9a7, emissiveIntensity: 0.28,
    }),
    kit.material(0x9e9cdb, {
      roughness: 0.29, metalness: 0.17, emissive: 0x6056ab, emissiveIntensity: 0.24,
    }),
    kit.material(0xc0e8d9, {
      roughness: 0.22, metalness: 0.16, emissive: 0x65c8ae, emissiveIntensity: 0.19,
    }),
  ];

  // Closed, irregular cross sections leave the entire top of the cavern open.
  function wall(side) {
    const positions = [];
    const colors = [];
    const indices = [];
    const palette = [0x444d5e, 0x505867, 0x626a77, 0x737e87, 0x586170, 0x3e4959, 0x353f4d];
    const ringSize = palette.length;
    const count = 65;
    for (let i = 0; i < count; i += 1) {
      const x = -23.8 + (47.6 * i) / (count - 1);
      const t = i / (count - 1);
      const endFade = Math.sin(Math.PI * t) ** 0.4;
      const ridge = Math.sin(x * 0.43 + side) * 0.7 + Math.cos(x * 0.91) * 0.4;
      const height = side > 0
        ? 5.8 + endFade * 4.7 + ridge
        : 1.15 + endFade * 1.6 + ridge * 0.4;
      const toe = (side > 0 ? 6.6 : 9.4) + Math.sin(x * 0.27) * 0.6;
      const distances = [toe, toe - 0.5, toe + 0.25, toe + 1.3, toe + 3.2, toe + 5, toe + 5.5];
      const elevations = [-0.12, height * 0.29, height * 0.76, height, height * 0.89, height * 0.42, -0.12];
      for (let j = 0; j < ringSize; j += 1) {
        const jitter = i === 0 || i === count - 1 ? 0 : (random() - 0.5) * 0.45;
        const z = THREE.MathUtils.clamp(kit.pathZ(x) + side * (distances[j] + jitter), -19.5, 19.5);
        positions.push(x, kit.height(x, z) + elevations[j] + (j > 0 && j < 6 ? jitter : 0), z);
        const color = new THREE.Color(palette[j]);
        color.multiplyScalar(0.89 + random() * 0.2);
        colors.push(color.r, color.g, color.b);
      }
      if (i > 0) {
        for (let j = 0; j < ringSize; j += 1) {
          const a = (i - 1) * ringSize + j;
          const b = (i - 1) * ringSize + (j + 1) % ringSize;
          const c = i * ringSize + j;
          const d = i * ringSize + (j + 1) % ringSize;
          if (side > 0) indices.push(a, b, c, b, d, c);
          else indices.push(a, c, b, b, c, d);
        }
      }
    }
    // Cap only the ends, never the walking route or the open camera view.
    for (let j = 1; j < ringSize - 1; j += 1) {
      const end = (count - 1) * ringSize;
      if (side > 0) indices.push(0, j + 1, j, end, end + j, end + j + 1);
      else indices.push(0, j, j + 1, end, end + j + 1, end + j);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    kit.mesh(geometry, stone);
  }
  wall(1);
  wall(-1);

  const dummy = new THREE.Object3D();
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rocks = [];
  const paleRocks = [];
  const formations = [];
  const crystalInstances = [[], [], []];

  // Sample the full footprint so even broad props respect a curving route.
  function outsideZ(x, side, gap, radiusX = 0, radiusZ = 0) {
    let boundary = kit.pathZ(x);
    for (let i = 0; i <= 12; i += 1) {
      const p = kit.pathZ(x - radiusX + (2 * radiusX * i) / 12);
      boundary = side > 0 ? Math.max(boundary, p) : Math.min(boundary, p);
    }
    return boundary + side * (gap + radiusZ);
  }

  function instance(geometry, material, items) {
    if (items.length === 0) return;
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    items.forEach((item, i) => {
      dummy.position.set(...item.position);
      dummy.rotation.set(...(item.rotation || [0, 0, 0]));
      dummy.scale.set(...item.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (item.color) mesh.setColorAt(i, new THREE.Color(item.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }

  // Eroded limestone spires have shoulders, a narrow neck, and uneven flutes.
  function spireGeometry() {
    const positions = [];
    const indices = [];
    const radii = [1, 0.81, 0.5, 0.29, 0.17, 0.015];
    const heights = [0, 0.13, 0.4, 0.66, 0.85, 1];
    const sides = 9;
    for (let ring = 0; ring < radii.length; ring += 1) {
      for (let j = 0; j < sides; j += 1) {
        const a = (j / sides) * Math.PI * 2;
        const flute = 1 + Math.sin(j * 2.6 + ring * 0.7) * 0.13;
        positions.push(
          Math.cos(a) * radii[ring] * flute + heights[ring] * 0.08,
          heights[ring],
          Math.sin(a) * radii[ring] * flute,
        );
        if (ring > 0) {
          const a0 = (ring - 1) * sides + j;
          const b = (ring - 1) * sides + (j + 1) % sides;
          const c = ring * sides + j;
          const d = ring * sides + (j + 1) % sides;
          indices.push(a0, c, b, b, c, d);
        }
      }
    }
    for (let j = 1; j < sides - 1; j += 1) indices.push(0, j, j + 1);
    const top = (radii.length - 1) * sides;
    for (let j = 1; j < sides - 1; j += 1) indices.push(top, top + j + 1, top + j);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  // A six-sided mineral prism with a long solid body and an asymmetric tip.
  function crystalGeometry() {
    const positions = [];
    const indices = [];
    const rings = [[0, 0.65], [0.16, 1], [0.73, 0.85], [1, 0]];
    rings.forEach(([y, radius], ring) => {
      for (let j = 0; j < 6; j += 1) {
        const a = (j / 6) * Math.PI * 2;
        positions.push(Math.cos(a) * radius, y + (ring === 2 ? Math.sin(j * 2) * 0.045 : 0), Math.sin(a) * radius);
        if (ring > 0) {
          const a0 = (ring - 1) * 6 + j;
          const b = (ring - 1) * 6 + (j + 1) % 6;
          const c = ring * 6 + j;
          const d = ring * 6 + (j + 1) % 6;
          indices.push(a0, c, b, b, c, d);
        }
      }
    });
    for (let j = 1; j < 5; j += 1) indices.push(0, j, j + 1);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    const faceted = geometry.toNonIndexed();
    geometry.dispose();
    faceted.computeVertexNormals();
    return faceted;
  }

  // Three intentional mineral gardens, each with a different silhouette.
  const gardens = [
    { x: -16.2, side: 1, gap: 3.1, size: 1.1, tone: 0 },
    { x: 1.8, side: 1, gap: 3.7, size: 1.65, tone: 1 },
    { x: 16.8, side: -1, gap: 3.2, size: 0.9, tone: 0 },
    { x: -3.8, side: -1, gap: 5.7, size: 0.65, tone: 2 },
  ];
  for (const garden of gardens) {
    const z = outsideZ(garden.x, garden.side, garden.gap, 2.5, 1.2);
    rocks.push({
      position: [garden.x, kit.height(garden.x, z) + 0.25, z],
      scale: [2.2, 0.65, 1.25], rotation: [0.1, 0.3, 0.07],
    });
    for (let j = 0; j < 11; j += 1) {
      const angle = j * 2.39996;
      const radius = j === 0 ? 0 : 0.38 + Math.sqrt(j / 10) * 1.2;
      const x = garden.x + Math.cos(angle) * radius;
      const cz = z + Math.sin(angle) * radius * 0.55;
      const tall = (j === 0 ? 3.1 : 0.75 + random() * 1.85) * garden.size;
      const width = (0.17 + random() * 0.17) * garden.size;
      crystalInstances[garden.tone].push({
        position: [x, kit.height(x, cz) + 0.32, cz],
        scale: [width, tall, width * 0.83],
        rotation: [Math.sin(angle) * 0.2, angle, -Math.cos(angle) * 0.24],
      });
    }
  }

  // Broken buttresses anchor the wall; smaller scree gives a readable scale.
  for (let i = 0; i < 52; i += 1) {
    const side = i % 4 === 0 ? -1 : 1;
    const x = -21.2 + random() * 42.4;
    const large = i < 13;
    const sx = large ? 1 + random() * 1.3 : 0.22 + random() * 0.58;
    const sy = large ? 1.1 + random() * 2.4 : 0.18 + random() * 0.4;
    const sz = large ? 0.9 + random() * 0.8 : 0.2 + random() * 0.45;
    const z = outsideZ(x, side, large ? 5.1 : 2.25 + random() * 3.4, sx, sz);
    rocks.push({
      position: [x, kit.height(x, z) + sy * 0.43, z],
      scale: [sx, sy, sz], rotation: [0.12, random() * Math.PI, 0.13],
    });
  }

  for (let i = 0; i < 38; i += 1) {
    const side = i % 5 === 0 ? -1 : 1;
    const x = -21 + random() * 42;
    const r = 0.25 + random() * 0.55;
    const z = outsideZ(x, side, 3.1 + random() * 2.6, r, r);
    const tall = 0.9 + random() ** 2 * 4.2;
    formations.push({
      position: [x, kit.height(x, z) - 0.04, z], scale: [r, tall, r * 0.83],
      rotation: [0, random() * 6.28, 0], color: i % 3 ? 0xabb5a8 : 0x768c89,
    });
    if (i % 3 === 0) {
      paleRocks.push({
        position: [x, kit.height(x, z) + 0.12, z], scale: [r * 1.8, 0.3, r * 1.5],
      });
    }
  }

  // Hanging teeth attach to solid rear-wall shelves, never an invisible roof.
  for (const x of [-18, -10, 0, 9, 18]) {
    const z = outsideZ(x, 1, 6.2, 1.7, 0.9);
    const y = kit.height(x, z) + 6.2 + Math.sin(x * 0.3) * 0.6;
    rocks.push({ position: [x, y, z + 0.6], scale: [2.1, 1.0, 1.65], rotation: [0.1, 0.2, -0.1] });
    for (let j = 0; j < 4; j += 1) {
      const r = 0.24 + random() * 0.18;
      formations.push({
        position: [x - 1.2 + j * 0.75, y - 0.2, z - 0.35],
        scale: [r, 1.1 + random() * 1.65, r], rotation: [Math.PI, j, 0], color: 0x889c99,
      });
    }
  }

  const water = new THREE.MeshPhysicalMaterial({
    color: 0x275d68, metalness: 0.34, roughness: 0.13,
    clearcoat: 1, clearcoatRoughness: 0.08,
    transparent: true, opacity: 0.83, depthWrite: false,
    emissive: 0x123c45, emissiveIntensity: 0.12,
  });
  const rippleMaterial = kit.material(0x86bcb7, {
    transparent: true, opacity: 0.16, roughness: 0.22,
    emissive: 0x427c80, emissiveIntensity: 0.12, depthWrite: false,
  });
  const ripples = [];

  function pool(cx, radiusX, radiusZ, phase) {
    const cz = outsideZ(cx, -1, 2.7, radiusX + 0.55, radiusZ + 0.55);
    const count = 56;
    const outline = [];
    let surfaceY = kit.height(cx, cz) + 0.09;
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      const r = 1 + Math.sin(a * 3 + phase) * 0.075 + Math.cos(a * 5) * 0.035;
      const x = cx + Math.cos(a) * radiusX * r;
      const z = cz + Math.sin(a) * radiusZ * r;
      outline.push([x, z]);
      surfaceY = Math.max(surfaceY, kit.height(x, z) + 0.07);
    }
    const positions = [cx, surfaceY, cz];
    const indices = [];
    outline.forEach(([x, z], i) => {
      positions.push(x, surfaceY, z);
      indices.push(0, 1 + (i + 1) % count, i + 1);
    });
    const surface = new THREE.BufferGeometry();
    surface.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    surface.setIndex(indices);
    surface.computeVertexNormals();
    const bed = kit.mesh(surface.clone(), darkStone, [0, -0.07, 0]);
    bed.castShadow = false;
    const waterMesh = kit.mesh(surface, water);
    waterMesh.castShadow = false;
    waterMesh.renderOrder = 2;

    // A solid calcite rim meets the terrain even when the floor is sloping.
    const rimPositions = [];
    const rimIndices = [];
    for (let i = 0; i < count; i += 1) {
      const [x, z] = outline[i];
      const ox = cx + (x - cx) * 1.12;
      const oz = cz + (z - cz) * 1.16;
      rimPositions.push(x, surfaceY - 0.04, z, ox, surfaceY + 0.12 + Math.sin(i * 1.7) * 0.045, oz,
        ox, kit.height(ox, oz) - 0.06, oz);
      const a = i * 3;
      const b = ((i + 1) % count) * 3;
      rimIndices.push(a, b, a + 1, b, b + 1, a + 1, a + 1, b + 1, a + 2, b + 1, b + 2, a + 2);
    }
    const rim = new THREE.BufferGeometry();
    rim.setAttribute('position', new THREE.Float32BufferAttribute(rimPositions, 3));
    rim.setIndex(rimIndices);
    rim.computeVertexNormals();
    kit.mesh(rim, calcite);

    for (let i = 0; i < 2; i += 1) {
      const ripple = kit.mesh(new THREE.TorusGeometry(0.38 + i * 0.21, 0.012, 4, 40), rippleMaterial,
        [cx + radiusX * 0.21, surfaceY + 0.014, cz - radiusZ * 0.15],
        [1, 0.6, 1], [-Math.PI / 2, 0, 0]);
      ripple.castShadow = false;
      ripple.renderOrder = 3;
      ripples.push({ mesh: ripple, phase: phase + i * Math.PI });
    }
  }
  pool(-12.2, 4.0, 1.65, 0.5);
  pool(10.1, 3.3, 1.8, 2.4);

  instance(rockGeometry, rubble, rocks);
  instance(rockGeometry, limestone, paleRocks);
  instance(spireGeometry(), limestone, formations);
  const mineralGeometry = crystalGeometry();
  crystalInstances.forEach((items, i) => instance(mineralGeometry, crystalMaterials[i], items));

  const phase = Number.isFinite(index) ? index * 0.7 : 0;
  return {
    group,
    update(time) {
      crystalMaterials.forEach((material, i) => {
        material.emissiveIntensity = 0.24 + Math.sin(time * 0.65 + phase + i * 1.8) * 0.035;
      });
      ripples.forEach(({ mesh, phase: offset }) => {
        const pulse = 1 + Math.sin(time * 0.8 + offset) * 0.12;
        mesh.scale.set(pulse, pulse * 0.6, 1);
      });
    },
  };
}
