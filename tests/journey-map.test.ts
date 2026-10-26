import test from "node:test";
import assert from "node:assert/strict";
import {
  centralRoute,
  expandedJourneyFrame,
  contextRoutes,
  journeyLocations,
  journeyPanBounds,
  layoutJourneyLabels,
  journeyRouteCities,
  layoutJourneyCities,
  projectJourney,
} from "../src/journeyMap.ts";
import { milestones } from "../src/data.ts";

test("22 geographic anchors match the existing chapters and stay within the regional map", () => {
  assert.equal(journeyLocations.length, milestones.length);
  assert.equal(
    new Set(journeyLocations.map((s) => s.point.join(","))).size,
    22,
  );
  for (const stop of journeyLocations) {
    const [x, y] = projectJourney(stop.point);
    assert.ok(x > 0 && x < 1000 && y > 0 && y < 900);
  }
  const yudu = projectJourney(journeyLocations[0].point),
    wuqi = projectJourney(journeyLocations[20].point);
  assert.ok(wuqi[0] < yudu[0] && wuqi[1] < yudu[1], "吴起应位于于都的西北");
  assert.ok(journeyLocations[11].point[0] < 104, "威逼昆明不能定位到贵州盘县");
  assert.ok(
    journeyLocations[16].point[1] > journeyLocations[15].point[1],
    "达维会师在夹金山北麓",
  );
});

test("four-way pan is available at default zoom and cannot expose terrain edges", () => {
  for (const [width, height, x, y, pageWidth, pageHeight] of [
    [630, 517, 150, 180, 1280, 720],
    [283, 232, 18.5, 160, 320, 568],
    [358, 448, 16, 208, 390, 844],
  ]) {
    const origin = { x, y },
      page = { width: pageWidth, height: pageHeight };
    for (const zoom of [1, 1.5, 3, 6]) {
      const frame = expandedJourneyFrame(width, width * zoom, origin);
      const bounds = journeyPanBounds(
        width,
        width * zoom,
        height,
        origin,
        page,
      );
      assert.ok(bounds.minX < 0 && bounds.maxX > 0);
      assert.ok(bounds.minY < 0 && bounds.maxY > 0);
      for (const dx of [bounds.minX, bounds.maxX])
        for (const dy of [bounds.minY, bounds.maxY]) {
          assert.ok(frame.left + dx <= 1e-8);
          assert.ok(frame.top + dy <= 1e-8);
          assert.ok(frame.left + frame.width + dx >= pageWidth - 1e-8);
          assert.ok(frame.top + frame.height + dy >= pageHeight - 1e-8);
        }
      if (zoom === 1) {
        assert.ok(bounds.maxX <= 120 && bounds.minX >= -120);
        assert.ok(bounds.maxY <= 90 && bounds.minY >= -90);
      }
    }
  }
});
test("1935 central route ends at Wuqi, and 1936 forces arrive separately at Huining and Jiangtaibao", () => {
  assert.deepEqual(centralRoute.at(-1), journeyLocations[20].point);
  assert.ok(
    !centralRoute.some(
      (p) => p.join(",") === journeyLocations[21].point.join(","),
    ),
  );
  assert.deepEqual(contextRoutes[1].points.at(-1), journeyLocations[21].point);
  assert.deepEqual(contextRoutes[0].points.at(-1), [105.82, 35.83]);
});
test("mobile and desktop callouts do not overlap or move their geographic anchors", () => {
  for (const width of [320, 360, 375, 390, 430, 600, 699, 700, 768, 850]) {
    const compact = width < 700,
      w = compact ? 44 : 114,
      labels = layoutJourneyLabels(width, compact);
    labels.forEach((p, i) => {
      assert.ok(p.x >= w / 2 - 0.1 && p.x <= width - w / 2 + 0.1);
      assert.ok(p.y >= 22 - 0.1 && p.y <= width * 0.9 - 22 + 0.1);
      const anchor = projectJourney(journeyLocations[i].point);
      assert.ok(Math.abs(p.anchorX - (anchor[0] * width) / 1000) < 1e-8);
      assert.ok(Math.abs(p.anchorY - (anchor[1] * width) / 1000) < 1e-8);
      labels
        .slice(i + 1)
        .forEach((q, j) =>
          assert.ok(
            Math.abs(p.x - q.x) >= w - 0.1 || Math.abs(p.y - q.y) >= 43.9,
            `${width}px: ${i + 1}/${i + j + 2} overlap`,
          ),
        );
    });
  }
});

test("full-page terrain remains registered to every route anchor at all zoom levels", () => {
  const origin = { x: 52, y: 281 };
  for (const width of [320, 390, 780, 900])
    for (const zoom of [1, 1.5, 3, 6]) {
      const mapWidth = width * zoom,
        frame = expandedJourneyFrame(width, mapWidth, origin);
      for (const { point } of journeyLocations) {
        const projected = projectJourney(point);
        const backgroundX = frame.left + ((point[0] - 86) / 51) * frame.width;
        const backgroundY = frame.top + ((52 - point[1]) / 44) * frame.height;
        const anchorX =
          origin.x + (width - mapWidth) / 2 + (projected[0] * mapWidth) / 1000;
        const anchorY =
          origin.y +
          (width - mapWidth) * 0.45 +
          (projected[1] * mapWidth) / 1000;
        assert.ok(Math.abs(backgroundX - anchorX) < 1e-8);
        assert.ok(Math.abs(backgroundY - anchorY) < 1e-8);
      }
    }
});

test("one-screen labels stay visible and leave the bottom-right zoom controls clear", () => {
  for (const [width, height] of [
    [595, 488],
    [500, 410],
    [320, 262],
    [288, 244],
    [280, 230],
    [280, 183],
    [266, 218],
    [350, 287],
  ]) {
    const compact = width < 500,
      half = compact ? 22 : 57;
    const nodes = layoutJourneyLabels(width, compact, height);
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      assert.ok(p.y >= 22 && p.y <= height - 22);
      assert.ok(
        !compact || p.x + half <= width - 88 || p.y + 22 <= height - 44,
        `${width}: zoom controls cover ${i + 1}`,
      );
      for (const q of nodes.slice(i + 1))
        assert.ok(
          Math.abs(p.x - q.x) >= half * 2 - 0.01 ||
            Math.abs(p.y - q.y) >= 44 - 0.01,
          `${width}: overlapping labels`,
        );
    }
  }
});

test("city labels follow each army independently, preserve shared towns and avoid overlap", () => {
  for (let mask = 0; mask < 16; mask++) {
    const visible = [0, 1, 2, 3].map((i) => Boolean(mask & (1 << i)));
    for (const [width, height] of [
      [280, 183],
      [350, 390],
      [580, 475],
      [1160, 1044],
    ]) {
      const labels = layoutJourneyCities(width, visible, height, width < 500);
      assert.deepEqual(
        labels.map((p) => p.name),
        journeyRouteCities
          .filter((p) => p.armies.some((i) => visible[i]))
          .map((p) => p.name),
      );
      labels.forEach((p) => {
        const [x, y] = projectJourney(p.point).map((v) => (v * width) / 1000);
        assert.equal(p.anchorX, x);
        assert.equal(p.anchorY, y);
        if (!p.showLabel) return;
        const half = p.name.length * 6 + 5;
        assert.ok(
          width >= 500 || p.x + half <= width - 88 || p.y + 10 <= height - 44,
        );
        assert.ok(
          p.x >= half && p.x <= width - half && p.y >= 12 && p.y <= height - 12,
        );
        for (const q of labels.filter((q) => q !== p && q.showLabel))
          assert.ok(
            Math.abs(p.x - q.x) >= half + q.name.length * 6 + 5 ||
              Math.abs(p.y - q.y) >= 20,
            `${width}px: ${p.name}/${q.name}`,
          );
      });
    }
  }
});

test("phone maps retain only three or four key towns across filters and zoom levels", () => {
  for (let mask = 0; mask < 16; mask++) {
    const visible = [0, 1, 2, 3].map((i) => Boolean(mask & (1 << i)));
    for (const zoom of [1, 3, 6]) {
      const towns = layoutJourneyCities(
        350 * zoom,
        visible,
        390 * zoom,
        zoom === 1,
        true,
      );
      assert.ok(
        mask ? towns.length >= 3 && towns.length <= 4 : towns.length === 0,
      );
      assert.ok(
        towns.every(
          (town) =>
            town.major && town.showLabel && town.armies.some((i) => visible[i]),
        ),
      );
    }
  }
  assert.deepEqual(
    layoutJourneyCities(350, [true, true, true, true], 390, true, true).map(
      (city) => city.name,
    ),
    ["于都", "遵义", "吴起镇", "会宁"],
  );
});

test("expanded gazetteer covers all four armies and every name appears when enlarged", () => {
  assert.ok(journeyRouteCities.length >= 100);
  assert.equal(
    new Set(journeyRouteCities.map((c) => c.name)).size,
    journeyRouteCities.length,
  );
  for (const army of [0, 1, 2, 3])
    assert.ok(
      journeyRouteCities.filter((c) => c.armies.includes(army)).length >= 20,
    );
  for (const city of journeyRouteCities) {
    const [x, y] = projectJourney(city.point);
    assert.ok(x > 0 && x < 1000 && y > 0 && y < 900, city.name);
  }
  const overview = layoutJourneyCities(
    280,
    [true, true, true, true],
    183,
    true,
  );
  assert.ok(
    overview.filter((c) => c.showLabel).length < journeyRouteCities.length,
  );
  assert.ok(overview.filter((c) => c.major).every((c) => c.showLabel));
  const enlarged = layoutJourneyCities(280 * 6, [true, true, true, true]);
  assert.ok(enlarged.every((c) => c.showLabel));
});
