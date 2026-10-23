// A cooled basalt causeway through an active caldera. All coordinates are local.
export default function buildBiome({ THREE, kit }) {
  const { group } = kit;
  const random = () => kit.random();
  const tau = Math.PI * 2;
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  const plum = kit.material('#372735', { roughness: 0.96, flatShading: true });
  const basalt = kit.material('#ffffff', { roughness: 0.93, flatShading: true });
  const crust = kit.material('#211d29', { roughness: 1 });
  const lava = kit.material('#fa5c20', {
    emissive: '#ff420b', emissiveIntensity: 1.65, roughness: 0.48,
  });
  const molten = kit.material('#ffd17b', {
    emissive: '#ff9c36', emissiveIntensity: 2.2, roughness: 0.4,
  });
  kit.ground('#46323e', { roughness: 1, segments: 64 });

  function addMesh(geometry, material, name) {
    const mesh = kit.mesh(geometry, material);
    mesh.name = name;
    return mesh;
  }

  function geometryFrom(vertices, indices) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  // Check the whole footprint, including bends, rather than only its center.
  function clearOfTrail(x, z, radiusX, radiusZ) {
    for (let i = 0; i <= 8; i++) {
      const sampleX = x - radiusX + (2 * radiusX * i) / 8;
      if (Math.abs(z - kit.pathZ(sampleX)) < 1.85 + radiusZ) return false;
    }
    return Math.abs(x) + radiusX < 23.8 && Math.abs(z) + radiusZ < 19.8;
  }

  function instances(geometry, material, placements, name) {
    const mesh = new THREE.InstancedMesh(geometry, material, placements.length);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    placements.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx || 0, p.ry || 0, p.rz || 0);
      dummy.scale.set(p.sx, p.sy, p.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (p.color) mesh.setColorAt(i, tint.set(p.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    group.add(mesh);
    return mesh;
  }

  // Closed, terrain-following ribbons have glowing tops and dimensional edges.
  function ribbon(points, width, thickness, material, name) {
    const vertices = [];
    const indices = [];
    points.forEach((point, i) => {
      const before = points[Math.max(0, i - 1)];
      const after = points[Math.min(points.length - 1, i + 1)];
      const dx = after.x - before.x;
      const dz = after.z - before.z;
      const length = Math.hypot(dx, dz) || 1;
      const spread = width * (0.88 + Math.sin(i * 0.7) * 0.12);
      for (const vertical of [0, thickness]) {
        for (const side of [-1, 1]) {
          const x = point.x - (dz / length) * spread * side * 0.5;
          const z = point.z + (dx / length) * spread * side * 0.5;
          vertices.push(x, kit.height(x, z) + point.lift + vertical, z);
        }
      }
      if (i === 0) return;
      const a = (i - 1) * 4;
      const b = i * 4;
      indices.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3);
      indices.push(a, b, a + 2, a + 2, b, b + 2);
      indices.push(a + 3, b + 3, a + 1, a + 1, b + 3, b + 1);
      indices.push(a + 1, b + 1, a, a, b + 1, b);
    });
    const end = (points.length - 1) * 4;
    indices.push(0, 2, 1, 1, 2, 3);
    indices.push(end, end + 1, end + 2, end + 1, end + 3, end + 2);
    for (let i = 0; i < indices.length; i += 3) {
      [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
    }
    return addMesh(geometryFrom(vertices, indices), material, name);
  }

  const channels = [];
  for (const side of [-1, 1]) {
    const points = [];
    for (let i = 0; i <= 88; i++) {
      const x = -23 + (46 * i) / 88;
      const offset = side * (side < 0 ? 5.2 : 8.1);
      const z = kit.pathZ(x) + offset + Math.sin(x * 0.23 + side) * 0.85;
      points.push({ x, z, lift: 0.025 });
    }
    channels.push(points);
    for (const bankSide of [-1, 1]) {
      const bank = points.map((point, i) => {
        const before = points[Math.max(0, i - 1)];
        const after = points[Math.min(points.length - 1, i + 1)];
        const dx = after.x - before.x;
        const dz = after.z - before.z;
        const length = Math.hypot(dx, dz) || 1;
        return { x: point.x - (dz / length) * 0.8 * bankSide,
          z: point.z + (dx / length) * 0.8 * bankSide, lift: 0.025 };
      });
      ribbon(bank, 0.4, 0.12, crust, 'cooled-channel-bank');
    }
    ribbon(points.map(p => ({ ...p, lift: 0.075 })), 1.12, 0.075, lava, 'lava-channel');
    ribbon(points.map(p => ({ ...p, lift: 0.155 })), 0.19, 0.015, molten, 'molten-current');
  }

  // Interlocking, broken hexagonal columns expose the cooled flow's structure.
  const columns = [];
  const outcrops = [[-16, 7.1, 3.1], [-10, -9, 2.5], [15.5, 11.4, 3.9], [20, -7.7, 2.3]];
  for (const [centerX, offsetZ, peak] of outcrops) {
    for (let row = -2; row <= 2; row++) {
      for (let column = -2; column <= 2; column++) {
        if (Math.abs(row) + Math.abs(column) > 3) continue;
        const x = centerX + column * 0.91 + (row % 2) * 0.44;
        const z = kit.pathZ(x) + offsetZ + row * 0.8;
        if (!clearOfTrail(x, z, 0.65, 0.65)) continue;
        const h = 0.65 + peak * Math.max(0.16, 1 - Math.hypot(row, column) * 0.29)
          + random() * 0.55;
        columns.push({ x, z, y: kit.height(x, z) + h * 0.5 - 0.08,
          sx: 0.49, sy: h, sz: 0.49, ry: 0.12,
          color: ['#695261', '#453747', '#594553', '#80636c'][Math.floor(random() * 4)] });
      }
    }
  }
  instances(new THREE.CylinderGeometry(0.86, 1, 1, 6, 1), basalt, columns, 'fractured-basalt-columns');

  const rubble = [];
  const shards = [];
  for (let i = 0; i < 160; i++) {
    const x = -22.5 + random() * 45;
    const side = i % 2 ? 1 : -1;
    const z = kit.pathZ(x) + side * (2.7 + random() * 12.2);
    const size = i < 40 ? 0.45 + random() * 0.8 : 0.12 + random() * 0.3;
    if (!clearOfTrail(x, z, size * 1.5, size)) continue;
    const item = { x, z, y: kit.height(x, z) + size * 0.28,
      sx: size * (1.1 + random() * 0.6), sy: size * (0.5 + random() * 0.9), sz: size,
      rx: random() * 0.5, ry: random() * tau, rz: random() * 0.5,
      color: ['#65505d', '#4b3848', '#342936', '#80616b'][i % 4] };
    (i < 40 ? shards : rubble).push(item);
  }
  instances(new THREE.IcosahedronGeometry(1, 0), basalt, shards, 'angular-lava-bombs');
  instances(new THREE.DodecahedronGeometry(1, 0), basalt, rubble, 'volcanic-scree');

  // Split slabs make several deliberate geological accents, away from the route.
  const slabs = [];
  for (const [x, offset] of [[-20, -11.5], [-5, 11.6], [8, 13.5], [20, 5.5]]) {
    const z = kit.pathZ(x) + offset;
    if (!clearOfTrail(x, z, 2, 1.5)) continue;
    for (let i = 0; i < 3; i++) {
      const sx = x + (i - 1) * 0.73;
      const sz = z + i * 0.24;
      slabs.push({ x: sx, z: sz, y: kit.height(sx, sz) + 0.64 + i * 0.2,
        sx: 0.85, sy: 1.2 + i * 0.4, sz: 1.6, rx: -0.23, ry: 0.35, rz: -0.22 + i * 0.18 });
    }
  }
  instances(new THREE.BoxGeometry(1, 1, 1), plum, slabs, 'split-basalt-slabs');

  // The volcano is an authored open crater, not a capped primitive cone.
  const volcanoX = 5.8;
  const volcanoZ = -12.6;
  const baseY = kit.height(volcanoX, volcanoZ) - 0.16;
  const rings = [[6.8, 0], [5.8, 1.25], [4.4, 3.4], [2.9, 6.0],
    [1.95, 8.1], [1.37, 7.92], [0.94, 6.72]];
  const sectors = 40;
  function volcanoPoint(ring, sector) {
    const angle = (sector / sectors) * tau;
    const [radius, elevation] = rings[ring];
    const fracture = 1 + 0.048 * Math.sin(angle * 7 + 0.8) + 0.03 * Math.cos(angle * 11);
    const x = volcanoX + Math.cos(angle) * radius * fracture;
    const z = volcanoZ + Math.sin(angle) * radius * fracture;
    return [x, ring === 0 ? kit.height(x, z) - 0.08
      : baseY + elevation + Math.sin(angle * 5 + 0.3) * 0.16, z];
  }
  const coneVertices = [];
  const coneColors = [];
  const conePalette = ['#493243', '#513a49', '#614452', '#382b3b', '#6b4a56'];
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let sector = 0; sector < sectors; sector++) {
      const a = volcanoPoint(ring, sector);
      const b = volcanoPoint(ring, sector + 1);
      const c = volcanoPoint(ring + 1, sector);
      const d = volcanoPoint(ring + 1, sector + 1);
      // Outward normals continue inward down the crater's bowl.
      coneVertices.push(...a, ...c, ...b, ...b, ...c, ...d);
      tint.set(conePalette[(sector * 3 + ring * 2) % conePalette.length]);
      if (ring >= 4) tint.lerp(new THREE.Color('#251d29'), 0.34);
      for (let v = 0; v < 6; v++) coneColors.push(tint.r, tint.g, tint.b);
    }
  }
  const coneGeometry = new THREE.BufferGeometry();
  coneGeometry.setAttribute('position', new THREE.Float32BufferAttribute(coneVertices, 3));
  coneGeometry.setAttribute('color', new THREE.Float32BufferAttribute(coneColors, 3));
  coneGeometry.computeVertexNormals();
  addMesh(coneGeometry, kit.material('#ffffff', {
    vertexColors: true, roughness: 1, flatShading: true,
  }), 'stratified-volcano-crater');
  const crater = addMesh(new THREE.CylinderGeometry(1.03, 0.87, 0.14, 32), lava, 'crater-lava-lake');
  crater.position.set(volcanoX, baseY + 6.77, volcanoZ);
  const craterCore = addMesh(new THREE.TorusGeometry(0.57, 0.045, 5, 28), molten, 'crater-hot-ring');
  craterCore.rotation.x = -Math.PI / 2;
  craterCore.position.set(volcanoX, baseY + 6.855, volcanoZ);

  // Two narrow molten fissures follow actual vertices of the front-facing slope.
  for (const sector of [7, 13]) {
    const vertices = [];
    const indices = [];
    for (let ring = 0; ring <= 4; ring++) {
      const left = volcanoPoint(ring, sector);
      const right = volcanoPoint(ring, sector + 1);
      for (const mix of [0.28, 0.65]) {
        vertices.push(left[0] + (right[0] - left[0]) * mix,
          left[1] + (right[1] - left[1]) * mix + 0.055,
          left[2] + (right[2] - left[2]) * mix);
      }
      if (ring > 0) {
        const a = (ring - 1) * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    addMesh(geometryFrom(vertices, indices), lava, 'summit-lava-fissure');
  }

  const smokeGroup = new THREE.Group();
  smokeGroup.name = 'volcanic-smoke';
  group.add(smokeGroup);
  const smokeMaterial = kit.material('#7b6577', {
    roughness: 1, transparent: true, opacity: 0.32, depthWrite: false, flatShading: true,
  });
  const smoke = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), smokeMaterial, 12);
  smoke.name = 'rising-ash-plume';
  smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // The plume changes bounds as its wisps rise and expand.
  smoke.frustumCulled = false;
  smokeGroup.add(smoke);

  const emberMaterial = kit.material('#ffc772', {
    emissive: '#ff7021', emissiveIntensity: 2.4, roughness: 0.5,
  });
  const embers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), emberMaterial, 64);
  embers.name = 'drifting-embers';
  embers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  embers.frustumCulled = false;
  group.add(embers);
  const emberSeeds = Array.from({ length: 64 }, (_, i) => {
    const point = channels[i % 2][Math.floor(random() * 89)];
    return { x: point.x, z: point.z, phase: random(), speed: 0.07 + random() * 0.07,
      size: 0.018 + random() * 0.035, sway: random() * tau };
  });

  function update(time) {
    const t = Number.isFinite(time) ? time : 0;
    lava.emissiveIntensity = 1.55 + Math.sin(t * 1.1) * 0.12;
    molten.emissiveIntensity = 2.1 + Math.sin(t * 1.7 + 0.6) * 0.14;
    for (let i = 0; i < 12; i++) {
      const age = (i / 12 + t * 0.036) % 1;
      const scale = 0.45 + Math.sin(age * Math.PI) * 1.35;
      dummy.position.set(volcanoX + age * 3.2 + Math.sin(i * 2.4 + t * 0.15) * age * 0.45,
        baseY + 7.95 + age * 7.5, volcanoZ + Math.sin(i * 1.8) * age * 0.75);
      dummy.rotation.set(age * 0.9, i * 1.1 + t * 0.04, age * 0.4);
      dummy.scale.set(scale * 1.3, scale * 0.85, scale);
      dummy.updateMatrix();
      smoke.setMatrixAt(i, dummy.matrix);
    }
    smoke.instanceMatrix.needsUpdate = true;
    emberSeeds.forEach((seed, i) => {
      const age = (seed.phase + t * seed.speed) % 1;
      dummy.position.set(seed.x + Math.sin(t * 0.8 + seed.sway) * age * 0.35,
        kit.height(seed.x, seed.z) + 0.2 + age * 3.1,
        seed.z + Math.cos(t * 0.6 + seed.sway) * age * 0.3);
      dummy.rotation.set(age * 2, age * 3, seed.sway);
      dummy.scale.setScalar(seed.size * Math.sin(Math.PI * age));
      dummy.updateMatrix();
      embers.setMatrixAt(i, dummy.matrix);
    });
    embers.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { group, update };
}
