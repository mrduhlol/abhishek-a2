import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PROJECTS } from '../src/data/projects.js';
import { createKit, disposeGroup } from '../src/expedition/kit.js';
import {
  chapterAt, clamp, END_X, groundHeight, pathY, pathZ,
  projectProgress, routeAt, SEGMENT, START_X,
} from '../src/expedition/route.js';

const terrains = ['mountain', 'forest', 'grassland', 'desert', 'ocean', 'cave', 'volcano'];

test('seven distinct project destinations retain valid repository and optional live URLs', () => {
  assert.equal(PROJECTS.length, 7);
  assert.equal(new Set(PROJECTS.map(project => project.id)).size, 7);
  assert.deepEqual(PROJECTS.map(project => project.terrain), terrains);
  for (const project of PROJECTS) {
    const source = new URL(project.github);
    assert.equal(source.protocol, 'https:');
    assert.equal(source.hostname, 'github.com');
    assert.match(source.pathname, /^\/[^/]+\/[^/]+\/?$/);
    assert.ok(project.description.length > 30, `${project.name} needs useful details`);
    assert.ok(project.tech.length > 0);
    if (project.live !== null) assert.equal(new URL(project.live).protocol, 'https:');
  }
});

test('route endpoints clamp, project targets reach their actual chapters, and progress is continuous', () => {
  assert.equal(clamp(-1), 0);
  assert.equal(clamp(2), 1);
  assert.deepEqual(routeAt(-1), routeAt(0));
  assert.deepEqual(routeAt(2), routeAt(1));
  assert.equal(routeAt(0).x, START_X);
  assert.equal(routeAt(1).x, END_X);
  assert.equal(chapterAt(0), 0);
  assert.equal(chapterAt(1), 6);
  let previous = routeAt(0);
  for (let step = 1; step <= 2000; step++) {
    const current = routeAt(step / 2000);
    assert.ok(Object.values(current).every(Number.isFinite));
    assert.ok(current.x > previous.x, 'Forward progress must advance along the trail');
    assert.ok(Math.hypot(current.x - previous.x, current.y - previous.y, current.z - previous.z) < .25,
      'The route must not jump at chapter boundaries');
    assert.ok(Math.abs(current.y - groundHeight(current.x, current.z) - .06) < 1e-9,
      'The walking route must follow the terrain surface');
    previous = current;
  }
  for (let index = 0; index < 7; index++) {
    const progress = projectProgress(index);
    assert.equal(chapterAt(progress), index);
    assert.ok(Math.abs(routeAt(progress).x - index * SEGMENT) < 1e-9);
    if (index) assert.ok(progress > projectProgress(index - 1));
    const seam = index * SEGMENT + SEGMENT / 2;
    for (const z of [pathZ(seam) - 1, pathZ(seam), pathZ(seam) + 1]) {
      assert.ok(Math.abs(groundHeight(seam - 1e-6, z) - groundHeight(seam + 1e-6, z)) < 1e-5);
    }
  }
});

for (const [index, terrain] of terrains.entries()) {
  test(`${terrain}: actual biome builds finite geometry, updates, leaves the walking corridor clear, and disposes`, async () => {
    // Import the real module: a missing or broken biome must fail, never silently use a sketch.
    const { default: buildBiome } = await import(`../src/expedition/biomes/${terrain}.js`);
    const kit = createKit(index);
    const biome = await buildBiome({ THREE, kit, index });
    assert.ok(biome?.group?.isObject3D, `${terrain} must return its scene group`);
    try {
      for (const time of [0, 1 / 60, 1, 30]) biome.update?.(time, 1 / 60);
      biome.group.updateMatrixWorld(true);
      const geometries = new Set();
      let meshes = 0;
      biome.group.traverse(object => {
        assert.ok(object.matrixWorld.elements.every(Number.isFinite), `${terrain}: non-finite world transform`);
        if (!object.isMesh) return;
        meshes++;
        if (object.instanceMatrix) {
          assert.ok(object.instanceMatrix.array.every(Number.isFinite), `${terrain}: non-finite instance transform`);
        }
        geometries.add(object.geometry);
      });
      let vertices = 0;
      for (const geometry of geometries) {
        const positions = geometry.getAttribute('position');
        assert.ok(positions?.count > 0, `${terrain}: empty geometry`);
        vertices += positions.count;
        for (const [name, attribute] of Object.entries(geometry.attributes)) {
          assert.ok(attribute.array.every(Number.isFinite), `${terrain}: non-finite ${name}`);
        }
        geometry.computeBoundingBox();
        assert.ok([...geometry.boundingBox.min, ...geometry.boundingBox.max].every(Number.isFinite));
      }
      assert.ok(meshes > 1 && vertices > 100, `${terrain} must contain scenery beyond a ground plane`);

      // A sparse physical smoke check of the central walking volume, independent of colors or styling.
      const ray = new THREE.Raycaster();
      for (const x of [-20, -10, 0, 10, 20]) {
        const z = kit.pathZ(x), floor = kit.height(x, z);
        assert.ok(Math.abs(floor - pathY(x + index * SEGMENT)) < 1e-9);
        ray.set(new THREE.Vector3(x, floor + 1.8, z), new THREE.Vector3(0, -1, 0));
        ray.near = 0;
        ray.far = 1.4;
        const obstacles = ray.intersectObject(biome.group, true).filter(hit => {
          for (let object = hit.object; object; object = object.parent) if (!object.visible) return false;
          const material = Array.isArray(hit.object.material) ? hit.object.material[hit.face.materialIndex] : hit.object.material;
          return material?.visible !== false && !material?.transparent;
        });
        assert.equal(obstacles.length, 0, `${terrain}: scenery occupies the walking corridor at local x=${x}`);
      }
    } finally {
      biome.dispose?.();
      disposeGroup(biome.group);
    }
  });
}
