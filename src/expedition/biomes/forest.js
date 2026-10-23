// All coordinates are local; the expedition positions the completed biome.
export default function buildBiome({ THREE, kit }) {
  const { group } = kit;
  const random = () => kit.random();
  const between = (a, b) => a + (b - a) * random();
  const ground = kit.ground('#40533a', { roughness: 1, segments: 56 });
  ground.receiveShadow = true;

  const bark = kit.material('#ffffff', { roughness: 0.98 });
  const foliage = kit.material('#ffffff', { roughness: 0.86 });
  const moss = kit.material('#ffffff', { roughness: 1 });
  const leafMaterial = kit.material('#ffffff', { roughness: 0.9 });
  const wood = kit.material('#d3ac73', { roughness: 0.94 });
  const rope = kit.material('#aa9163', { roughness: 1 });
  const bronze = kit.material('#a88b4b', { roughness: 0.48, metalness: 0.65 });

  // Shared, genuinely volumetric geometry keeps the woodland inexpensive.
  const cylinder = new THREE.CylinderGeometry(0.7, 1, 1, 8);
  const round = new THREE.SphereGeometry(1, 12, 8);
  const smallRound = new THREE.SphereGeometry(1, 8, 6);
  const smallSpot = new THREE.SphereGeometry(1, 6, 4);
  const pebble = new THREE.DodecahedronGeometry(1, 0);
  const cap = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  const disc = new THREE.CylinderGeometry(1, 1, 1, 10);
  const stem = new THREE.CylinderGeometry(0.7, 1, 1, 3, 1, true);
  const leaf = new THREE.BufferGeometry();
  // A folded, closed leaf rather than a camera-facing card.
  leaf.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, -0.36, 0.05, 0.45, 0, 0.18, 0.55,
    -0.36, 0.05, 0.45, 0, 0.02, 1, 0, 0.18, 0.55,
    0, 0, 0, 0, 0.18, 0.55, 0.36, 0.05, 0.45,
    0.36, 0.05, 0.45, 0, 0.18, 0.55, 0, 0.02, 1,
    0, 0, 0, 0, -0.035, 0.5, -0.36, 0.05, 0.45,
    -0.36, 0.05, 0.45, 0, -0.035, 0.5, 0, 0.02, 1,
    0, 0, 0, 0.36, 0.05, 0.45, 0, -0.035, 0.5,
    0.36, 0.05, 0.45, 0, 0.02, 1, 0, -0.035, 0.5,
  ], 3));
  leaf.computeVertexNormals();

  const batches = [];
  const batch = (geometry, material) => {
    const result = { geometry, material, instances: [] };
    batches.push(result);
    return result;
  };
  const trunks = batch(cylinder, bark);
  const crowns = batch(round, foliage);
  const mosses = batch(smallRound, moss);
  const stones = batch(pebble, moss);
  const fernLeaves = batch(leaf, leafMaterial);
  const fernStems = batch(stem, moss);
  const mushroomCaps = batch(cap, leafMaterial);
  const mushroomStems = batch(stem, wood);
  const mushroomGills = batch(disc, wood);
  const mushroomSpots = batch(smallSpot, wood);
  const logEnds = batch(disc, wood);
  const heartwood = batch(disc, bark);
  const litter = batch(leaf, leafMaterial);
  const transform = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  const rotation = new THREE.Quaternion();

  function instance(target, position, scale, color, angles = [0, 0, 0]) {
    transform.position.set(...position);
    transform.scale.set(...scale);
    transform.rotation.set(...angles);
    transform.updateMatrix();
    target.instances.push({ matrix: transform.matrix.clone(), color });
  }

  function segment(target, from, to, radius, color, width = 1) {
    direction.set(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    const length = direction.length();
    rotation.setFromUnitVectors(up, direction.normalize());
    transform.position.set(
      (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2,
    );
    transform.quaternion.copy(rotation);
    transform.scale.set(radius, length, radius * width);
    transform.updateMatrix();
    target.instances.push({ matrix: transform.matrix.clone(), color });
  }

  // Sample the whole footprint, including bends, so roots and low foliage
  // cannot spill into the parent's walking corridor.
  function besideTrail(x, z, radius) {
    if (Math.abs(x) + radius > 23.8 || Math.abs(z) + radius > 19.6) return false;
    for (let sample = -radius; sample <= radius + 0.01; sample += 0.3) {
      if (Math.abs(z - kit.pathZ(x + sample)) < radius + 2.05) return false;
    }
    return true;
  }

  const canopyColors = ['#2e5944', '#37664b', '#47764c', '#578449', '#71964f'];
  const barkColors = ['#634735', '#73503b', '#805b40'];
  const treeBases = [];

  function tree(x, z, height, radius, lean) {
    if (!besideTrail(x, z, radius * 1.43 + Math.abs(lean))) return;
    const y = kit.height(x, z) - 0.08;
    const trunkRadius = height * 0.064;
    const tint = barkColors[Math.floor(random() * barkColors.length)];
    const fork = [x + lean, y + height * 0.64, z + 0.13];
    segment(trunks, [x, y, z], fork, trunkRadius, tint);
    segment(trunks, fork, [x + lean * 1.3, y + height, z], trunkRadius * 0.65, tint);
    treeBases.push([x, z, trunkRadius]);

    for (let root = 0; root < 3; root++) {
      const angle = root * Math.PI * 2 / 3 + random() * 0.6;
      const rx = x + Math.cos(angle) * trunkRadius * 2.4;
      const rz = z + Math.sin(angle) * trunkRadius * 2.4;
      segment(trunks, [rx, kit.height(rx, rz) + 0.05, rz],
        [x, y + 0.8, z], trunkRadius * 0.46, tint, 0.8);
    }
    for (let branch = 0; branch < 3; branch++) {
      const angle = branch * Math.PI * 2 / 3 + 0.4;
      const dx = Math.cos(angle) * radius * 0.67;
      const dz = Math.sin(angle) * radius * 0.65;
      segment(trunks, [x + lean * 0.7, y + height * (0.53 + branch * 0.08), z],
        [x + lean + dx, y + height * 0.91, z + dz], trunkRadius * 0.42, tint);
      instance(crowns, [x + lean + dx, y + height * 0.98, z + dz],
        [radius * 0.72, radius * between(0.6, 0.79), radius * 0.69],
        canopyColors[(branch + Math.floor(random() * 3)) % canopyColors.length],
        [between(-0.1, 0.1), angle, between(-0.12, 0.12)]);
    }
    instance(crowns, [x + lean, y + height * 1.12, z - 0.15],
      [radius * 0.78, radius * 0.69, radius * 0.77], canopyColors[3]);
    instance(crowns, [x + lean - radius * 0.25, y + height * 1.29, z - 0.1],
      [radius * 0.54, radius * 0.47, radius * 0.54], canopyColors[4]);
    instance(mosses, [x - trunkRadius * 0.35, y + 0.15, z + trunkRadius * 0.3],
      [trunkRadius * 1.45, 0.22, trunkRadius * 1.2], '#627d3e');
  }

  // Uneven groves, with a sunlit break at the center and open sight lines
  // through the nearer trees. Crowns are deliberately lifted above the fork.
  const trees = [
    [-19.2, -11.8, 9.7, 2.7, 0.35], [-13.5, -14, 11.6, 3.15, -0.3],
    [-6.7, -12.8, 10.3, 2.9, 0.3], [1.2, -14.7, 12.4, 3.4, -0.25],
    [9.1, -13.4, 11, 3, 0.35], [17.7, -13.5, 11.9, 3.35, -0.35],
    [-17, -8.5, 8.2, 2.55, 0.25], [-8.8, -8.3, 9.5, 2.9, -0.3],
    [7.5, -8.5, 8.7, 2.75, 0.2], [18, -8.3, 9.3, 2.7, -0.25],
    [-19.1, 9.5, 8.6, 2.75, 0.25], [-11.5, 11.3, 10.4, 3.1, -0.3],
    [-2.5, 13.6, 8.7, 2.8, 0.3], [8.2, 11.8, 9.5, 2.9, -0.3],
    [18.5, 10, 10.7, 3.1, 0.2],
  ];
  for (const [x, offset, h, r, lean] of trees) {
    const margin = r * 1.43 + Math.abs(lean) + 0.1;
    const z = THREE.MathUtils.clamp(kit.pathZ(x) + offset, -19.6 + margin, 19.6 - margin);
    tree(x, z, h, r, lean);
  }

  function fern(x, z, size) {
    if (!besideTrail(x, z, size * 1.2)) return;
    const y = kit.height(x, z) + 0.03;
    for (let frond = 0; frond < 5; frond++) {
      const angle = frond * Math.PI * 2 / 5 + random() * 0.35;
      const dx = Math.sin(angle);
      const dz = Math.cos(angle);
      const elbow = [x + dx * size * 0.46, y + size * 0.8, z + dz * size * 0.46];
      const tip = [x + dx * size, y + size * 0.45, z + dz * size];
      segment(fernStems, [x, y, z], elbow, 0.025 * size, '#697b35');
      segment(fernStems, elbow, tip, 0.018 * size, '#697b35');
      for (let pair = 0; pair < 3; pair++) {
        const progress = 0.24 + pair * 0.25;
        const distance = progress * size;
        const lift = Math.sin(progress * Math.PI * 0.86) * size * 0.75;
        const length = size * (0.36 - pair * 0.075);
        for (const side of [-1, 1]) {
          instance(fernLeaves, [x + dx * distance, y + lift, z + dz * distance],
            [length * 0.82, length, length], pair % 2 ? '#76a755' : '#4f8b4b',
            [-0.17, angle + side * 1.05, side * 0.13]);
        }
      }
    }
  }

  // Localized colonies make the understorey read as an ecosystem, rather
  // than identical objects scattered across a grid.
  const colonies = [
    [-19, 5.4], [-13.5, -4.4], [-7.5, 5.3], [0.3, -6.2],
    [5.3, 5.1], [13.8, -4.8], [19.8, 5.5], [-4.5, -10.1],
  ];
  for (const [cx, offset] of colonies) {
    for (let plant = 0; plant < 3; plant++) {
      const x = cx + between(-1.1, 1.1);
      fern(x, kit.pathZ(x) + offset + between(-0.7, 0.7), between(0.65, 1.05));
    }
  }

  function mushrooms(x, z, count) {
    for (let i = 0; i < count; i++) {
      const mx = x + between(-1, 1);
      const mz = z + between(-0.7, 0.7);
      const size = between(0.18, 0.38);
      if (!besideTrail(mx, mz, size * 1.2)) continue;
      const y = kit.height(mx, mz);
      const stalkHeight = size * between(1.4, 2);
      instance(mushroomStems, [mx, y + stalkHeight / 2, mz],
        [size * 0.19, stalkHeight, size * 0.19], '#e4d1a3');
      instance(mushroomCaps, [mx, y + stalkHeight, mz], [size, size * 0.65, size],
        i % 3 === 0 ? '#dba451' : '#b85c39');
      instance(mushroomGills, [mx, y + stalkHeight - 0.018, mz],
        [size * 0.9, 0.035, size * 0.9], '#e7cf9b');
      for (let spot = 0; spot < 2; spot++) {
        const angle = spot * 2.5 + i;
        instance(mushroomSpots, [mx + Math.cos(angle) * size * 0.45,
          y + stalkHeight + size * 0.58, mz + Math.sin(angle) * size * 0.45],
        [size * 0.12, size * 0.035, size * 0.1], '#f4ddb2');
      }
    }
  }

  function fallenLog(x, offset, length, yaw, radius) {
    const z = kit.pathZ(x) + offset;
    const dx = Math.cos(yaw) * length / 2;
    const dz = Math.sin(yaw) * length / 2;
    if (!besideTrail(x, z, length / 2 + radius)) return;
    const from = [x - dx, kit.height(x - dx, z - dz) + radius * 0.8, z - dz];
    const to = [x + dx, kit.height(x + dx, z + dz) + radius * 0.8, z + dz];
    segment(trunks, from, to, radius, '#73523a');
    // Pale end grain and nested heartwood are solids; no drawn outlines.
    const axis = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
    for (const [end, sign] of [[from, -1], [to, 1]]) {
      const outer = end.map((value, component) => value + axis.getComponent(component) * sign * 0.025);
      const inner = end.map((value, component) => value + axis.getComponent(component) * sign * 0.052);
      segment(logEnds, outer, inner, radius * (sign < 0 ? 0.92 : 0.64), '#d2ab75');
      segment(heartwood, inner, inner.map((value, component) =>
        value + axis.getComponent(component) * sign * 0.013), radius * 0.36, '#ab7c4e');
    }
    for (let patch = 0; patch < 6; patch++) {
      const t = 0.12 + patch * 0.14;
      instance(mosses, [from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t + radius * 0.72,
        from[2] + (to[2] - from[2]) * t - radius * 0.12],
      [0.6, 0.16, radius * 0.67], patch % 2 ? '#79944c' : '#5b793e', [0, -yaw, 0]);
    }
    const branchStart = [x + 0.2, (from[1] + to[1]) / 2 + radius * 0.4, z];
    segment(trunks, branchStart,
      [x + 0.6, branchStart[1] + radius * 1.5, z + 0.6], radius * 0.27, '#73523a');
    mushrooms(x - dx * 0.6, z - dz * 0.6 + radius + 0.45, 5);
  }
  fallenLog(-3.5, -7.8, 6.7, -0.2, 0.68);
  fallenLog(12.8, 8.2, 4.9, 0.42, 0.53);
  mushrooms(-13, kit.pathZ(-13) + 4.1, 5);
  mushrooms(9, kit.pathZ(9) - 4, 6);

  for (let i = 0; i < 58; i++) {
    const x = between(-22.5, 22.5);
    const z = kit.pathZ(x) + (random() < 0.5 ? -1 : 1) * between(3.3, 15);
    const radius = between(0.24, 0.68);
    if (!besideTrail(x, z, radius)) continue;
    instance(i % 3 === 0 ? stones : mosses,
      [x, kit.height(x, z) + radius * 0.18, z],
      [radius * 1.4, radius * 0.55, radius], i % 3 === 0 ? '#64715b' : '#647d42',
      [0, between(0, Math.PI), between(-0.12, 0.12)]);
  }
  for (let i = 0; i < 85; i++) {
    const x = between(-23, 23);
    const z = kit.pathZ(x) + (random() < 0.5 ? -1 : 1) * between(2.6, 11);
    if (!besideTrail(x, z, 0.3)) continue;
    instance(litter, [x, kit.height(x, z) + 0.035, z],
      [between(0.16, 0.28), 0.25, between(0.2, 0.4)],
      ['#a58d43', '#9a6a38', '#6a7b3d'][i % 3], [0, between(0, Math.PI * 2), 0]);
  }

  // A little forester's chime hangs from its own crooked branch in a clearing.
  // Its entire silhouette stays beside the route, including maximum swing.
  const chimes = [];
  const chimeX = 2.4;
  const chimeZ = kit.pathZ(chimeX) + 5.9;
  if (besideTrail(chimeX, chimeZ, 1.8)) {
    const y = kit.height(chimeX, chimeZ);
    segment(trunks, [chimeX - 1.4, y, chimeZ + 0.5],
      [chimeX - 1.05, y + 4.3, chimeZ + 0.3], 0.23, '#775338');
    segment(trunks, [chimeX - 1.1, y + 4, chimeZ + 0.3],
      [chimeX + 0.7, y + 4.5, chimeZ], 0.12, '#775338');
    const hanger = new THREE.Group();
    hanger.position.set(chimeX, y + 4.3, chimeZ + 0.12);
    group.add(hanger);
    function hangingPiece(geometry, material, position, scale) {
      const piece = new THREE.Mesh(geometry, material);
      piece.position.set(...position);
      piece.scale.set(...scale);
      piece.castShadow = true;
      piece.receiveShadow = true;
      hanger.add(piece);
      return piece;
    }
    hangingPiece(stem, rope, [0, -0.43, 0], [0.035, 0.86, 0.035]);
    hangingPiece(disc, wood, [0, -0.9, 0], [0.55, 0.1, 0.42]);
    for (let tube = 0; tube < 4; tube++) {
      const x = (tube - 1.5) * 0.26;
      const length = 0.62 + (tube % 3) * 0.16;
      hangingPiece(stem, rope, [x, -1.13, 0], [0.014, 0.4, 0.014]);
      hangingPiece(new THREE.CylinderGeometry(0.055, 0.055, length, 8, 1, true),
        bronze, [x, -1.32 - length / 2, 0], [1, 1, 1]);
    }
    hangingPiece(stem, rope, [0, -1.71, 0.16], [0.014, 1.55, 0.014]);
    const sail = hangingPiece(new THREE.BoxGeometry(0.27, 0.48, 0.065), wood,
      [0, -2.5, 0.16], [1, 1, 1]);
    sail.rotation.z = -0.14;
    chimes.push(hanger);
    fern(chimeX - 1.4, chimeZ + 0.8, 0.85);
  }

  // Extra ferns cluster around the shaded roots of the rear grove.
  for (const [x, z] of treeBases.slice(0, 6)) {
    fern(x + 1.1, z + 0.85, 0.8);
  }
  for (const { geometry, material, instances } of batches) {
    if (instances.length === 0) continue;
    const mesh = new THREE.InstancedMesh(geometry, material, instances.length);
    for (let i = 0; i < instances.length; i++) {
      mesh.setMatrixAt(i, instances[i].matrix);
      mesh.setColorAt(i, new THREE.Color(instances[i].color));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }

  return {
    group,
    update(time) {
      for (const chime of chimes) {
        chime.rotation.z = Math.sin(time * 1.15) * 0.025;
        chime.rotation.x = Math.sin(time * 0.8 + 0.6) * 0.018;
      }
    },
  };
}
