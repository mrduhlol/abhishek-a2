import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PROJECTS } from '../data/projects.js';
import { createKit, disposeGroup } from './kit.js';
import { chapterAt, clamp, END_X, groundHeight, pathY, pathZ, routeAt, SEGMENT, START_X } from './route.js';

// Globs keep the renderer buildable while independently authored modules arrive.
const biomeModules = import.meta.glob('./biomes/*.js');
const actorModules = import.meta.glob(['./avatar.js', './town.js']);
const HABITATS = ['mountain', 'forest', 'grassland', 'desert', 'ocean', 'cave', 'volcano'];
const GROUND = ['#78877b', '#526f43', '#91a65d', '#d2a366', '#8dafa0', '#686778', '#71544b'];
const SKY = ['#bacdd2', '#b9caba', '#cbd7bd', '#e7caa4', '#b9d9dd', '#a1aabf', '#d9b6a3'].map(c => new THREE.Color(c));
const VIEW = [[9, 12, 24], [7, 10, 23], [6, 9, 26], [9, 11, 25], [7, 12, 28], [5, 9, 23], [9, 13, 26]];
const DAMP = (rate, dt) => 1 - Math.exp(-rate * dt);
const RENDER_QUALITY = [
  { name: 'high', dpr: 1.25, shadowSize: 1024 },
  { name: 'balanced', dpr: .8, shadowSize: 512 },
  { name: 'low', dpr: .6, shadowSize: 512 },
];
const positionOf = (value, fallback = [0, 0, 0]) => {
  if (Array.isArray(value)) return new THREE.Vector3(value[0] || 0, value[1] || 0, value[2] || 0);
  return new THREE.Vector3(value?.x ?? fallback[0], value?.y ?? fallback[1], value?.z ?? fallback[2]);
};
const progressOf = value => clamp(Number.isFinite(value) ? value : 0);

function mesh(geometry, color, parent, position = [0, 0, 0], options = {}) {
  const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .86, ...options }));
  object.position.fromArray(position);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function fitAvatar(avatar, height) {
  const wrapper = new THREE.Group();
  wrapper.add(avatar.group);
  if (avatar.group.userData.avatar?.height) {
    wrapper.scale.setScalar(height / avatar.group.userData.avatar.height);
    return wrapper;
  }
  avatar.group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(avatar.group);
  const size = bounds.getSize(new THREE.Vector3());
  if (Number.isFinite(size.y) && size.y > .001) {
    avatar.group.position.x -= (bounds.min.x + bounds.max.x) / 2;
    avatar.group.position.y -= bounds.min.y;
    avatar.group.position.z -= (bounds.min.z + bounds.max.z) / 2;
    wrapper.scale.setScalar(height / size.y);
  }
  wrapper.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return wrapper;
}

function makeTrail() {
  const group = new THREE.Group();
  group.name = 'continuous-route';
  const positions = [], colors = [], indices = [];
  const sand = new THREE.Color('#bda181'), stone = new THREE.Color('#c0b59a');
  const n = Math.ceil((END_X - START_X + 9) * 3);
  for (let i = 0; i <= n; i++) {
    const x = START_X - 4 + i / n * (END_X - START_X + 9);
    const dz = (pathZ(x + .1) - pathZ(x - .1)) / .2;
    const length = Math.hypot(1, dz);
    const color = stone.clone().lerp(sand, clamp((x - 115) / 35) * (1 - clamp((x - 175) / 25)));
    for (const side of [-1, 1]) {
      const xx = x - side * dz / length * 1.22;
      const zz = pathZ(x) + side / length * 1.22;
      positions.push(xx, groundHeight(xx, zz) + .035, zz);
      colors.push(color.r, color.g, color.b);
    }
    if (i < n) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  mesh(geometry, '#ffffff', group, [0, 0, 0], { vertexColors: true, side: THREE.DoubleSide });

  // Coastline decking shares the route's elevation: feet never swim through it.
  const boardGeometry = new THREE.BoxGeometry(.42, .1, 2.65);
  const boardMaterial = new THREE.MeshStandardMaterial({ color: '#977954', roughness: .95 });
  const count = 99;
  const boards = new THREE.InstancedMesh(boardGeometry, boardMaterial, count);
  const transform = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const x = 168 + i * .49;
    transform.position.set(x, pathY(x) + .005, pathZ(x));
    transform.rotation.set(0, -Math.atan2(pathZ(x + .1) - pathZ(x - .1), .2), 0);
    transform.updateMatrix();
    boards.setMatrixAt(i, transform.matrix);
  }
  boards.castShadow = true;
  boards.receiveShadow = true;
  group.add(boards);
  const postGeometry = new THREE.CylinderGeometry(.075, .095, 1.25, 6);
  const ropeMaterial = new THREE.MeshStandardMaterial({ color: '#b5a07b' });
  for (const side of [-1, 1]) {
    const points = [];
    for (let x = 168; x <= 217; x += 3.5) {
      const z = pathZ(x) + side * 1.43;
      mesh(postGeometry, '#695c45', group, [x, pathY(x) + .52, z]);
      points.push(new THREE.Vector3(x, pathY(x) + 1.02, z));
    }
    const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 100, .035, 4, false), ropeMaterial);
    group.add(rope);
  }
  return group;
}

function titleTexture(project) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f9f0d9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontSize = 106;
  ctx.font = `600 ${fontSize}px "Barlow Condensed", sans-serif`;
  while (ctx.measureText(project.name).width > 720 && fontSize > 40) {
    fontSize -= 2;
    ctx.font = `600 ${fontSize}px "Barlow Condensed", sans-serif`;
  }
  ctx.fillText(project.name, 384, 160);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeLandmark(index) {
  const project = PROJECTS[index];
  const root = new THREE.Group();
  const x = index * SEGMENT, z = pathZ(x) - 3.3;
  root.position.set(x, groundHeight(x, z), z);
  root.rotation.y = .18;
  root.name = `project-${project.id}`;
  root.userData.projectId = project.id;
  root.userData.action = { type: 'project', index };
  const plaque = new THREE.Group();
  root.add(plaque);
  const rock = (parent, color, position, scale) => {
    const object = mesh(new THREE.DodecahedronGeometry(1, 0), color, parent, position);
    object.scale.fromArray(scale);
    return object;
  };
  const disc = (color, radius = 1.2) => {
    const object = mesh(new THREE.CylinderGeometry(radius, radius * .98, .18, index === 5 ? 6 : 12), color, plaque);
    object.rotation.x = Math.PI / 2;
    return object;
  };
  let restY = 1.8, lift = .55, logoY = .1, logoZ = .14;
  if (index === 0) {
    rock(root, '#7c877c', [0, .35, 0], [1.65, .6, 1.05]);
    rock(plaque, '#5b6e72', [0, 0, 0], [1.2, 1.55, .52]);
    rock(root, '#b0b3a1', [-1.15, .45, .45], [.6, .5, .55]);
    restY = 1.65; lift = .32;
  } else if (index === 1) {
    for (const side of [-1, 1]) mesh(new THREE.CylinderGeometry(.12, .2, 4, 7), '#685439', root, [side * 1.65, 2, 0]);
    mesh(new THREE.BoxGeometry(3.9, .2, .24), '#735e3d', root, [0, 3.9, 0]);
    for (const side of [-1, 1]) mesh(new THREE.CylinderGeometry(.032, .032, .85, 5), '#c3aa79', plaque, [side * .65, 1.5, 0]);
    disc('#735b38'); restY = 2.05; lift = .35;
  } else if (index === 2) {
    for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(.18, 2, .24), '#8b7350', root, [side * 1.85, 1, 0]);
    for (const y of [.6, 1.35]) mesh(new THREE.BoxGeometry(4.5, .18, .2), '#ad9366', root, [0, y, -.2]);
    disc('#b29a63'); restY = 1.7;
  } else if (index === 3) {
    rock(root, '#c39a60', [-1.2, .2, .1], [1.3, .45, .9]);
    rock(root, '#d3b07a', [1, .18, -.05], [1.3, .38, .95]);
    mesh(new THREE.BoxGeometry(2.55, 2.9, .42), '#a67c4e', plaque);
    mesh(new THREE.BoxGeometry(2.3, 2.65, .07), '#dfbf88', plaque, [0, 0, .24]);
    restY = .7; lift = 1.15; logoZ = .29; logoY = .2;
    plaque.rotation.z = -.1;
  } else if (index === 4) {
    mesh(new THREE.BoxGeometry(2.8, 1.55, 1.6), '#927047', root, [0, .78, 0]);
    for (const x of [-1.25, 0, 1.25]) mesh(new THREE.BoxGeometry(.11, 1.55, 1.72), '#b49666', root, [x, .78, 0]);
    mesh(new THREE.CylinderGeometry(.17, .22, 2.8, 8), '#766346', root, [-1.8, 1.2, -.2]);
    mesh(new THREE.TorusGeometry(.4, .07, 5, 16), '#c7b58a', root, [-1.8, 2.2, -.2], {}).rotation.x = Math.PI / 2;
    disc('#6d8378'); restY = 1.65; logoZ = .18;
    plaque.position.z = .9;
  } else if (index === 5) {
    for (const [x, size] of [[-1.25, 1.8], [1.1, 2.5], [.3, 1.1]]) {
      const crystal = mesh(new THREE.ConeGeometry(.55, size, 5), '#9b96bc', root, [x, size / 2, -.35], { metalness: .15, roughness: .35 });
      crystal.rotation.z = -x * .23;
    }
    disc('#665777', 1.3); restY = 2; lift = .65;
  } else {
    mesh(new THREE.CylinderGeometry(1.25, 1.55, 1.25, 6), '#343437', root, [0, .625, 0]);
    mesh(new THREE.CylinderGeometry(1.35, 1.25, .16, 6), '#8b6146', root, [0, 1.3, 0]);
    disc('#282e2b'); restY = 2.2; lift = .5;
  }
  plaque.position.y = restY;
  const face = mesh(new THREE.PlaneGeometry(index === 0 ? 2.05 : 2.5, index === 0 ? .85 : .55), '#ffffff', plaque,
    [0, index === 0 ? .1 : -1.45, index === 0 ? .53 : logoZ + .015], { map: titleTexture(project), transparent: true, depthWrite: false, roughness: .9 });
  face.castShadow = false;
  return { root, plaque, face, restY, lift, logoY, logoZ, index, logo: null };
}

function makePortal() {
  const group = new THREE.Group();
  group.name = 'cave-to-town';
  group.position.set(END_X, pathY(END_X), pathZ(END_X) - 2.7);
  const shape = new THREE.Shape();
  shape.moveTo(-2.1, 0); shape.lineTo(2.1, 0); shape.lineTo(2.1, 3);
  shape.absarc(0, 3, 2.1, 0, Math.PI, false); shape.lineTo(-2.1, 0);
  const doorway = mesh(new THREE.ShapeGeometry(shape), '#192d32', group, [0, 0, .08], { emissive: '#23433c', emissiveIntensity: .3, side: THREE.DoubleSide });
  doorway.name = 'enter-town';
  doorway.userData.action = { type: 'portal' };
  const arch = mesh(new THREE.TorusGeometry(2.63, .64, 7, 18, Math.PI), '#514e46', group, [0, 3, 0]);
  arch.receiveShadow = true;
  for (const side of [-1, 1]) {
    for (let y = .5; y < 3.1; y += 1) {
      const rock = mesh(new THREE.DodecahedronGeometry(.8), '#615d50', group, [side * 2.65, y, 0]);
      rock.scale.set(.9, .95, 1.05);
      rock.rotation.z = side * .11;
    }
    mesh(new THREE.BoxGeometry(.25, .45, .25), '#f3c975', group, [side * 1.83, 2, .4], { emissive: '#ffc875', emissiveIntensity: 1.8 });
  }
  const lamp = new THREE.PointLight('#ffc57b', 12, 10, 2);
  lamp.position.set(0, 2.5, 1.5);
  group.add(lamp);
  return { group, doorway };
}

function fallbackTown() {
  const group = new THREE.Group();
  mesh(new THREE.CylinderGeometry(40, 43, 2, 64), '#91a172', group, [0, -1.03, 0]);
  mesh(new THREE.CircleGeometry(14, 48), '#cbb797', group, [0, .01, 0]).rotation.x = -Math.PI / 2;
  for (const [x, z, color] of [[-12, -9, '#bb9a78'], [0, -14, '#b7baa0'], [12, -10, '#d2b087']]) {
    mesh(new THREE.BoxGeometry(7, 5, 6), color, group, [x, 2.5, z]);
    const roof = mesh(new THREE.ConeGeometry(5.8, 3.3, 4), '#876751', group, [x, 6.5, z]);
    roof.rotation.y = Math.PI / 4;
    mesh(new THREE.BoxGeometry(1.5, 2.8, .15), '#56625b', group, [x, 1.4, z + 3.03]);
  }
  const portal = makePortal();
  portal.group.position.set(-16, 0, 3);
  portal.doorway.name = 'return-to-trail';
  group.add(portal.group);
  return {
    group, portal: portal.doorway, spawn: [-22, .08, 4],
    npcs: [
      { id: 'girl', name: 'Your companion', kind: 'girl', position: [3, 0, 5], dialogue: 'You made it. Walk with me?' },
      { id: 'gardener', name: 'The gardener', kind: 'gardener', working: true, position: [-6, 0, -1], dialogue: 'There is always something growing here.' },
      { id: 'elder', name: 'The storyteller', kind: 'elder', age: 'elder', position: [7, 0, 0], dialogue: 'Every path has a story.' },
      { id: 'child', name: 'The explorer', kind: 'child', age: 'child', route: [[-3, 0, 3], [0, 0, 1], [5, 0, 2], [1, 0, 6]], dialogue: 'Race you to the square!' },
    ],
  };
}

function makeHearts() {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, .2);
  shape.bezierCurveTo(-.7, .85, -1.1, -.05, 0, -.8);
  shape.bezierCurveTo(1.1, -.05, .7, .85, 0, .2);
  const geometry = new THREE.ShapeGeometry(shape, 10);
  for (let i = 0; i < 3; i++) {
    const heart = mesh(geometry, '#cf716e', group, [(i - 1) * .6, i % 2 * .4, 0], { side: THREE.DoubleSide, emissive: '#a7454d', emissiveIntensity: .15 });
    heart.scale.setScalar(.22 + i * .025);
    heart.castShadow = false;
  }
  group.visible = false;
  return group;
}

export default function ExpeditionScene({ progress = 0, world = 'trail', reducedMotion = false, onProject, onPortal, onNpc, onReady, onError, onPosition }) {
  const hostRef = useRef(null);
  const actionsRef = useRef(null);
  const [avatarStatus, setAvatarStatus] = useState('loading');
  const [residents, setResidents] = useState([]);
  const [portalHint, setPortalHint] = useState(null);
  const latest = useRef({ progress, world, reducedMotion, onProject, onPortal, onNpc, onReady, onError, onPosition });
  useLayoutEffect(() => {
    latest.current = { progress, world, reducedMotion, onProject, onPortal, onNpc, onReady, onError, onPosition };
  });

  useEffect(() => {
    const host = hostRef.current;
    let assetsPrepared = false, assetError = false;
    let renderer, raf = 0, disposed = false, failed = false, visible = true, ready = false;
    let lastStamp = 0, time = 0, activeWorld = null, dirty = true, lastPositionAt = -1;
    let qualityIndex = 0, frameAverage = 0, frameSamples = 0, slowSeconds = 0, renderedLastFrame = false;
    let resizeObserver, intersectionObserver, hovered = null, pointerDown = null;
    let hero = null, town = null, girl = null, stareUntil = 0, townWalk = 0, handBlend = 0;
    const disposers = [], actors = [], biomes = [], landmarks = [];
    const pending = new AbortController();
    const scene = new THREE.Scene();
    const trail = new THREE.Group(), village = new THREE.Group();
    scene.add(trail, village);
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 180);
    const target = new THREE.Vector3(), desiredCamera = new THREE.Vector3();
    const previousHero = new THREE.Vector3(), heroPosition = new THREE.Vector3();
    const pointer = new THREE.Vector2(10, 10), raycaster = new THREE.Raycaster();
    const screen = new THREE.Vector3(), cameraDirection = new THREE.Vector3();
    const cameraFrustum = new THREE.Frustum(), viewProjection = new THREE.Matrix4();
    const actorBounds = new THREE.Sphere();
    const bg = SKY[0].clone();
    scene.background = bg;
    scene.fog = new THREE.Fog(bg.clone(), 40, 110);

    function fail(error) {
      if (disposed || failed) return;
      failed = true;
      cancelAnimationFrame(raf);
      renderer?.domElement.setAttribute('data-ready', 'false');
      host.dataset.ready = 'false';
      latest.current.onError?.(error instanceof Error ? error : new Error(String(error)));
    }

    function disposeActor(actor) {
      if (actor.disposed) return;
      actor.disposed = true;
      actor.root.removeFromParent();
      try { actor.avatar.dispose?.(); } finally { disposeGroup(actor.root); }
    }

    function addActor(descriptor, parent, height) {
      // An empty anchor preserves locomotion while the authored GLB loads.
      const avatar = { group: new THREE.Group() };
      const root = new THREE.Group();
      const visual = fitAvatar(avatar, height);
      root.add(visual);
      root.position.copy(positionOf(descriptor.position));
      parent.add(root);
      const actor = { descriptor, root, visual, avatar, height, routeTime: 0, previous: root.position.clone(), disposed: false };
      actors.push(actor);
      return actor;
    }

    let avatarModule;
    async function upgradeActor(actor) {
      const loader = actorModules['./avatar.js'];
      if (!loader) {
        assetError = true;
        if (!disposed) setAvatarStatus('error');
        return;
      }
      try {
        avatarModule ||= loader();
        const module = await avatarModule;
        if (disposed || actor.disposed) return;
        const createAvatar = module.createAvatar || module.default;
        const avatar = await createAvatar({ THREE, kind: actor.descriptor.kind || `${actor.descriptor.role || 'resident'}-${actor.descriptor.id}`, age: actor.descriptor.age || 'adult' });
        if (!avatar?.group?.isObject3D) throw new Error('Avatar must return a Three.js group');
        if (disposed || actor.disposed) {
          avatar.dispose?.();
          disposeGroup(avatar.group);
          return;
        }
        const oldVisual = actor.visual;
        actor.avatar.dispose?.();
        actor.visual = fitAvatar(avatar, actor.height);
        actor.avatar = avatar;
        actor.root.add(actor.visual);
        actor.loaded = true;
        if (actor === hero) setAvatarStatus('ready');
        oldVisual.removeFromParent();
        disposeGroup(oldVisual);
        dirty = true;
      } catch (error) {
        assetError = true;
        if (!disposed) { setAvatarStatus('error'); console.warn('Expedition avatar unavailable:', error); }
      }
    }

    async function installTown(result) {
      if (!result?.group?.isObject3D) throw new Error('Town builder must return a Three.js group');
      village.add(result.group);
      town = result;
      if (result.portal?.isObject3D) result.portal.userData.action = { type: 'portal' };
      else if (result.portal?.group?.isObject3D) (result.portal.mesh || result.portal.group).userData.action = { type: 'portal' };
      const upgrades = [];
      for (const descriptor of result.npcs || []) {
        const age = descriptor.age || 'adult';
        const child = typeof age === 'number' ? age < 14 : /child|kid/.test(age);
        const elder = typeof age === 'number' ? age >= 65 : age === 'elder';
        const actor = addActor(descriptor, village, child ? 1.45 : elder ? 2 : 2.15);
        actor.root.name = `npc-${descriptor.id}`;
        actor.root.userData.action = { type: 'npc', actor };
        const path = descriptor.route || descriptor.path;
        if (Array.isArray(path) && path.length > 1) {
          actor.path = path.map(p => positionOf(p));
          actor.pathLengths = actor.path.map((p, i) => p.distanceTo(actor.path[(i + 1) % actor.path.length]));
          actor.pathLength = actor.pathLengths.reduce((a, b) => a + b, 0);
          actor.root.position.copy(actor.path[0]);
        }
        if (descriptor.id === 'girl' || descriptor.kind === 'girl' || descriptor.role === 'girl' || descriptor.role === 'partner' || descriptor.couple) girl = actor;
        upgrades.push(upgradeActor(actor));
      }
      setResidents((result.npcs || []).map(d => ({ id: d.id, name: d.name, role: d.role || d.kind || 'resident' })));
      dirty = true;
      await Promise.all(upgrades);
    }

    const hearts = makeHearts();
    village.add(hearts);

    async function loadWorld() {
      await Promise.all(HABITATS.map(async (name, index) => {
        const kit = createKit(index);
        let result;
        try {
          const loader = biomeModules[`./biomes/${name}.js`];
          if (loader) {
            const module = await loader();
            if (disposed) return;
            result = await module.default({ THREE, kit, index });
          }
          if (!result?.group) { kit.ground(GROUND[index]); result = { group: kit.group }; }
          if (disposed) { result.dispose?.(); disposeGroup(result.group); return; }
          result.group.position.x = index * SEGMENT;
          result.group.name = `biome-${name}`;
          trail.add(result.group);
          biomes[index] = result;
          dirty = true;
        } catch (error) {
          disposeGroup(kit.group);
          if (!disposed) {
            console.warn(`Expedition ${name} fallback:`, error);
            const fallback = createKit(index);
            fallback.ground(GROUND[index]);
            fallback.group.position.x = index * SEGMENT;
            trail.add(fallback.group);
            biomes[index] = { group: fallback.group };
            dirty = true;
          }
        }
      }));
    }

    async function loadTown() {
      const loader = actorModules['./town.js'];
      if (!loader) { if (!disposed) await installTown(fallbackTown()); return; }
      let result;
      try {
        const module = await loader();
        if (disposed) return;
        const build = module.default || module.buildTown || module.createTown;
        result = await build({ THREE, kit: createKit(0, true), createAvatar: async options => {
          const avatarLoader = actorModules['./avatar.js'];
          if (!avatarLoader) throw new Error('The rigged avatar module is not available');
          avatarModule ||= avatarLoader();
          const avatars = await avatarModule;
          return (avatars.createAvatar || avatars.default)({ THREE, ...options });
        } });
        if (disposed) { result?.dispose?.(); if (result?.group) disposeGroup(result.group); return; }
        await installTown(result);
      } catch (error) {
        if (result?.group) { result.group.removeFromParent(); disposeGroup(result.group); }
        if (!disposed) { console.warn('Expedition town fallback:', error); await installTown(fallbackTown()); }
      }
    }

    async function loadLogos() {
      try {
        const base = `${import.meta.env.BASE_URL}expedition/logos/`;
        const response = await fetch(`${base}manifest.json`, { signal: pending.signal });
        if (!response.ok) return;
        const manifest = await response.json();
        if (disposed) return;
        const entries = manifest.projects || manifest.logos || manifest;
        const loader = new THREE.TextureLoader();
        const textureLoads = [];
        for (const landmark of landmarks) {
          const project = PROJECTS[landmark.index];
          const entry = Array.isArray(entries) ? entries.find(e => e.id === project.id || e.project === project.id) : entries[project.id];
          const source = typeof entry === 'string' ? entry : entry?.src || entry?.file || entry?.path || entry?.logo || entry?.url;
          if (typeof source !== 'string') continue;
          const url = /^(https?:|data:|\/)/.test(source) ? source : `${base}${source}`;
          textureLoads.push(new Promise(resolve => loader.load(url, texture => {
            if (disposed) { texture.dispose(); resolve(); return; }
            texture.colorSpace = THREE.SRGBColorSpace;
            const ratio = texture.image.width / Math.max(1, texture.image.height);
            const logo = mesh(new THREE.PlaneGeometry(Math.min(2.02, 2.02 * ratio), Math.min(2.02, 2.02 / ratio)), '#ffffff', landmark.plaque, [0, landmark.logoY, landmark.logoZ], { map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
            logo.castShadow = false;
            landmark.logo = logo;
            logo.name = `logo-${project.id}`;
            dirty = true;
            resolve();
          }, undefined, () => { assetError = true; resolve(); })));
        }
        await Promise.all(textureLoads);
      } catch { /* Missing manifests and aborted requests retain the project names. */ }
    }

    function pick() {
      if (!renderer || failed) return null;
      scene.updateMatrixWorld(true);
      raycaster.setFromCamera(pointer, camera);
      const root = activeWorld === 'town' ? village : trail;
      // Raycaster traverses invisible groups by default; exclude culled actors and
      // habitats before doing triangle tests, including the periodic NPC hit probes.
      const targets = [];
      root.traverseVisible(object => { if (object.isMesh) targets.push(object); });
      if (activeWorld === 'town' && hero) hero.root.traverseVisible(object => { if (object.isMesh) targets.push(object); });
      const hits = raycaster.intersectObjects(targets, false);
      hits.sort((a, b) => a.distance - b.distance);
      for (const hit of hits) {
        let object = hit.object, action = null, hidden = false;
        while (object) {
          if (!object.visible) hidden = true;
          action ||= object.userData.action;
          object = object.parent;
        }
        if (hidden || hit.object.material?.opacity === 0) continue;
        if (action) return action;
        // Opaque foreground geometry occludes interactions, just as it does light.
        if (!hit.object.material?.transparent) return null;
      }
      return null;
    }

    function pointerMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      hovered = pick();
      renderer.domElement.style.cursor = hovered ? 'pointer' : '';
      setPortalHint(hovered?.type === 'portal' ? { x: clamp(event.clientX - rect.left, 80, rect.width - 80), y: Math.max(35, event.clientY - rect.top - 25), text: activeWorld === 'town' ? 'Return to the trail' : 'Enter the hidden town' } : null);
      dirty = true;
    }

    function pointerLeave() {
      pointer.set(10, 10); hovered = null; pointerDown = null;
      setPortalHint(null);
      renderer.domElement.style.cursor = '';
      dirty = true;
    }

    function press(event) {
      if (!event.isPrimary || event.button !== 0) return;
      pointerMove(event);
      pointerDown = { x: event.clientX, y: event.clientY, id: event.pointerId, action: hovered, world: activeWorld };
    }

    function release(event) {
      const down = pointerDown;
      pointerDown = null;
      if (!down || down.id !== event.pointerId || down.world !== activeWorld || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 7) return;
      pointerMove(event);
      if (!hovered || hovered !== down.action) return;
      activate(hovered);
    }

    function activate(action) {
      if (action.type === 'project') latest.current.onProject?.(action.index);
      else if (action.type === 'portal') latest.current.onPortal?.();
      else if (action.type === 'npc') {
        const actor = action.actor;
        if (actor === girl || actor === hero) stareUntil = time + 4;
        actor.pauseUntil = time + 4;
        const d = actor === hero ? { id: 'hero', name: 'Abhishek', working: false, dialogue: 'You found us. Thanks for walking all this way.' } : actor.descriptor;
        latest.current.onNpc?.({ id: d.id, name: d.name, working: Boolean(d.working), dialogue: d.dialogue });
      }
      dirty = true;
    }
    actionsRef.current = id => {
      if (activeWorld !== 'town') return;
      const actor = actors.find(a => a.descriptor.id === id);
      if (actor) activate({ type: 'npc', actor });
    };

    function resize() {
      if (!renderer || disposed) return;
      const { width, height } = host.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const quality = RENDER_QUALITY[qualityIndex];
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dpr));
      renderer.setSize(width, height, false);
      if (sun.shadow.mapSize.x !== quality.shadowSize) {
        // Changing mapSize alone does not resize an existing Three.js shadow target.
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
        sun.shadow.mapPass?.dispose();
        sun.shadow.mapPass = null;
        sun.shadow.mapSize.setScalar(quality.shadowSize);
        sun.shadow.needsUpdate = true;
        renderer.shadowMap.needsUpdate = true;
      }
      renderer.domElement.dataset.renderQuality = quality.name;
      renderer.domElement.dataset.renderDpr = String(renderer.getPixelRatio());
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      dirty = true;
    }

    function resume() {
      cancelAnimationFrame(raf);
      lastStamp = 0;
      frameAverage = 0;
      frameSamples = 0;
      slowSeconds = 0;
      renderedLastFrame = false;
      if (!disposed && !failed && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function contextLost(event) {
      event.preventDefault();
      fail(new Error('WebGL context lost. The expedition needs a fresh renderer.'));
    }

    const sun = new THREE.DirectionalLight('#ffe0aa', 3.1);
    const fill = new THREE.HemisphereLight('#d4e6e5', '#6a6450', 2.05);
    const rim = new THREE.DirectionalLight('#c4e1ec', .65);
    rim.position.set(-8, 9, -14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -27, right: 27, top: 26, bottom: -26, near: 1, far: 95 });
    sun.shadow.normalBias = .045;
    sun.shadow.bias = -.00012;
    scene.add(sun, sun.target, fill, rim);

    function animateActor(actor, dt, moving, speed, lookAt) {
      // The avatar caps individual updates at .1s. Substeps preserve its full
      // distance-driven stride when a slow rendered frame advances the root .25s.
      const steps = Math.max(1, Math.ceil(dt / .1));
      for (let step = 0; step < steps; step++) {
        actor.avatar.update?.(dt / steps, { moving, speed, time: time - dt + (step + 1) * dt / steps, working: Boolean(actor.descriptor.working), lookAt });
      }
    }

    function face(actor, direction, dt, snap) {
      if (direction.lengthSq() < .000001) return;
      const desired = Math.atan2(direction.x, direction.z);
      const difference = Math.atan2(Math.sin(desired - actor.root.rotation.y), Math.cos(desired - actor.root.rotation.y));
      actor.root.rotation.y += difference * (snap ? 1 : DAMP(11, dt));
    }

    const movement = new THREE.Vector3(), npcDirection = new THREE.Vector3(), viewOffset = new THREE.Vector3();
    const handTarget = new THREE.Vector3(), heroHand = new THREE.Vector3(), partnerHand = new THREE.Vector3();
    const facing = new THREE.Vector3(), towardCamera = new THREE.Vector3(), facingRotation = new THREE.Quaternion();
    function facesCamera(actor) {
      actor.root.getWorldQuaternion(facingRotation);
      facing.set(0, 0, 1).applyQuaternion(facingRotation).setY(0).normalize();
      actor.root.getWorldPosition(towardCamera);
      towardCamera.subVectors(camera.position, towardCamera).setY(0).normalize();
      return facing.dot(towardCamera) > Math.cos(.12);
    }
    function frame(stamp) {
      if (disposed || failed || !visible || document.hidden) return;
      const rawDt = lastStamp ? Math.max(0, (stamp - lastStamp) / 1000) : 1 / 60;
      const dt = Math.min(rawDt, .25);
      lastStamp = stamp;
      const props = latest.current;
      const quiet = Boolean(props.reducedMotion);
      if (ready && renderedLastFrame && !quiet && qualityIndex < RENDER_QUALITY.length - 1) {
        frameAverage = frameSamples ? THREE.MathUtils.lerp(frameAverage, rawDt, .25) : rawDt;
        frameSamples++;
        const slow = frameAverage > (qualityIndex === 0 ? .055 : .075);
        slowSeconds = slow ? slowSeconds + rawDt : 0;
        if (frameSamples >= 6 && slowSeconds >= 1.2) {
          qualityIndex++;
          frameAverage = 0;
          frameSamples = 0;
          slowSeconds = 0;
          resize();
        }
      }
      renderedLastFrame = false;
      if (quiet !== frame.previousQuiet) dirty = true;
      frame.previousQuiet = quiet;
      const nextWorld = props.world === 'town' ? 'town' : 'trail';
      const changedWorld = nextWorld !== activeWorld;
      const p = progressOf(props.progress);
      const changedProgress = p !== frame.previousProgress;
      frame.previousProgress = p;
      if (!quiet) time += dt;
      try {
        if (changedWorld) {
          activeWorld = nextWorld;
          trail.visible = activeWorld === 'trail';
          village.visible = activeWorld === 'town';
          host.dataset.world = activeWorld;
          renderer.domElement.dataset.world = activeWorld;
          hovered = null;
          setPortalHint(null);
          pointerDown = null;
          renderer.domElement.style.cursor = '';
          townWalk = 0;
          handBlend = 0;
          stareUntil = 0;
          if (activeWorld === 'town') hero.root.position.copy(positionOf(town?.spawn || town?.heroSpawn, [-22, .08, 4]));
          dirty = true;
        }
        previousHero.copy(hero.root.position);
        let chapter;
        if (activeWorld === 'trail') {
          const destination = routeAt(p);
          const jump = changedWorld || Math.abs(destination.x - hero.root.position.x) > 52;
          const currentX = hero.root.position.x;
          const slope = Math.hypot(1, (pathZ(currentX + .1) - pathZ(currentX - .1)) / .2, (pathY(currentX + .1) - pathY(currentX - .1)) / .2);
          const step = 6 * dt / slope;
          const x = quiet || jump ? destination.x : currentX + clamp(destination.x - currentX, -step, step);
          const boardwalkLift = .08 * THREE.MathUtils.smoothstep(x, 167.8, 169.2) * (1 - THREE.MathUtils.smoothstep(x, 214.8, 216.2));
          hero.root.position.set(x, pathY(x) + .06 + boardwalkLift, pathZ(x));
          const actualProgress = clamp((x - START_X) / (END_X - START_X));
          chapter = chapterAt(actualProgress);
          movement.subVectors(hero.root.position, previousHero);
          if (movement.lengthSq() > .000001 || jump) {
            npcDirection.set(1, 0, (pathZ(x + .1) - pathZ(x - .1)) / .2);
            if (movement.x < -.0001 && !jump) npcDirection.negate();
            face(hero, npcDirection, dt, quiet || jump);
          }
          animateActor(hero, quiet ? 0 : dt, !quiet && !jump && movement.length() > .0008, quiet || jump ? 0 : movement.length() / dt);
          const blend = clamp(x / SEGMENT, 0, 6), a = Math.floor(blend), b = Math.min(a + 1, 6), mix = blend - a;
          const ease = mix * mix * (3 - 2 * mix);
          viewOffset.fromArray(VIEW[a]).lerp(new THREE.Vector3(...VIEW[b]), ease);
          bg.copy(SKY[a]).lerp(SKY[b], ease);
          for (let i = 0; i < biomes.length; i++) {
            const biome = biomes[i];
            if (!biome) continue;
            biome.group.visible = Math.abs(i - chapter) <= 1;
            if (biome.group.visible && !quiet) biome.update?.(time, dt);
          }
          for (const landmark of landmarks) {
            landmark.root.visible = Math.abs(landmark.index - chapter) <= 1;
            const raised = hovered?.type === 'project' && hovered.index === landmark.index;
            landmark.plaque.position.y = THREE.MathUtils.lerp(landmark.plaque.position.y, landmark.restY + (raised ? landmark.lift : 0), quiet ? 1 : DAMP(10, dt));
          }
        } else {
          chapter = 6;
          if (town && !quiet) town.update?.(time, dt);
          for (const actor of actors) {
            if (actor === hero || actor.disposed) continue;
            actor.previous.copy(actor.root.position);
            const paused = quiet || actor === girl || time < (actor.pauseUntil || 0);
            if (actor.pathLength > 0 && !paused ) {
              actor.routeTime = (actor.routeTime + dt * (actor.descriptor.speed || (actor.descriptor.working ? .32 : .8))) % actor.pathLength;
              let distance = actor.routeTime;
              for (let i = 0; i < actor.path.length; i++) {
                const length = actor.pathLengths[i];
                if (distance <= length && length > 0) {
                  actor.root.position.copy(actor.path[i]).lerp(actor.path[(i + 1) % actor.path.length], distance / length);
                  break;
                }
                distance -= length;
              }
            }
            npcDirection.subVectors(actor.root.position, actor.previous);
            if (actor === girl) {
              if (time < stareUntil) npcDirection.copy(camera.position).sub(actor.root.position);
              else npcDirection.set(-1, 0, 1);
            }
            face(actor, npcDirection, dt, quiet);
            if (actor.root.visible) animateActor(actor, quiet ? 0 : dt, !paused && npcDirection.length() > .001 && actor !== girl, quiet ? 0 : actor.root.position.distanceTo(actor.previous) / dt, actor === girl && time < stareUntil ? camera.position : undefined);
          }
          if (girl) {
            const end = girl.root.position;
            const start = positionOf(town?.spawn || town?.heroSpawn, [-22, .08, 4]);
            townWalk = quiet ? 1 : Math.min(1, townWalk + dt / Math.max(2, start.distanceTo(end) / 2.1));
            hero.root.position.copy(start).lerp(new THREE.Vector3(end.x - .83, end.y, end.z + .08), townWalk);
            npcDirection.subVectors(hero.root.position, previousHero);
            if (townWalk === 1) {
              if (time < stareUntil) npcDirection.copy(camera.position).sub(hero.root.position);
              else npcDirection.set(1, 0, 1);
            }
            face(hero, npcDirection, dt, quiet);
            hearts.visible = townWalk === 1;
            hearts.position.set(end.x - .4, end.y + 2.8 + (quiet ? 0 : Math.sin(time * 1.8) * .1), end.z);
            hearts.quaternion.copy(camera.quaternion);
          }
          movement.subVectors(hero.root.position, previousHero);
          animateActor(hero, quiet ? 0 : dt, !quiet && townWalk < 1 && movement.length() > .0008, quiet ? 0 : movement.length() / dt, time < stareUntil ? camera.position : undefined);
          // Both mixers and both root yaws are final before solving the pair.
          // Reduced motion presents the completed pose without a reach tween.
          if (girl && townWalk === 1 && hero.loaded && girl.loaded) {
            handBlend = quiet ? 1 : handBlend + (1 - handBlend) * DAMP(9, dt);
            handTarget.copy(hero.root.position).lerp(girl.root.position, .5);
            handTarget.y += Math.min(hero.height, girl.height) * .57;
            handTarget.z += .14;
            hero.avatar.applyHandTarget?.('L', handTarget, handBlend);
            girl.avatar.applyHandTarget?.('R', handTarget, handBlend);
          } else handBlend = 0;
          viewOffset.set(9, 13, 25);
          bg.set('#c8d6c5');
        }
        heroPosition.copy(hero.root.position);
        host.dataset.chapter = String(chapter);
        renderer.domElement.dataset.chapter = String(chapter);
        renderer.domElement.dataset.heroX = heroPosition.x.toFixed(5);
        renderer.domElement.dataset.progress = String(p);
        renderer.domElement.dataset.reducedMotion = String(quiet);
        renderer.domElement.dataset.townArrived = String(activeWorld === 'town' && Boolean(girl) && townWalk === 1);
        const paired = activeWorld === 'town' && girl && townWalk === 1;
        const leftContact = paired && hero.avatar.getHandPosition?.('L', heroHand);
        const rightContact = paired && girl.avatar.getHandPosition?.('R', partnerHand);
        const handDistance = leftContact && rightContact ? leftContact.distanceTo(rightContact) : null;
        // A one-centimetre skin-surface gap is contact, not merely completed travel.
        renderer.domElement.dataset.handHolding = String(handDistance !== null && handDistance < .01);
        renderer.domElement.dataset.handDistance = handDistance === null ? '' : handDistance.toFixed(5);
        renderer.domElement.dataset.staring = String(Boolean(paired && time < stareUntil && facesCamera(hero) && facesCamera(girl)));
        scene.fog.color.copy(bg);
        // Preserve a useful horizontal view on phones without shrinking the guide away.
        const narrow = clamp((1.25 - camera.aspect) / 1.25);
        viewOffset.z += narrow * 5;
        viewOffset.y += narrow * 2;
        desiredCamera.copy(heroPosition).add(viewOffset);
        const look = new THREE.Vector3(heroPosition.x + (activeWorld === 'town' ? 1 : 3.5) * (1 - narrow * .7), heroPosition.y + 2.2, heroPosition.z - 1.4);
        const snap = quiet || changedWorld || changedProgress && Math.abs(heroPosition.x - previousHero.x) > 52;
        camera.position.lerp(desiredCamera, snap ? 1 : DAMP(6, dt));
        target.lerp(look, snap ? 1 : DAMP(6, dt));
        camera.lookAt(target);
        sun.position.copy(heroPosition).add(new THREE.Vector3(-15, 26, 16));
        sun.target.position.copy(heroPosition);
        camera.updateMatrixWorld();
        if (activeWorld === 'town') {
          viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
          cameraFrustum.setFromProjectionMatrix(viewProjection);
          for (const actor of actors) {
            if (actor === hero || actor.disposed) continue;
            actorBounds.center.copy(actor.root.position);
            actorBounds.center.y += actor.height / 2;
            // Generous margin retains offscreen silhouettes that cast nearby shadows.
            actorBounds.radius = actor.height + 2;
            actor.root.visible = actor === girl || cameraFrustum.intersectsSphere(actorBounds);
          }
        }
        if (!quiet || dirty || changedProgress || changedWorld || !ready) {
          renderer.render(scene, camera);
          renderedLastFrame = true;
          dirty = false;
          if (!ready && assetsPrepared) {
            ready = true;
            renderer.domElement.dataset.ready = 'true';
            renderer.domElement.dataset.assetsReady = 'true';
            renderer.domElement.dataset.assetsState = assetError ? 'degraded' : 'loaded';
            host.dataset.assetsReady = 'true';
            host.dataset.ready = 'true';
            props.onReady?.();
          }
        }
        if (stamp - lastPositionAt > 250 || changedWorld || changedProgress) {
          lastPositionAt = stamp;
          const portal = activeWorld === 'trail' ? trailPortal.doorway : town?.portal?.mesh || town?.portal?.group || town?.portal;
          let portalScreen = null;
          if (portal?.isObject3D) {
            portal.getWorldPosition(screen);
            screen.y += 2.2;
            cameraDirection.copy(screen).sub(camera.position);
            const ahead = cameraDirection.dot(camera.getWorldDirection(new THREE.Vector3())) > 0;
            screen.project(camera);
            portalScreen = { x: (screen.x + 1) / 2, y: (1 - screen.y) / 2, visible: ahead && Math.abs(screen.x) < 1 && Math.abs(screen.y) < 1 && Math.abs(screen.z) < 1 };
          }
          props.onPosition?.({ chapter, x: heroPosition.x, y: heroPosition.y, z: heroPosition.z, portalScreen });
          const canvas = renderer.domElement;
          const { width, height } = canvas.getBoundingClientRect();
          const savedPointer = pointer.clone();
          const projectPoints = [];
          if (activeWorld === 'trail') {
            const landmark = landmarks[chapter];
            if (landmark) {
              (landmark.logo || landmark.face).getWorldPosition(screen);
              screen.project(camera);
              const x = (screen.x + 1) / 2, y = (1 - screen.y) / 2;
              let visible = x >= 0 && x <= 1 && y >= 0 && y <= 1 && Math.abs(screen.z) < 1;
              if (visible) {
                pointer.set(screen.x, screen.y);
                const hit = pick();
                visible = hit?.type === 'project' && hit.index === chapter;
              }
              projectPoints.push({ id: PROJECTS[chapter].id, index: chapter, x, y, visible, height: landmark.plaque.position.y, restHeight: landmark.restY });
            }
          }
          canvas.dataset.projectPoints = JSON.stringify(projectPoints);
          const npcPoints = [];
          if (activeWorld === 'town') {
            for (const actor of actors) {
              if (!actor.loaded || actor.disposed) continue;
              screen.copy(actor.root.position);
              screen.y += actor.height * .62;
              screen.project(camera);
              const x = (screen.x + 1) / 2, y = (1 - screen.y) / 2;
              let visible = x >= 0 && x <= 1 && y >= 0 && y <= 1 && Math.abs(screen.z) < 1;
              if (visible) {
                pointer.set(screen.x, screen.y);
                const hit = pick();
                visible = hit?.type === 'npc' && hit.actor === actor;
              }
              npcPoints.push({ id: actor.descriptor.id, name: actor === hero ? 'Abhishek' : actor.descriptor.name, x, y, visible });
            }
          }
          pointer.copy(savedPointer);
          canvas.dataset.npcPoints = JSON.stringify(npcPoints);
          canvas.dataset.npcHitPoints = JSON.stringify(npcPoints.map(point => ({ ...point, x: point.x * width, y: point.y * height })));
          canvas.dataset.portalPoint = JSON.stringify(portalScreen);
        }
      } catch (error) { fail(error); return; }
      raf = requestAnimationFrame(frame);
    }

    const trailPortal = makePortal();
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      const canvas = renderer.domElement;
      canvas.dataset.ready = 'false';
      canvas.dataset.assetsReady = 'false';
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' });
      host.appendChild(canvas);
      trail.add(makeTrail(), trailPortal.group);
      // The endpoint extends ten units beyond the final biome's edge.
      const tail = new THREE.PlaneGeometry(30, 40, 40, 32);
      tail.rotateX(-Math.PI / 2);
      const vertices = tail.attributes.position;
      for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i) + 327, z = vertices.getZ(i);
        vertices.setXYZ(i, x, groundHeight(x, z), z);
      }
      tail.computeVertexNormals();
      mesh(tail, GROUND[6], trail);
      for (let i = 0; i < PROJECTS.length; i++) {
        const landmark = makeLandmark(i);
        landmarks.push(landmark);
        trail.add(landmark.root);
      }
      hero = addActor({ id: 'hero', kind: 'hero', age: 'adult' }, scene, 2.2);
      hero.root.name = 'expedition-hero';
      hero.root.userData.action = { type: 'npc', actor: hero };
      const assetTasks = [upgradeActor(hero), loadWorld(), loadTown(), loadLogos()];
      resize();
      if (typeof ResizeObserver !== 'undefined') { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); }
      if (typeof IntersectionObserver !== 'undefined') {
        intersectionObserver = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting !== false; resume(); });
        intersectionObserver.observe(host);
      }
      const listen = (object, event, fn, options) => {
        object.addEventListener(event, fn, options);
        disposers.push(() => object.removeEventListener(event, fn, options));
      };
      listen(window, 'resize', resize, { passive: true });
      listen(document, 'visibilitychange', resume);
      listen(canvas, 'webglcontextlost', contextLost);
      listen(canvas, 'pointermove', pointerMove, { passive: true });
      listen(canvas, 'pointerleave', pointerLeave, { passive: true });
      listen(canvas, 'pointercancel', pointerLeave, { passive: true });
      listen(canvas, 'pointerdown', press, { passive: true });
      listen(canvas, 'pointerup', release, { passive: true });
      // Font loading is optional and does not delay the first usable frame.
      assetTasks.push((document.fonts?.ready || Promise.resolve()).then(() => {
        if (disposed) return;
        for (const landmark of landmarks) {
          const texture = titleTexture(PROJECTS[landmark.index]);
          if (texture) { landmark.face.material.map?.dispose(); landmark.face.material.map = texture; landmark.face.material.needsUpdate = true; }
        }
        dirty = true;
      }));
      void Promise.allSettled(assetTasks).then(results => {
        if (disposed) return;
        assetError ||= results.some(result => result.status === 'rejected');
        assetsPrepared = true;
        dirty = true;
      });
      resume();
    } catch (error) { fail(error); }

    return () => {
      disposed = true;
      actionsRef.current = null;
      pending.abort();
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      disposers.forEach(dispose => dispose());
      for (const actor of actors) { try { disposeActor(actor); } catch { /* Continue releasing other owners. */ } }
      for (const biome of biomes) { try { biome?.dispose?.(); } catch { /* Parent still owns GPU resources. */ } }
      try { town?.dispose?.(); } catch { /* Parent still owns GPU resources. */ }
      scene.traverse(object => { if (object.isInstancedMesh) object.dispose(); });
      sun.shadow.dispose();
      disposeGroup(scene);
      // This detached portal also needs disposal if renderer creation failed.
      if (!trailPortal.group.parent) disposeGroup(trailPortal.group);
      renderer?.renderLists.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      delete host.dataset.ready;
    };
  }, []);

  return <div ref={hostRef} className="expedition-scene" data-world={world === 'town' ? 'town' : 'trail'} data-chapter={chapterAt(progressOf(progress))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
    {avatarStatus !== 'ready' && <p className="expedition-avatar-status" role="status" style={{ position: 'absolute', zIndex: 2, left: '50%', bottom: '18%', transform: 'translateX(-50%)', color: '#fff4da', background: '#293e32', padding: '8px 14px', fontSize: 12, pointerEvents: 'none' }}>{avatarStatus === 'loading' ? 'Preparing your guide…' : 'The guide could not load. You can still explore every project.'}</p>}
    {world === 'town' && <details className="expedition-npc-controls" style={{ position: 'absolute', zIndex: 2, right: 16, top: 100, maxHeight: '42%', overflowY: 'auto', padding: 6, background: '#283e32e8', color: '#fff1d5', borderRadius: 4 }}>
      <summary style={{ padding: '10px 12px', cursor: 'pointer', fontSize: 12 }}>People nearby</summary>
      <nav aria-label="Town residents" style={{ display: 'grid', gap: 2 }}>
      {[{ id: 'hero', name: 'Abhishek', role: 'guide' }, ...residents].map(person => <button key={person.id} type="button" aria-label={`Talk to ${person.name}, ${person.role}`} onClick={() => actionsRef.current?.(person.id)} style={{ minHeight: 44, padding: '8px 12px', border: 0, background: 'transparent', color: '#fff1d5', font: 'inherit', fontSize: 12, textAlign: 'left', cursor: 'pointer' }}>{person.name}<span style={{ opacity: .75, fontSize: 10 }}> · {person.role}</span></button>)}
      </nav>
    </details>}
    {portalHint && <span className="expedition-portal-hint" style={{ position: 'absolute', zIndex: 2, left: portalHint.x, top: portalHint.y, transform: 'translate(-50%, -100%)', padding: '7px 11px', background: '#293e32', color: '#fff1d5', fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none' }}>{portalHint.text}</span>}
  </div>;
}
