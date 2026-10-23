/** Sun-warmed meadow, working mill, and a stream along the lower pasture. */
export default function buildBiome({ THREE, kit }) {
  const { group } = kit;
  const random = () => kit.random();
  const between = (a, b) => a + random() * (b - a);
  const streamZ = x => 13.5 + Math.sin(x * 0.12) * 1.8;
  const ground = kit.ground('#ffffff', { segments: 64, roughness: 1 });
  const positions = ground.geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    const bank = Math.abs(z - streamZ(x));
    // A real depression lets the opaque water sit within the rolling ground.
    const channel = Math.max(0, 1 - (bank / 1.9) ** 2);
    positions.setY(i, positions.getY(i) - channel * 0.55);
    const light = 0.5 + Math.sin(x * 0.21 + z * 0.16) * 0.22 + Math.cos(z * 0.38) * 0.13;
    color.set('#648c39').lerp(new THREE.Color('#a7b958'), light);
    if (bank < 2.2) color.lerp(new THREE.Color('#69864c'), 0.38);
    colors.push(color.r, color.g, color.b);
  }
  ground.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  ground.material.vertexColors = true;
  ground.geometry.computeVertexNormals();

  const wood = kit.material('#97704a');
  const paleWood = kit.material('#c39a61');
  const plaster = kit.material('#efdbad', { roughness: 0.95 });
  const stone = kit.material('#a7a38a');
  const roof = kit.material('#89594b');
  const dark = kit.material('#463d31');
  const canvas = kit.material('#f4e1ac', { roughness: 0.92 });
  const iron = kit.material('#4d554b', { roughness: 0.55, metalness: 0.45 });
  const white = kit.material('#ffffff');
  const box = new THREE.BoxGeometry(1, 1, 1);
  const round = new THREE.SphereGeometry(1, 8, 5);
  const pebble = new THREE.IcosahedronGeometry(1, 0);
  const stalk = new THREE.CylinderGeometry(0.7, 1, 1, 4);
  const petal = new THREE.OctahedronGeometry(1, 0);
  const batches = [];
  function batch(geometry, material = white) {
    const entry = { geometry, material, items: [] };
    batches.push(entry);
    return entry;
  }
  const hedges = batch(round);
  const rails = batch(box, paleWood);
  const stems = batch(stalk);
  const petals = batch(petal);
  const hearts = batch(petal);
  const leaves = batch(petal);
  const rocks = batch(pebble);
  const grasses = batch(new THREE.ConeGeometry(0.055, 1, 3));
  const transform = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  function instance(target, position, scale, tint = '#ffffff', rotation = [0, 0, 0]) {
    transform.position.set(...position);
    transform.scale.set(...scale);
    transform.rotation.set(...rotation);
    transform.updateMatrix();
    target.items.push({ matrix: transform.matrix.clone(), tint });
  }
  function beam(target, a, b, width, depth = width, tint = '#ffffff') {
    const delta = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    transform.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    transform.quaternion.setFromUnitVectors(up, delta.clone().normalize());
    transform.scale.set(width, delta.length(), depth);
    transform.updateMatrix();
    target.items.push({ matrix: transform.matrix.clone(), tint });
  }
  function clear(x, z, radius = 0.4) {
    if (Math.abs(x) + radius > 23.8 || Math.abs(z) + radius > 19.8) return false;
    for (let offset = -radius; offset <= radius + 0.01; offset += 0.25) {
      if (Math.abs(z - kit.pathZ(x + offset)) < 1.85 + radius) return false;
    }
    return true;
  }
  const at = (x, z, lift = 0) => [x, kit.height(x, z) + lift, z];

  // The mill's facade and rotor face +z, toward the viewer and the trail.
  const mx = -8, mz = -12.6, my = kit.height(mx, mz);
  kit.mesh(new THREE.CylinderGeometry(1.8, 2.15, 0.65, 16), stone, [mx, my + 0.2, mz]);
  kit.mesh(new THREE.CylinderGeometry(1.25, 1.8, 6.8, 16), plaster, [mx, my + 3.65, mz]);
  kit.mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.22, 16), wood, [mx, my + 1.0, mz]);
  kit.mesh(new THREE.ConeGeometry(2.0, 2.25, 16), roof, [mx, my + 8.1, mz], [1, 1, 1], [0, Math.PI / 16, 0]);
  kit.mesh(box, dark, [mx - 0.5, my + 1.0, mz + 1.7], [0.77, 1.65, 0.16]);
  kit.mesh(box, wood, [mx - 0.5, my + 1.0, mz + 1.81], [0.61, 1.5, 0.08]);
  kit.mesh(new THREE.SphereGeometry(0.055, 6, 4), iron, [mx - 0.3, my + 1.0, mz + 1.88]);
  for (const lift of [3.0, 5.0]) {
    kit.mesh(box, dark, [mx + 0.35, my + lift, mz + (lift === 3 ? 1.55 : 1.39)], [0.58, 0.8, 0.13]);
    kit.mesh(box, paleWood, [mx + 0.35, my + lift, mz + (lift === 3 ? 1.64 : 1.48)], [0.055, 0.81, 0.05]);
  }
  const rotor = new THREE.Group();
  rotor.position.set(mx, my + 6.1, mz + 2.05);
  group.add(rotor);
  function rotorMesh(geometry, material, position, scale) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.castShadow = mesh.receiveShadow = true;
    rotor.add(mesh);
    return mesh;
  }
  for (let blade = 0; blade < 4; blade++) {
    const angle = blade * Math.PI / 2;
    const dx = -Math.sin(angle), dy = Math.cos(angle);
    const arm = rotorMesh(box, wood, [dx * 2.1, dy * 2.1, 0], [0.14, 4.35, 0.16]);
    arm.rotation.z = angle;
    const sail = rotorMesh(box, canvas, [dx * 2.8, dy * 2.8, 0.11], [0.87, 2.35, 0.085]);
    sail.rotation.z = angle;
    for (const t of [1.8, 2.8, 3.8]) {
      const rib = rotorMesh(box, paleWood, [dx * t, dy * t, 0.17], [0.96, 0.065, 0.075]);
      rib.rotation.z = angle;
    }
  }
  rotorMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.55, 12).rotateX(Math.PI / 2), iron, [0, 0, 0.15], [1, 1, 1]);
  rotorMesh(new THREE.SphereGeometry(0.25, 10, 6), wood, [0, 0, 0.48], [1, 1, 0.65]);

  // Clipped hedgerows define old field strips behind the open meadow.
  for (const rowZ of [-8.5, -12.7, -17]) {
    for (let x = 1.5; x <= 21; x += 1.12) {
      const z = rowZ + Math.sin(x * 0.17) * 0.28;
      if (!clear(x, z, 0.88)) continue;
      instance(hedges, at(x, z, 0.54), [0.78, between(0.6, 0.85), 0.62],
        ['#567a37', '#668c3c', '#759447'][Math.floor(random() * 3)]);
    }
  }
  for (let x = 1.5; x < 21; x += 2.4) {
    for (let z = -15.3; z < -9.5; z += 4.2) {
      for (let tuft = 0; tuft < 4; tuft++) {
        const px = x + tuft * 0.35;
        instance(grasses, at(px, z, 0.4), [1.6, 0.8, 1.6], '#c4bd65', [0.1, 0, -0.12]);
      }
    }
  }

  // The two rails track the route's bends at a generous foreground offset.
  let previous;
  for (let x = -22; x <= 22; x += 2.75) {
    const z = kit.pathZ(x) + 4.1;
    const y = kit.height(x, z);
    instance(rails, [x, y + 0.71, z], [0.2, 1.52, 0.22]);
    instance(rails, [x, y + 1.5, z], [0.27, 0.1, 0.28]);
    if (previous) {
      for (const lift of [0.58, 1.15]) {
        beam(rails, [previous.x, previous.y + lift, previous.z], [x, y + lift, z], 0.12, 0.15);
      }
    }
    previous = { x, y, z };
  }

  const waterPositions = [], waterIndices = [];
  const streamSegments = 96;
  for (let i = 0; i <= streamSegments; i++) {
    const x = -24 + i / streamSegments * 48;
    const z = streamZ(x);
    for (const side of [-1, 1]) {
      const edge = z + side * (0.73 + Math.sin(x * 0.7) * 0.1);
      waterPositions.push(x, kit.height(x, edge) - 0.14, edge);
    }
    if (i < streamSegments) {
      const a = i * 2;
      waterIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const waterGeometry = new THREE.BufferGeometry();
  waterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
  waterGeometry.setIndex(waterIndices);
  waterGeometry.computeVertexNormals();
  const water = kit.mesh(waterGeometry, kit.material('#659f9a', { roughness: 0.28, metalness: 0.08 }));
  water.castShadow = false;
  const ripples = batch(box, kit.material('#b9d9bb', { roughness: 0.35 }));
  for (let i = 0; i < 48; i++) {
    const x = between(-22.5, 22.5), z = streamZ(x);
    const side = i % 2 ? -1 : 1;
    const bankZ = z + side * between(1.25, 1.85);
    instance(rocks, at(x, bankZ, -0.05), [between(0.22, 0.48), 0.19, 0.3], '#a6a78b', [0, random() * 6, 0]);
    if (i % 3 === 0) {
      instance(ripples, [x, kit.height(x, z) - 0.105, z], [0.3, 0.018, 0.07], '#ffffff', [0, -0.25, 0]);
    }
    for (let reed = 0; reed < 3; reed++) {
      instance(grasses, at(x + reed * 0.1, bankZ, 0.4), [1.6, between(0.65, 1.05), 1.6], '#6a873f', [0.12, reed, 0.16]);
    }
  }

  // Low, solid petals and stems read as wildflowers from the moving camera.
  const flowerColors = ['#f8e6b6', '#e4bb4e', '#b08bc4', '#d9806c', '#f5f0d5'];
  for (let i = 0; i < 270; i++) {
    const x = between(-22.8, 22.8), z = between(-18.5, 18.5);
    if (!clear(x, z, 0.4) || Math.abs(z - streamZ(x)) < 2.25) continue;
    if (Math.hypot(x - mx, z - mz) < 3) continue;
    // Leave the clipped fields legible; flowers collect along their verges.
    if (x > 0 && z < -7 && i % 3 !== 0) continue;
    const h = between(0.32, 0.72), y = kit.height(x, z);
    instance(stems, [x, y + h / 2, z], [0.035, h, 0.035], '#587641');
    instance(leaves, [x + 0.08, y + h * 0.4, z], [0.17, 0.045, 0.075], '#6e9149', [0, i, 0.4]);
    const tint = flowerColors[i % flowerColors.length];
    for (let p = 0; p < 5; p++) {
      const angle = p * Math.PI * 2 / 5;
      instance(petals, [x + Math.cos(angle) * 0.12, y + h, z + Math.sin(angle) * 0.12],
        [0.13, 0.055, 0.09], tint, [0.12, -angle, 0]);
    }
    instance(hearts, [x, y + h + 0.045, z], [0.075, 0.065, 0.075], '#bd8a32');
  }

  // A few harvested rolls and their spiral end grain give the pasture a use.
  for (const [x, z, yaw] of [[-17, 7.7, 0.2], [-15.2, 8.4, -0.15], [17.5, 7.5, 0.35]]) {
    const y = kit.height(x, z);
    kit.mesh(new THREE.CylinderGeometry(0.83, 0.83, 1.55, 12).rotateX(Math.PI / 2), kit.material('#cfac5d'),
      [x, y + 0.78, z], [1, 1, 1], [0, yaw, 0]);
    for (const radius of [0.25, 0.5, 0.7]) {
      kit.mesh(new THREE.TorusGeometry(radius, 0.025, 4, 16), paleWood,
        [x + Math.sin(yaw) * 0.79, y + 0.78, z + Math.cos(yaw) * 0.79], [1, 1, 1], [0, yaw, 0]);
    }
  }
  for (const { geometry, material, items } of batches) {
    if (!items.length) continue;
    const mesh = new THREE.InstancedMesh(geometry, material, items.length);
    items.forEach(({ matrix, tint }, i) => {
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color(tint));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }

  return {
    group,
    update(time, _dt) {
      rotor.rotation.z = time * 0.34 + 0.2;
      water.material.roughness = 0.29 + Math.sin(time * 0.75) * 0.035;
    },
  };
}
