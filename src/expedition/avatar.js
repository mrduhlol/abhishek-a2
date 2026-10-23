import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

// Quaternius Adventurer, CC0. Exact source and licence live beside the GLB.
// Its authored forward is +Z; only the caller moves/rotates the returned group.
const ASSET_URL = `${import.meta.env?.BASE_URL || '/'}expedition/character/adventurer.glb`;
const CLIPS = {
  idle: 'CharacterArmature|Idle_Neutral',
  walk: 'CharacterArmature|Walk',
  work: 'CharacterArmature|Interact',
};
const SAMPLE_COUNT = 64;
const HEIGHTS = { adult: 2.2, kid: 1.45, elder: 2.0 };
const PALETTES = [
  { coat: '#b57835', trim: '#e5bc72', trousers: '#3d4948', skin: '#b87d56', hair: '#30241f' },
  { coat: '#427f7c', trim: '#a2c0a0', trousers: '#3f4a61', skin: '#a96e4c', hair: '#2f2625' },
  { coat: '#a35d52', trim: '#dba17b', trousers: '#505343', skin: '#d39d75', hair: '#5c3d2c' },
  { coat: '#566d94', trim: '#b5b7be', trousers: '#58473c', skin: '#86563e', hair: '#25252c' },
  { coat: '#7c8950', trim: '#d6c391', trousers: '#4c424c', skin: '#c08b65', hair: '#48362e' },
];
let assetPromise;
let residentSerial = 0;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const damp = (a, b, dt, rate = 10) => a + (b - a) * (1 - Math.exp(-rate * dt));

function ageGroup(age, kind) {
  if (typeof age === 'number') return age < 14 ? 'kid' : age >= 65 ? 'elder' : 'adult';
  if (/child|kid|boy/.test(`${age} ${kind}`)) return 'kid';
  if (/elder|senior|old/.test(`${age} ${kind}`)) return 'elder';
  return 'adult';
}

function hash(text) {
  let value = 2166136261;
  for (const letter of text) value = Math.imul(value ^ letter.charCodeAt(0), 16777619);
  return value >>> 0;
}

function cleanShavenHair(THREE, scene, idle) {
  const model = cloneSkeleton(scene);
  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(idle).play();
  mixer.update(0);
  model.updateMatrixWorld(true);
  const hair = model.getObjectByName('Adventurer_Head_4');
  const head = model.getObjectByName('Head');
  if (!hair?.geometry.index || !head) throw new Error('Adventurer is missing its modular hair geometry');
  const { position } = hair.geometry.attributes;
  const index = hair.geometry.index;
  const parents = Array.from({ length: position.count }, (_, i) => i);
  const root = i => {
    while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i]; }
    return i;
  };
  const welded = new Map();
  const vertex = new THREE.Vector3();
  // The artist's scalp and beard tufts are separate closed components. Weld
  // normal/UV seams only for classification, then keep complete original tufts.
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const key = vertex.toArray().map(v => Math.round(v * 1e7)).join(',');
    if (welded.has(key)) parents[i] = welded.get(key);
    else welded.set(key, i);
  }
  for (let i = 0; i < index.count; i += 3) {
    const component = root(index.getX(i));
    parents[root(index.getX(i + 1))] = component;
    parents[root(index.getX(i + 2))] = component;
  }
  const bounds = new Map();
  for (let i = 0; i < position.count; i++) {
    const component = root(i);
    if (!bounds.has(component)) bounds.set(component, new THREE.Box3());
    hair.getVertexPosition(i, vertex).applyMatrix4(hair.matrixWorld);
    bounds.get(component).expandByPoint(vertex);
  }
  const origin = head.getWorldPosition(new THREE.Vector3());
  const beard = new Set();
  for (const [component, box] of bounds) {
    if (box.max.y < origin.y + 0.085
      || (box.min.y < origin.y + 0.04 && box.min.z > origin.z + 0.003)) beard.add(component);
  }
  const cleanIndex = [];
  for (let i = 0; i < index.count; i += 3) {
    if (!beard.has(root(index.getX(i)))) cleanIndex.push(index.getX(i), index.getX(i + 1), index.getX(i + 2));
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(model);
  return cleanIndex;
}

// Sample the actual skinned soles once, not bounding boxes of unposed geometry.
// Ground curves preserve the authored body bounce without a per-frame vertex scan.
function measureMotion(THREE, scene, clip) {
  const model = cloneSkeleton(scene);
  const mixer = new THREE.AnimationMixer(model);
  const feet = model.getObjectByName('Adventurer_Feet');
  const left = model.getObjectByName('FootL');
  const right = model.getObjectByName('FootR');
  if (!feet || !left || !right) throw new Error('Adventurer GLB is missing its foot rig');
  const action = mixer.clipAction(clip).play();
  const floor = new Float32Array(SAMPLE_COUNT + 1);
  const box = new THREE.Box3();
  const current = [new THREE.Vector3(), new THREE.Vector3()];
  const previous = current.map(v => v.clone());
  const velocities = [];
  const step = clip.duration / SAMPLE_COUNT;
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    mixer.setTime(i * step);
    model.updateMatrixWorld(true);
    floor[i] = box.setFromObject(feet, true).min.y;
    left.getWorldPosition(current[0]);
    right.getWorldPosition(current[1]);
    for (let foot = 0; foot < 2; foot++) {
      const velocity = (previous[foot].z - current[foot].z) / step;
      // Only the backward-moving, planted part of the stride measures travel.
      if (i && current[foot].y < floor[i] + 0.065 && velocity > 0.1) velocities.push(velocity);
      previous[foot].copy(current[foot]);
    }
  }
  floor[SAMPLE_COUNT] = floor[0];
  velocities.sort((a, b) => a - b);
  action.stop();
  mixer.uncacheRoot(model);
  return { floor, speed: velocities[Math.floor(velocities.length / 2)] || 0 };
}

function loadAsset(THREE) {
  if (!assetPromise) {
    assetPromise = new GLTFLoader().loadAsync(ASSET_URL).then(gltf => {
      const idle = gltf.animations.find(clip => clip.name === CLIPS.idle);
      const walk = gltf.animations.find(clip => clip.name === CLIPS.walk);
      const work = gltf.animations.find(clip => clip.name === CLIPS.work);
      let skinned = false;
      gltf.scene?.traverse(node => { skinned ||= Boolean(node.isSkinnedMesh); });
      if (!skinned || !idle || !walk || !work) {
        throw new Error(`Expected a skinned Adventurer and clips ${Object.values(CLIPS).join(', ')}`);
      }
      const idleMotion = measureMotion(THREE, gltf.scene, idle);
      const walkMotion = measureMotion(THREE, gltf.scene, walk);
      if (!(walkMotion.speed > 0)) throw new Error('Adventurer walk has no measurable planted stride');
      // Interact is a gentle reach. Keep only upper-body rotation, additive to idle;
      // neither its root motion nor its leg pose should disturb planted feet.
      const upperBodyWork = work.clone();
      upperBodyWork.name = 'Expedition_UpperBody_Interact';
      upperBodyWork.tracks = upperBodyWork.tracks.filter(track =>
        /^(Chest|UpperArm[LR]|LowerArm[LR])\.quaternion$/.test(track.name));
      THREE.AnimationUtils.makeClipAdditive(upperBodyWork, 0, idle);
      const cleanHairIndex = cleanShavenHair(THREE, gltf.scene, idle);
      return { scene: gltf.scene, idle, walk, work: upperBodyWork, idleMotion, walkMotion, cleanHairIndex };
    }).catch(cause => {
      assetPromise = undefined; // Allow a later retry after a transient fetch failure.
      throw new Error(`Unable to load rigged expedition avatar (${ASSET_URL}): ${cause.message}`, { cause });
    });
  }
  return assetPromise;
}

function groundAt(samples, action) {
  const phase = ((action.time / action.getClip().duration) % 1 + 1) % 1 * SAMPLE_COUNT;
  const index = Math.floor(phase);
  return samples[index] + (samples[index + 1] - samples[index]) * (phase - index);
}

function dress(model, kind, age, seed, cleanHairIndex) {
  const palette = PALETTES[kind === 'hero' ? 0 : seed % PALETTES.length];
  const materials = new Map();
  const geometries = new Map();
  const hasPack = kind === 'hero' || /walker|traveler|explorer/.test(kind) || age === 'kid';
  const cleanShaven = age === 'kid' || /girl|woman|gardener|shopkeeper|couple-a/.test(kind)
    || (kind !== 'hero' && age !== 'elder' && seed % 2 === 0);
  model.traverse(node => {
    if (node.name === 'Backpack') node.visible = hasPack;
    if (!node.isMesh) return;
    // Geometry is cloned too: the runtime owns traversal-based GPU disposal,
    // so destroying one resident must not invalidate the cached source/others.
    if (!geometries.has(node.geometry)) geometries.set(node.geometry, node.geometry.clone());
    node.geometry = geometries.get(node.geometry);
    if (cleanShaven && node.name === 'Adventurer_Head_4') node.geometry.setIndex(cleanHairIndex);
    const isPack = node.name.startsWith('Backpack');
    const recolor = source => {
      const key = `${source.uuid}:${isPack}`;
      if (materials.has(key)) return materials.get(key);
      const material = source.clone();
      const colors = {
        Green: isPack ? '#426c68' : palette.coat,
        LightGreen: isPack ? '#7eaaa0' : palette.trim,
        Brown: isPack ? '#714d32' : palette.trousers,
        Brown2: '#755339',
        Black: '#292c2b',
        Grey: '#535956',
        Skin: palette.skin,
        Hair: age === 'elder' ? '#bbc1bd' : palette.hair,
        Eyebrows: age === 'elder' ? '#969e9c' : palette.hair,
        Eye: '#211f22',
        Gold: '#ccab63',
      };
      if (colors[source.name]) material.color.set(colors[source.name]);
      material.metalness = source.name === 'Gold' ? 0.55 : 0;
      material.roughness = source.name === 'Gold' ? 0.4 : source.name === 'Skin' ? 0.78 : 0.9;
      materials.set(key, material);
      return material;
    };
    node.material = Array.isArray(node.material) ? node.material.map(recolor) : recolor(node.material);
    node.castShadow = true;
    node.receiveShadow = true;
    // Animated bounds vary. There are few characters, and static bind-pose
    // culling would otherwise make a moving limb or backpack vanish.
    node.frustumCulled = false;
  });
}

/**
 * A +Z-facing rigged character, normalized to feet y=0. lookAt is a world-space
 * Vector3 (or [x,y,z]); speed is actual world units/second, not an input axis.
 * Caller owns group positioning/yaw and geometry/material disposal. dispose()
 * releases the animation bindings and skeleton GPU resources, and is idempotent.
 */
export async function createAvatar({ THREE, kind = 'hero', age = 'adult' }) {
  if (!THREE?.AnimationMixer) throw new TypeError('createAvatar requires the renderer THREE namespace');
  const asset = await loadAsset(THREE);
  const group = new THREE.Group();
  group.name = `avatar-${kind}`;
  const visual = new THREE.Group();
  visual.name = 'normalized-character';
  const model = cloneSkeleton(asset.scene);
  const category = ageGroup(age, kind);
  const variation = /^(npc|resident|town)$/.test(kind) ? residentSerial++ : 0;
  const seed = hash(`${kind}:${age}:${variation}`);
  dress(model, kind, category, seed, asset.cleanHairIndex);
  visual.add(model);
  group.add(visual);
  const head = model.getObjectByName('Head');
  // A small head/body ratio adjustment reads as youth without stretching limbs
  // or moving joints. Adult and elder skeleton proportions remain authored.
  if (head && category === 'kid') head.scale.multiplyScalar(1.08);
  const mixer = new THREE.AnimationMixer(model);
  const idle = mixer.clipAction(asset.idle).play();
  const walk = mixer.clipAction(asset.walk).setEffectiveWeight(0).play();
  const work = mixer.clipAction(asset.work).setEffectiveWeight(0).play();
  work.timeScale = 0.65;
  mixer.update(0);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model, true);
  const nativeHeight = bounds.max.y - bounds.min.y;
  if (!(nativeHeight > 0) || !Number.isFinite(nativeHeight)) {
    mixer.stopAllAction();
    mixer.uncacheRoot(model);
    throw new Error('Adventurer GLB has invalid posed bounds');
  }
  const scale = HEIGHTS[category] / nativeHeight;
  visual.scale.setScalar(scale);
  visual.position.y = -bounds.min.y * scale;
  group.userData.avatar = { kind, age: category, height: HEIGHTS[category], forward: '+Z', source: ASSET_URL };
  // Populate posed bounds for the renderer's optional initial fitting pass.
  group.updateMatrixWorld(true);
  model.traverse(node => { if (node.isSkinnedMesh) node.computeBoundingBox(); });

  let walkWeight = 0;
  let workWeight = 0;
  let gazeYaw = 0;
  let gazePitch = 0;
  let disposed = false;
  const gaze = new THREE.Vector3();
  const headPosition = new THREE.Vector3();
  const inverseHead = new THREE.Quaternion();
  const gazeRotation = new THREE.Quaternion();
  const gazeEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  const animatedHead = head?.quaternion.clone();
  const worldScale = new THREE.Vector3();
  const arms = {};
  const skin = model.getObjectByName('Adventurer_Body_3');
  for (const side of ['L', 'R']) {
    const upper = model.getObjectByName(`UpperArm${side}`);
    const lower = model.getObjectByName(`LowerArm${side}`);
    const wrist = model.getObjectByName(`Wrist${side}`);
    const middle = model.getObjectByName(`Middle2${side}`);
    if (!skin || !upper || !lower || !wrist || !middle) continue;
    const descendants = new Set();
    wrist.traverse(bone => descendants.add(bone));
    const desired = wrist.getWorldPosition(new THREE.Vector3())
      .lerp(middle.getWorldPosition(new THREE.Vector3()), 0.55);
    // Select a real palm-edge vertex, wholly weighted to the hand hierarchy.
    // This remains a skin-surface measurement, even as the fingers animate.
    desired.x += (side === 'L' ? 1 : -1) * 0.025;
    const { skinIndex, skinWeight, position } = skin.geometry.attributes;
    let vertexIndex = -1, nearest = Infinity;
    const point = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      let handWeight = 0;
      for (let k = 0; k < 4; k++) {
        if (descendants.has(skin.skeleton.bones[skinIndex.getComponent(i, k)])) handWeight += skinWeight.getComponent(i, k);
      }
      if (handWeight < 0.99) continue;
      skin.getVertexPosition(i, point).applyMatrix4(skin.matrixWorld);
      const distance = point.distanceToSquared(desired);
      if (distance < nearest) { nearest = distance; vertexIndex = i; }
    }
    if (vertexIndex >= 0) arms[side] = {
      upper, lower, vertexIndex,
      animatedUpper: upper.quaternion.clone(), animatedLower: lower.quaternion.clone(),
    };
  }
  const shoulder = new THREE.Vector3(), elbow = new THREE.Vector3(), contact = new THREE.Vector3();
  const axis = new THREE.Vector3(), pole = new THREE.Vector3(), bend = new THREE.Vector3();
  const desiredElbow = new THREE.Vector3(), reachable = new THREE.Vector3();
  const from = new THREE.Vector3(), to = new THREE.Vector3();
  const turn = new THREE.Quaternion(), parentRotation = new THREE.Quaternion(), bodyRotation = new THREE.Quaternion();
  const beforeUpper = new THREE.Quaternion(), beforeLower = new THREE.Quaternion();

  function refreshRig() {
    group.updateWorldMatrix(true, false);
    group.updateMatrixWorld(true);
  }

  function getHandPosition(side, out = new THREE.Vector3()) {
    const arm = arms[side];
    if (disposed || !arm) return null;
    refreshRig();
    return skin.getVertexPosition(arm.vertexIndex, out).applyMatrix4(skin.matrixWorld);
  }

  function aimBone(bone, current, desired, origin, limit) {
    from.subVectors(current, origin).normalize();
    to.subVectors(desired, origin).normalize();
    turn.setFromUnitVectors(from, to);
    const angle = 2 * Math.acos(clamp(Math.abs(turn.w), 0, 1));
    if (angle > limit) turn.identity().slerp(new THREE.Quaternion().setFromUnitVectors(from, to), limit / angle);
    bone.parent.getWorldQuaternion(parentRotation);
    turn.premultiply(parentRotation.clone().invert()).multiply(parentRotation);
    bone.quaternion.premultiply(turn).normalize();
    refreshRig();
  }

  // Run only after animation and caller-owned root transforms. The two rigid
  // segments end at the selected skin vertex, so no bone translation, stretch,
  // helper geometry or wrist teleport is used to manufacture contact.
  function applyHandTarget(side, worldPoint, strength = 1) {
    const arm = arms[side];
    if (disposed || !arm || !worldPoint || ![worldPoint.x, worldPoint.y, worldPoint.z].every(Number.isFinite)) return null;
    getHandPosition(side, contact);
    arm.upper.getWorldPosition(shoulder);
    arm.lower.getWorldPosition(elbow);
    beforeUpper.copy(arm.upper.quaternion);
    beforeLower.copy(arm.lower.quaternion);
    const upperLength = shoulder.distanceTo(elbow), lowerLength = elbow.distanceTo(contact);
    axis.subVectors(worldPoint, shoulder);
    const distance = clamp(axis.length(), Math.abs(upperLength - lowerLength) + 0.005, (upperLength + lowerLength) * 0.98);
    if (axis.lengthSq() < 1e-8) return getHandPosition(side);
    axis.normalize();
    reachable.copy(shoulder).addScaledVector(axis, distance);
    group.getWorldQuaternion(bodyRotation);
    // Elbows hang slightly out/back; the pole stays in the character's frame
    // while the shared target stays in world space through the camera turn.
    pole.set(side === 'L' ? 0.8 : -0.8, -1, -0.35).applyQuaternion(bodyRotation);
    bend.copy(pole).addScaledVector(axis, -pole.dot(axis)).normalize();
    const along = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
    const across = Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2));
    desiredElbow.copy(shoulder).addScaledVector(axis, along).addScaledVector(bend, across);
    aimBone(arm.upper, elbow, desiredElbow, shoulder, 1.65);
    arm.lower.getWorldPosition(elbow);
    getHandPosition(side, contact);
    aimBone(arm.lower, contact, reachable, elbow, 2.2);
    const weight = clamp(Number.isFinite(strength) ? strength : 0, 0, 1);
    arm.upper.quaternion.slerp(beforeUpper, 1 - weight);
    arm.lower.quaternion.slerp(beforeLower, 1 - weight);
    return getHandPosition(side);
  }
  // Desynchronise residents while leaving the hero's initial fit exact.
  if (kind !== 'hero') {
    idle.time = (seed % 997) / 997 * asset.idle.duration;
    walk.time = (seed % 787) / 787 * asset.walk.duration;
    work.time = (seed % 617) / 617 * asset.work.duration;
  }

  function update(dt, { moving = false, speed = 0, lookAt, working = false } = {}) {
    if (disposed || !Number.isFinite(dt) || dt < 0) return;
    for (const arm of Object.values(arms)) {
      arm.upper.quaternion.copy(arm.animatedUpper);
      arm.lower.quaternion.copy(arm.animatedLower);
    }
    dt = Math.min(dt, 0.1);
    const travelSpeed = Number.isFinite(speed) ? Math.abs(speed) : 0;
    const walking = Boolean(moving) && travelSpeed > 0.005;
    walkWeight = damp(walkWeight, walking ? 1 : 0, dt, 12);
    workWeight = damp(workWeight, working && !walking ? 0.42 : 0, dt, 7);
    idle.setEffectiveWeight(1 - walkWeight);
    walk.setEffectiveWeight(walkWeight);
    work.setEffectiveWeight(workWeight);
    group.getWorldScale(worldScale);
    const strideSpeed = asset.walkMotion.speed * scale * Math.abs(worldScale.z);
    // Direct distance-based cadence; do not smooth/clamp the gait independently
    // of travel, which causes foot skating during scroll acceleration.
    walk.setEffectiveTimeScale(walking ? travelSpeed / Math.max(strideSpeed, 0.001) : 0);
    if (head) head.quaternion.copy(animatedHead); // Never accumulate gaze onto gaze.
    mixer.update(dt);
    for (const arm of Object.values(arms)) {
      arm.animatedUpper.copy(arm.upper.quaternion);
      arm.animatedLower.copy(arm.lower.quaternion);
    }
    visual.position.y = -scale * (
      groundAt(asset.idleMotion.floor, idle) * (1 - walkWeight)
      + groundAt(asset.walkMotion.floor, walk) * walkWeight
    );
    if (head) {
      animatedHead.copy(head.quaternion);
      let yaw = 0, pitch = 0;
      if (lookAt) {
        if (Array.isArray(lookAt)) gaze.fromArray(lookAt);
        else gaze.set(lookAt.x, lookAt.y, lookAt.z);
        if (Number.isFinite(gaze.x) && Number.isFinite(gaze.y) && Number.isFinite(gaze.z)) {
          head.getWorldPosition(headPosition);
          head.getWorldQuaternion(inverseHead).invert();
          gaze.sub(headPosition).applyQuaternion(inverseHead);
          if (gaze.lengthSq() > 0.0001) {
            yaw = clamp(Math.atan2(gaze.x, gaze.z), -0.65, 0.65);
            pitch = clamp(-Math.atan2(gaze.y, Math.hypot(gaze.x, gaze.z)), -0.25, 0.28);
          }
        }
      }
      gazeYaw = damp(gazeYaw, yaw, dt, 5);
      gazePitch = damp(gazePitch, pitch, dt, 5);
      gazeEuler.set(gazePitch, gazeYaw, 0, 'YXZ');
      gazeRotation.setFromEuler(gazeEuler);
      head.quaternion.multiply(gazeRotation);
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    mixer.stopAllAction();
    mixer.uncacheRoot(model);
    const skeletons = new Set();
    model.traverse(node => { if (node.skeleton) skeletons.add(node.skeleton); });
    skeletons.forEach(skeleton => skeleton.dispose());
  }

  return { group, update, applyHandTarget, getHandPosition, dispose };
}

export default createAvatar;
