import * as THREE from "three";
import { groundHeight, pathZ, SEGMENT } from "./route.js";
export function createKit(index = 0, flat = false) {
  const group = new THREE.Group();
  let state = (index + 1) * 1709;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const height = (x, z) => (flat ? 0 : groundHeight(x + index * SEGMENT, z));
  const material = (color, options = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.88, ...options });
  const mesh = (
    geometry,
    mat,
    position = [0, 0, 0],
    scale = [1, 1, 1],
    rotation = [0, 0, 0],
  ) => {
    const object = new THREE.Mesh(
      geometry,
      mat?.isMaterial ? mat : material(mat),
    );
    object.position.fromArray(position);
    object.scale.fromArray(scale);
    object.rotation.set(...rotation);
    object.castShadow = true;
    object.receiveShadow = true;
    group.add(object);
    return object;
  };
  const box = (color, position, scale, rotation) =>
    mesh(new THREE.BoxGeometry(1, 1, 1), color, position, scale, rotation);
  const rock = (color, position, scale, seed = 1) => {
    const geometry = new THREE.IcosahedronGeometry(1, 1);
    const a = geometry.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const f =
        0.86 +
        0.18 *
          Math.sin(a.getX(i) * 17 + a.getY(i) * 23 + a.getZ(i) * 31 + seed);
      a.setXYZ(i, a.getX(i) * f, a.getY(i) * f, a.getZ(i) * f);
    }
    geometry.computeVertexNormals();
    return mesh(
      geometry,
      material(color, { flatShading: true }),
      position,
      scale,
      [0, seed * 0.7, seed * 0.13],
    );
  };
  const ground = (color, options = {}) => {
    const n = options.segments || 64;
    const geo = new THREE.PlaneGeometry(48, 40, n, Math.ceil(n * 0.65));
    geo.rotateX(-Math.PI / 2);
    const a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) a.setY(i, height(a.getX(i), a.getZ(i)));
    geo.computeVertexNormals();
    const object = mesh(
      geo,
      material(color, { roughness: options.roughness ?? 1 }),
    );
    object.castShadow = false;
    return object;
  };
  return {
    group,
    random,
    height,
    pathZ: (x) => pathZ(x + index * SEGMENT),
    material,
    mesh,
    box,
    rock,
    ground,
  };
}
export function disposeGroup(group) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  group.traverse((o) => {
    if (o.geometry) geometries.add(o.geometry);
    for (const m of Array.isArray(o.material)
      ? o.material
      : o.material
        ? [o.material]
        : []) {
      materials.add(m);
      for (const value of Object.values(m))
        if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}
