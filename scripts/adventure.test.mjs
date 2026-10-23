import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { PROJECTS } from "../src/data/projects.js";
import { createTerrain } from "../src/world/terrain.js";

test("all seven project destinations are explicit and source links are valid", () => {
  assert.equal(PROJECTS.length, 7);
  assert.equal(new Set(PROJECTS.map((p) => p.id)).size, 7);
  assert.equal(new Set(PROJECTS.map((p) => p.terrain)).size, 7);
  for (const project of PROJECTS) {
    assert.equal(new URL(project.github).hostname, "github.com");
    assert.ok(project.description.length > 30);
    assert.ok(
      project.live === null || new URL(project.live).protocol === "https:",
    );
  }
});
for (const project of PROJECTS) {
  test(`${project.terrain} geometry is finite, visible, and disposable`, async () => {
    let override;
    const modules = await readdir(
      new URL("../src/world/terrains/", import.meta.url),
    ).catch(() => []);
    if (modules.includes(`${project.terrain}.js`))
      override = (await import(`../src/world/terrains/${project.terrain}.js`))
        .default;
    const drawing = createTerrain(project.terrain, override);
    let vertices = 0;
    drawing.group.traverse((object) => {
      const position = object.geometry?.getAttribute("position");
      if (position) {
        for (const value of position.array)
          assert.ok(
            Number.isFinite(value),
            `Non-finite position in ${project.terrain}`,
          );
        vertices += position.count;
      }
    });
    assert.ok(vertices > 100, "Terrain must contain an actual scene");
    assert.ok(
      vertices < 100000,
      "Terrain geometry must remain within mobile budget",
    );
    assert.doesNotThrow(() => drawing.dispose());
  });
}
