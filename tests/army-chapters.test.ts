import test from "node:test";
import assert from "node:assert/strict";
import { armyChapters, armyGeography } from "../src/armyChapters.ts";
import {
  centralRoute,
  contextRoutes,
  journeyRouteCities,
} from "../src/journeyMap.ts";
import {
  armyAtlasLayout,
  armyAtlasPath,
  atlasMobilePath,
  atlasSelection,
  atlasMapHref,
} from "../src/atlas.ts";
import { atlasDetail } from "../src/details.ts";

test("each army uses the verified journey route and only its own geographic places", () => {
  armyChapters.forEach((chapter, index) => {
    const map = armyGeography(index);
    assert.equal(
      map.points,
      index === 0 ? centralRoute : contextRoutes[index - 1].points,
    );
    assert.deepEqual(
      map.cities,
      journeyRouteCities.filter((city) => city.armies.includes(index)),
    );
    const detail = atlasDetail(
      "armies",
      new URLSearchParams({ army: chapter.id }),
    );
    assert.equal(detail?.params.get("army"), chapter.id);
    assert.equal(detail?.title, chapter.name);
  });
});

test("comparison resolves to its own fifth node and returns to that selection", () => {
  const params = new URLSearchParams("view=reading&stop=5&focus=comparison");
  assert.equal(atlasDetail("armies", params)?.title, "四路对照");
  assert.equal(
    atlasDetail("armies", params)?.params.get("focus"),
    "comparison",
  );
  assert.equal(atlasSelection("armies", params), 5);
  assert.equal(atlasMapHref("armies", params), "#/armies?stop=5");
});

test("four armies connect along a curve while comparison stays separate in both layouts", () => {
  const { desktop, mobile } = armyAtlasLayout();
  assert.ok(desktop.slice(0, 4).every((p) => p[1] < desktop[4][1]));
  assert.equal(mobile.points[4][0], 50);
  assert.ok(mobile.points.slice(0, 2).every((p) => p[1] < mobile.points[4][1]));
  assert.ok(mobile.points.slice(2, 4).every((p) => p[1] > mobile.points[4][1]));
  for (const [points, height] of [
    [desktop, 400],
    [mobile.points, mobile.height],
  ] as const) {
    assert.equal(
      armyAtlasPath(points, undefined, height),
      atlasMobilePath(points.slice(0, 4), height),
    );
    assert.equal((armyAtlasPath(points).match(/C /g) || []).length, 3);
    assert.equal(armyAtlasPath(points, 5, height), "");
    for (let i = 1; i <= 4; i++)
      assert.equal(
        armyAtlasPath(points, i, height),
        atlasMobilePath(points.slice(0, i), height),
      );
  }
});
