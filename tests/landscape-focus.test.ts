import test from "node:test";
import assert from "node:assert/strict";
import { focalPan } from "../src/landscapeFocus.ts";
import { atlasRoutes } from "../src/atlas.ts";
import { panoramas } from "../src/panoramas.ts";

test("all eight module maps and 22 panoramas have explicit mobile subject framing", () => {
  const scenes = [...Object.values(atlasRoutes), ...panoramas];
  assert.equal(scenes.length, 30);
  for (const scene of scenes) {
    assert.ok(scene.mobileFocusX > 0 && scene.mobileFocusX < 1, scene.image);
    for (const viewport of [320, 390, 430]) {
      const width = 1920;
      const pan = focalPan(scene.mobileFocusX, width, viewport);
      const subjectOnScreen =
        scene.mobileFocusX * width - pan * (width - viewport);
      assert.ok(Math.abs(subjectOnScreen - viewport / 2) < 0.001, scene.image);
    }
  }
});

test("focal framing clamps at image edges and handles an image with no travel", () => {
  assert.equal(focalPan(0, 1920, 390), 0);
  assert.equal(focalPan(1, 1920, 390), 1);
  assert.equal(focalPan(0.8, 390, 390), 0.5);
  assert.equal(focalPan(0.8, 300, 390), 0.5);
});
