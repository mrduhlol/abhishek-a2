// Ocean biome — coastline traversed on a boardwalk beside a turquoise sea.
// Land corridor with sand dunes, a wooden pier, a moored dinghy, a working
// lighthouse, sea stacks and animated foam. Character stays on land.

export default function buildBiome({ THREE, kit }) {
  const group = kit.group;
  const H = (x, z) => kit.height(x, z);
  const P = (x) => kit.pathZ(x);

  // Waterline reference height for a column: just below the beach edge.
  const wyAt = (x) =>
    Math.min(H(x, P(x) - 2.5) - 0.5, H(x, P(x) - 7) - 0.1);

  const ownGeos = [];
  const ownMats = [];
  const G = (g) => (ownGeos.push(g), g);
  const M = (m) => (ownMats.push(m), m);

  // Reusable update temporaries.
  const m4 = new THREE.Matrix4();
  const q0 = new THREE.Quaternion();
  const e0 = new THREE.Euler();
  const v3 = new THREE.Vector3();
  const sc3 = new THREE.Vector3();

  // ---------------------------------------------------------------- palette
  const cSand = '#e8d3a2';
  const cWood = '#a97a4e';
  const cWoodDark = '#8a5f3b';
  const cRock = '#8d8577';
  const cTrunk = '#9a6b45';
  const cFrond = '#4fa86a';
  const cGrass = '#6fae5c';
  const cWhite = '#f5f2ea';
  const cRed = '#d8503f';
  const cLamp = '#ffd98a';

  // Base terrain ground (kit-owned surface, follows global height).
  kit.ground(cSand, { roughness: 1 });

  // ------------------------------------------------------------- materials
  const matWater = M(kit.material('#ffffff'));
  matWater.roughness = 0.14;
  matWater.metalness = 0.05;
  matWater.transparent = true;
  matWater.opacity = 0.8;
  matWater.vertexColors = true;

  const matSandStrip = M(kit.material('#ffffff'));
  matSandStrip.roughness = 1;
  matSandStrip.vertexColors = true;

  const matWood = M(kit.material(cWood, { roughness: 0.9 }));
  const matWoodDark = M(kit.material(cWoodDark, { roughness: 0.9 }));
  const matRock = M(kit.material(cRock, { roughness: 1 }));
  const matTrunk = M(kit.material(cTrunk, { roughness: 1 }));
  const matFrond = M(kit.material(cFrond, { roughness: 0.9 }));
  matFrond.side = THREE.DoubleSide;
  const matGrass = M(kit.material(cGrass, { roughness: 1 }));
  const matWhite = M(kit.material(cWhite, { roughness: 0.8 }));
  const matRed = M(kit.material(cRed, { roughness: 0.7 }));
  const matFoam = M(kit.material('#eef9f6', { roughness: 0.6 }));
  matFoam.transparent = true;
  matFoam.opacity = 0.55;
  const matHull = M(kit.material('#c4523d', { roughness: 0.7 }));
  const matHullIn = M(kit.material('#e0d7c4', { roughness: 1 }));
  const matStar = M(kit.material('#e2685f', { roughness: 1 }));
  const matDrift = M(kit.material('#c9b791', { roughness: 1 }));

  const matLamp = M(kit.material(cLamp));
  if (matLamp.emissive) {
    matLamp.emissive = new THREE.Color('#ffcf6e');
    matLamp.emissiveIntensity = 1.4;
  }
  const matGlass = M(kit.material('#cfe8ea'));
  matGlass.transparent = true;
  matGlass.opacity = 0.35;
  const matBeam = M(kit.material(cLamp));
  matBeam.transparent = true;
  matBeam.opacity = 0.16;
  if (matBeam.emissive) {
    matBeam.emissive = new THREE.Color('#ffe9a8');
    matBeam.emissiveIntensity = 0.9;
  }
  matBeam.depthWrite = false;
  matBeam.side = THREE.DoubleSide;

  // ------------------------------------------------------- strip mesh helper
  // Builds a ribbon that follows the trail contour: cols across x, rows as
  // z-offsets relative to kit.pathZ(x), per-vertex colour stops land->sea.
  function buildStrip(rows, cols, colorStops, yFn, material) {
    const positions = [];
    const colors = [];
    const indices = [];
    const cA = new THREE.Color(colorStops[0][0]);
    const cB = new THREE.Color(colorStops[0][1]);
    for (let i = 0; i <= cols; i++) {
      const x = -25 + (50 * i) / cols;
      for (let j = 0; j < rows.length; j++) {
        const off = rows[j];
        const y = yFn(x, off, j);
        positions.push(x, y, P(x) + off);
        const t = j / (rows.length - 1);
        // Pick the two stops this row sits between.
        let seg = colorStops.length - 1;
        for (let s = 0; s < colorStops.length - 1; s++) {
          if (t <= colorStops[s + 1][0]) { seg = s; break; }
        }
        const span = colorStops[seg + 1][0] - colorStops[seg][0];
        const f = Math.min(1, Math.max(0, (t - colorStops[seg][0]) / (span || 1)));
        cA.set(colorStops[seg][1]);
        cB.set(colorStops[seg + 1][1]);
        const c = cA.clone().lerp(cB, f);
        colors.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows.length - 1; j++) {
        const a = i * rows.length + j;
        const b = (i + 1) * rows.length + j;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geo = G(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return kit.mesh(geo, material, [0, 0, 0]);
  }

  // Sandy beach strip: corridor + dune edge on land, wet sand at the sea side.
  const sandRows = [4, 2.2, 1.1, 0, -1.1, -1.9, -2.35];
  const sandLift = [0.03, 0.09, 0.11, 0.11, 0.11, 0.07, 0.04];
  buildStrip(
    sandRows,
    52,
    [[0, '#e6cf9c'], [0.6, '#e8d3a2'], [0.82, '#cfae7d'], [1, '#b2916a']],
    (x, off, j) => H(x, P(x) + off) + sandLift[j],
    matSandStrip
  );

  // Water sheet following the shoreline, turquoise -> deep teal offshore.
  const waterRows = [-2.5, -4.5, -7, -10.5, -14.5, -19];
  const waterMesh = buildStrip(
    waterRows,
    56,
    [[0, '#49d1be'], [0.35, '#2ab5a6'], [0.7, '#12929a'], [1, '#0b6f86']],
    (x, off, j) => wyAt(x) - 0.05 * j,
    matWater
  );
  waterMesh.castShadow = false;

  // Store base positions for the update ripple.
  const wPos = waterMesh.geometry.attributes.position;
  const wCount = wPos.count;
  const wBase = new Float32Array(wCount);
  const wPh = new Float32Array(wCount);
  for (let i = 0; i < wCount; i++) {
    wBase[i] = wPos.getY(i);
    const rowJ = i % waterRows.length;
    wPh[i] = waterRows[rowJ];
  }
  const wxs = new Float32Array(wCount);
  const wzs = new Float32Array(wCount);
  for (let i = 0; i < wCount; i++) {
    wxs[i] = wPos.getX(i);
    wzs[i] = wPos.getZ(i);
  }

  // ------------------------------------------------------------ boardwalk
  // Route surface: planks laid along the corridor with a sea-side railing.
  const plankGeo = G(new THREE.BoxGeometry(0.72, 0.12, 2.4));
  const plankCount = 58;
  const planks = G(new THREE.InstancedMesh(plankGeo, matWood, plankCount));
  const postGeo = G(new THREE.CylinderGeometry(0.05, 0.06, 0.62, 6));
  const railPostCount = 32;
  const railPosts = G(new THREE.InstancedMesh(postGeo, matWoodDark, railPostCount));
  const railSegGeo = G(new THREE.BoxGeometry(3.05, 0.08, 0.09));
  const railSegCount = 16;
  const railSegs = G(new THREE.InstancedMesh(railSegGeo, matWoodDark, railSegCount));
  planks.castShadow = true;
  planks.receiveShadow = true;
  railPosts.castShadow = true;
  railSegs.castShadow = true;
  group.add(planks, railPosts, railSegs);

  const dummy = new THREE.Object3D();
  let pi = 0;
  for (let i = 0; i < plankCount; i++) {
    const x = -23.2 + (46.4 * i) / (plankCount - 1);
    const pz = P(x);
    const y = H(x, pz) + 0.07;
    const slopeZ = (H(x, pz - 1.1) - H(x, pz + 1.1)) / 2.2;
    dummy.position.set(x, y, pz);
    dummy.rotation.set(Math.atan(slopeZ), 0, 0);
    dummy.updateMatrix();
    planks.setMatrixAt(pi++, dummy.matrix);
  }
  let qi = 0;
  for (let i = 0; i < railPostCount; i++) {
    const x = -23.2 + (46.4 * i) / (railPostCount - 1);
    const pz = P(x) - 1.72;
    const y = H(x, pz) + 0.62;
    dummy.position.set(x, y, pz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    railPosts.setMatrixAt(qi++, dummy.matrix);
  }
  let ri = 0;
  for (let i = 0; i < railSegCount; i++) {
    const x = -23.2 + (46.4 * i) / (railSegCount - 1);
    const pz = P(x) - 1.72;
    const y = H(x, pz) + 0.9;
    const slopeX = (H(x + 1.5, pz) - H(x - 1.5, pz)) / 3;
    dummy.position.set(x, y, pz);
    dummy.rotation.set(0, 0, Math.atan(slopeX));
    dummy.updateMatrix();
    railSegs.setMatrixAt(ri++, dummy.matrix);
  }
  planks.instanceMatrix.needsUpdate = true;
  railPosts.instanceMatrix.needsUpdate = true;
  railSegs.instanceMatrix.needsUpdate = true;

  // ------------------------------------------------------------------ pier
  const pierX = 7;
  const pierShore = P(pierX) - 2.4;
  const pierY = H(pierX, pierShore) + 0.55;
  const pierLen = 8.6;
  const pierEnd = pierShore - pierLen;

  const pierPlankGeo = G(new THREE.BoxGeometry(1.9, 0.12, 0.6));
  const pierPlankCount = 15;
  const pierPlanks = G(new THREE.InstancedMesh(pierPlankGeo, matWood, pierPlankCount));
  pierPlanks.castShadow = true;
  pierPlanks.receiveShadow = true;
  group.add(pierPlanks);
  for (let i = 0; i < pierPlankCount; i++) {
    dummy.position.set(pierX, pierY, pierShore - 0.3 - i * ((pierLen - 0.9) / (pierPlankCount - 1)));
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    pierPlanks.setMatrixAt(i, dummy.matrix);
  }
  pierPlanks.instanceMatrix.needsUpdate = true;

  const pierPostGeo = G(new THREE.CylinderGeometry(0.1, 0.12, 1, 7));
  const pierPostCount = 12;
  const pierPosts = G(new THREE.InstancedMesh(pierPostGeo, matWoodDark, pierPostCount));
  pierPosts.castShadow = true;
  group.add(pierPosts);
  const seaH = wyAt(pierX) - 0.35;
  let wi = 0;
  for (let k = 0; k < 6; k++) {
    const z = pierShore - 1.4 - k * ((pierLen - 1.8) / 5);
    const len = Math.max(0.5, pierY - seaH);
    dummy.position.set(pierX - 0.85, pierY - len / 2, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, len, 1);
    dummy.updateMatrix();
    pierPosts.setMatrixAt(wi++, dummy.matrix);
    dummy.position.x = pierX + 0.85;
    dummy.updateMatrix();
    pierPosts.setMatrixAt(wi++, dummy.matrix);
    dummy.scale.set(1, 1, 1);
  }
  pierPosts.instanceMatrix.needsUpdate = true;

  // Life ring at the pier end.
  const ringGeo = G(new THREE.TorusGeometry(0.24, 0.08, 7, 14));
  kit.mesh(ringGeo, matRed, [pierX + 0.85, pierY + 0.35, pierEnd + 0.9], [1, 1, 1], [0, 0, Math.PI / 2]);

  // ----------------------------------------------------------------- dinghy
  const dinghy = new THREE.Group();
  group.add(dinghy);
  const dingX = 9.4;
  const dingZ = P(dingX) - 7.2;
  dinghy.position.set(dingX, wyAt(dingX) + 0.16, dingZ);
  dinghy.rotation.y = 0.6;

  const part = (geo, mat, pos, rot = [0, 0, 0], scale = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    dinghy.add(m);
    return m;
  };
  const hullGeo = G(new THREE.BoxGeometry(1.7, 0.5, 0.8));
  part(hullGeo, matHull, [0, 0, 0]);
  const bowGeo = G(new THREE.ConeGeometry(0.4, 0.7, 4));
  part(bowGeo, matHull, [1.05, -0.02, 0], [0, -Math.PI / 2, Math.PI / 2]);
  const sternGeo = G(new THREE.BoxGeometry(0.14, 0.45, 0.74));
  part(sternGeo, matHull, [-0.86, 0.05, 0]);
  const inGeo = G(new THREE.BoxGeometry(1.35, 0.1, 0.5));
  part(inGeo, matHullIn, [-0.1, 0.2, 0]);
  const seatGeo = G(new THREE.BoxGeometry(0.2, 0.06, 0.52));
  part(seatGeo, matHullIn, [-0.35, 0.26, 0]);
  const oarGeo = G(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 5));
  part(oarGeo, matDrift, [-0.5, 0.3, 0.55], [0, 0.4, 0.5]);
  part(oarGeo, matDrift, [-0.5, 0.3, -0.55], [0, -0.4, 0.5]);

  // ---------------------------------------------------------- lighthouse
  const lightX = -14;
  const lightZ = P(lightX) + 8.5;
  const lightY = H(lightX, lightZ) + 0.15;
  const lightHouse = new THREE.Group();
  lightHouse.position.set(lightX, lightY, lightZ);
  group.add(lightHouse);

  const cyl = (rTop, rBot, h, mat, y, seg = 20) => {
    const g = G(new THREE.CylinderGeometry(rTop, rBot, h, seg));
    const m = new THREE.Mesh(g, mat);
    m.position.y = y;
    m.castShadow = true;
    m.receiveShadow = true;
    lightHouse.add(m);
    return m;
  };
  cyl(1.05, 1.25, 0.5, matRock, 0.25);            // stone base
  cyl(0.72, 0.95, 1.1, matWhite, 1.05);           // white band 1
  cyl(0.62, 0.72, 1.1, matRed, 2.15);             // red band
  cyl(0.55, 0.62, 1.1, matWhite, 3.25);           // white band 2
  cyl(0.52, 0.55, 0.35, matRock, 4.0);            // gallery deck
  cyl(0.6, 0.6, 0.16, matWoodDark, 4.3, 24);      // gallery rail pad
  cyl(0.5, 0.5, 0.6, matGlass, 4.75, 14);         // lamp room glass
  cyl(0.62, 0.5, 0.28, matRed, 5.2);              // lamp cap
  const doorGeo = G(new THREE.BoxGeometry(0.42, 0.6, 0.16));
  const door = new THREE.Mesh(doorGeo, matWoodDark);
  door.position.set(0, 0.55, 1.05);
  door.castShadow = true;
  lightHouse.add(door);

  const beam = new THREE.Group();
  beam.position.y = 4.75;
  lightHouse.add(beam);
  const beamGeo = G(new THREE.ConeGeometry(0.5, 6, 10, 1, true));
  beamGeo.rotateZ(-Math.PI / 2);
  beamGeo.translate(3, 0, 0); // apex at the lamp, spreading along +x
  const beamMesh = new THREE.Mesh(beamGeo, matBeam);
  beamMesh.castShadow = false;
  beam.add(beamMesh);

  // ----------------------------------------------------------------- palms
  function palm(x, off) {
    const palmG = new THREE.Group();
    const z = P(x) + off;
    palmG.position.set(x, H(x, z), z);
    palmG.rotation.y = kit.random() * Math.PI * 2;
    let px = 0;
    let py = 0;
    let lean = 0.1 + kit.random() * 0.12;
    for (let s = 0; s < 3; s++) {
      const g = G(new THREE.CylinderGeometry(0.13 - s * 0.03, 0.19 - s * 0.03, 1.2, 7));
      const m = new THREE.Mesh(g, matTrunk);
      lean += 0.09 + kit.random() * 0.08;
      const nx = px + Math.sin(lean) * 0.55;
      const ny = py + Math.cos(lean) * 0.6;
      m.position.set((px + nx) / 2, (py + ny) / 2, 0);
      m.rotation.z = lean;
      m.castShadow = true;
      palmG.add(m);
      px = nx;
      py = ny;
    }
    for (let f = 0; f < 6; f++) {
      const g = G(new THREE.PlaneGeometry(0.3, 1.7));
      const m = new THREE.Mesh(g, matFrond);
      m.position.set(px, py + 0.12, 0);
      m.rotation.y = (f / 6) * Math.PI * 2;
      m.rotation.x = -0.55 - kit.random() * 0.25;
      m.castShadow = true;
      palmG.add(m);
      const cg = G(new THREE.SphereGeometry(0.11, 6, 5));
      const cm = new THREE.Mesh(cg, matTrunk);
      cm.position.set(px + Math.cos((f / 6) * Math.PI * 2) * 0.16, py + 0.05, Math.sin((f / 6) * Math.PI * 2) * 0.16);
      cm.castShadow = true;
      palmG.add(cm);
    }
    group.add(palmG);
  }
  palm(-6, 5.5);
  palm(18, 6.5);

  // ------------------------------------------------------------------ rocks
  // Landward boulders clear of the corridor.
  for (let i = 0; i < 5; i++) {
    const x = -21 + kit.random() * 42;
    const off = 3.2 + kit.random() * 10;
    const s1 = 0.5 + kit.random() * 1.1;
    const z = P(x) + off;
    kit.rock(cRock, [x, H(x, z) + 0.1, z], [s1, s1 * 0.8, s1], i * 3 + 1);
  }
  // Sea rocks and a far sea stack.
  for (let i = 0; i < 4; i++) {
    const x = -19 + i * 9 + kit.random() * 3;
    const z = P(x) - 4.5 - kit.random() * 4;
    const s2 = 0.7 + kit.random() * 0.9;
    kit.rock('#7b7466', [x, wyAt(x) + 0.15, z], [s2, s2 * 0.8, s2], i * 7 + 3);
  }
  const stackX = -17;
  kit.rock('#7b7466', [stackX, wyAt(stackX) - 0.1, P(stackX) - 14.5], [2.6, 2.2, 2.6], 11);
  kit.rock('#867e70', [stackX + 1.1, wyAt(stackX) + 1.6, P(stackX) - 14.2], [1.4, 1.2, 1.4], 12);

  // ------------------------------------------------------------- foam rings
  // Foam ring instances for shoreline pulses.
  const foamGeo = G(new THREE.TorusGeometry(1, 0.09, 5, 16));
  const foamCount = 9;
  const foam = G(new THREE.InstancedMesh(foamGeo, matFoam, foamCount));
  foam.receiveShadow = false;
  group.add(foam);
  const foamBase = [];
  for (let i = 0; i < foamCount; i++) {
    let x;
    let z;
    if (i < 2) {
      // Pulse around the sea rocks.
      x = -19 + (i % 4) * 9;
      z = P(x) - 4.5;
    } else {
      x = -22 + kit.random() * 44;
      z = P(x) - 2.35;
    }
    foamBase.push({ x, z, y: wyAt(x) + 0.04, s: 0.7 + kit.random() * 0.9, r: kit.random() * Math.PI });
  }
  // Prime the foam matrices so the first rendered frame is already correct.
  for (let i = 0; i < foamCount; i++) {
    const b = foamBase[i];
    e0.set(-Math.PI / 2, 0, b.r);
    q0.setFromEuler(e0);
    v3.set(b.x, b.y, b.z);
    sc3.set(b.s, b.s * 0.7, b.s);
    m4.compose(v3, q0, sc3);
    foam.setMatrixAt(i, m4);
  }
  foam.instanceMatrix.needsUpdate = true;

  // ---------------------------------------------------------- buoys
  const buoys = [];
  const buoyDefs = [[-3, -8.5], [15, -6]];
  for (const [bx, boff] of buoyDefs) {
    const bg = new THREE.Group();
    const x = bx;
    const z = P(x) + boff;
    bg.position.set(x, wyAt(x) + 0.18, z);
    const bodyGeo = G(new THREE.CylinderGeometry(0.2, 0.26, 0.55, 9));
    const body = new THREE.Mesh(bodyGeo, matRed);
    body.castShadow = true;
    bg.add(body);
    const topGeo = G(new THREE.ConeGeometry(0.16, 0.3, 9));
    const top = new THREE.Mesh(topGeo, matWhite);
    top.position.y = 0.4;
    top.castShadow = true;
    bg.add(top);
    group.add(bg);
    buoys.push(bg);
  }

  // ------------------------------------------------------ grass + props
  const tuftGeo = G(new THREE.ConeGeometry(0.08, 0.55, 5));
  const tuftCount = 56;
  const tufts = G(new THREE.InstancedMesh(tuftGeo, matGrass, tuftCount));
  tufts.castShadow = true;
  group.add(tufts);
  for (let i = 0; i < tuftCount; i++) {
    const x = -23 + kit.random() * 46;
    const off = 2.2 + kit.random() * 11 * (kit.random() < 0.4 ? 1 : 1.6);
    const z = P(x) + off;
    dummy.position.set(x, H(x, z) + 0.14, z);
    const s = 0.7 + kit.random() * 0.9;
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, kit.random() * Math.PI, 0);
    dummy.updateMatrix();
    tufts.setMatrixAt(i, dummy.matrix);
    dummy.scale.set(1, 1, 1);
  }
  tufts.instanceMatrix.needsUpdate = true;

  // Driftwood and a starfish on the wet sand.
  const drift1Geo = G(new THREE.CylinderGeometry(0.07, 0.1, 1.5, 6));
  kit.mesh(drift1Geo, matDrift, [-11, H(-11, P(-11) - 2) + 0.09, P(-11) - 2], [1, 1, 1], [0, 0.7, Math.PI / 2]);
  kit.mesh(drift1Geo, matDrift, [13, H(13, P(13) + 2.6) + 0.09, P(13) + 2.6], [1, 1, 0.7], [0, -0.4, Math.PI / 2]);
  const starGeo = G(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 5));
  kit.mesh(starGeo, matStar, [5.4, H(5.4, P(5.4) - 2) + 0.06, P(5.4) - 2], [1, 1, 0.8], [0, 0.9, 0]);

  // Dune domes adding landward dimension (clear of the corridor).
  const matDome = M(kit.material('#e3cd9e', { roughness: 1 }));
  const domeGeo = G(new THREE.SphereGeometry(1, 18, 12));
  const domes = [
    [-19, 8.5, 3.4, 1], [22, 10, 4.2, 2.6], [-2, 13, 3, 1.7],
  ];
  for (const [dx, doff, r, dropsy] of domes) {
    const z = P(dx) + doff;
    const m = new THREE.Mesh(domeGeo, matDome);
    m.position.set(dx, H(dx, z) - r * 0.35 + 0.4, z);
    m.scale.set(r, r * 0.34 * (dropsy * 0.5 + 0.7), r * 0.75);
    m.receiveShadow = true;
    m.castShadow = true;
    group.add(m);
  }

  // ------------------------------------------------------------- seagulls
  const gulls = [];
  const gullDefs = [[-2, 0, 6.2], [4, Math.PI, 5.4]];
  for (const [gpos, phase, alt] of gullDefs) {
    const bird = new THREE.Group();
    bird.position.set(gpos, alt, P(gpos) - 6);
    const bodyGeo2 = G(new THREE.SphereGeometry(0.13, 6, 5));
    const body = new THREE.Mesh(bodyGeo2, matWhite);
    body.scale.set(1.6, 0.8, 1);
    bird.add(body);
    const wingGeo = G(new THREE.PlaneGeometry(0.7, 0.22));
    const wingL = new THREE.Mesh(wingGeo, matWhite);
    wingL.rotation.y = Math.PI / 2;
    wingL.position.z = 0.16;
    bird.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, matWhite);
    wingR.rotation.y = Math.PI / 2;
    wingR.position.z = -0.16;
    bird.add(wingR);
    group.add(bird);
    gulls.push({ bird, wingL, wingR, phase, alt });
  }

  // ----------------------------------------------------------------- update
  function update(time, _dt) {
    // Gentle dimensional water ripple, larger swells further out.
    for (let i = 0; i < wCount; i++) {
      const amp = 0.02 + 0.038 * ((wPh[i] + 2.5) / 16.5);
      wPos.setY(i, wBase[i] + Math.sin(time * 1.5 + wxs[i] * 0.55 + wPh[i] * 0.6) * amp);
    }
    wPos.needsUpdate = true;

    // Foam breathing around shoreline and sea rocks.
    for (let i = 0; i < foamCount; i++) {
      const b = foamBase[i];
      const p = Math.sin(time * 1.7 + i * 1.3 + b.r) * 0.5 + 0.5;
      const s = b.s * (0.75 + 0.45 * p);
      e0.set(-Math.PI / 2, 0, b.r);
      q0.setFromEuler(e0);
      v3.set(b.x, b.y + p * 0.03, b.z);
      sc3.set(s, s * (0.7 + 0.3 * p), s);
      m4.compose(v3, q0, sc3);
      foam.setMatrixAt(i, m4);
    }
    foam.instanceMatrix.needsUpdate = true;

    // Buoys bob and heel with the swell.
    for (let i = 0; i < buoys.length; i++) {
      const b = buoys[i];
      b.position.y = wyAt(b.position.x) + 0.18 + Math.sin(time * 1.3 + i * 2.1) * 0.05;
      b.rotation.z = Math.sin(time * 1.1 + i) * 0.08;
    }

    // Dinghy rocks at the mooring.
    dinghy.position.y = wyAt(dingX) + 0.16 + Math.sin(time * 1.25) * 0.05;
    dinghy.rotation.z = Math.sin(time * 0.9) * 0.045;
    dinghy.rotation.x = Math.sin(time * 1.15 + 1) * 0.035;

    // Lighthouse beam sweep and lamp pulse.
    beam.rotation.y = time * 0.5;
    if (matLamp.emissive) {
      matLamp.emissiveIntensity = 1.25 + Math.sin(time * 2.2) * 0.25;
    }

    // Gulls circle above the bay.
    for (const g of gulls) {
      const a = time * 0.22 + g.phase;
      g.bird.position.set(
        -2 + Math.cos(a) * 9,
        g.alt + Math.sin(time * 0.7 + g.phase) * 0.4,
        P(0) - 7 + Math.sin(a) * 4.5
      );
      g.bird.rotation.y = -a + Math.PI / 2;
      const flap = Math.sin(time * 6 + g.phase) * 0.55;
      g.wingL.rotation.x = flap;
      g.wingR.rotation.x = -flap;
    }
  }

  return {
    group,
    update,
    dispose() {
      for (const g of ownGeos) g.dispose();
      for (const m of ownMats) m.dispose();
    },
  };
}
