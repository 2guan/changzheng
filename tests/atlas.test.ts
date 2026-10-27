import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  atlasRoutes,
  isAtlasRoute,
  atlasSelection,
  atlasMapHref,
  atlasPositions,
  atlasMobileLayout,
  homeMapHref,
} from "../src/atlas.ts";
import { modules } from "../src/data.ts";

test("all eight chapters have complete map routes, local artwork and real content destinations", () => {
  assert.deepEqual(
    Object.keys(atlasRoutes),
    modules.map((m) => m.id),
  );
  assert.deepEqual(
    Object.values(atlasRoutes).map((r) => r.stops.length),
    [6, 4, 22, 5, 20, 4, 6, 6],
  );
  for (const [page, r] of Object.entries(atlasRoutes)) {
    assert.ok(existsSync(new URL("../public" + r.image, import.meta.url)));
    assert.equal(new Set(r.stops.map((s) => s.href)).size, r.stops.length);
    for (const s of r.stops) {
      assert.ok(s.title && s.description && s.subtitle);
      if (s.image)
        assert.ok(existsSync(new URL("../public" + s.image, import.meta.url)));
      const [path, query] = s.href.slice(2).split("?");
      assert.ok(atlasRoutes[path]);
      if (page !== "home")
        assert.equal(
          isAtlasRoute(path, new URLSearchParams(query)),
          false,
          s.href,
        );
    }
  }
});
test("new default maps coexist with all existing deep links", () => {
  for (const m of modules)
    assert.equal(isAtlasRoute(m.id, new URLSearchParams()), true);
  for (const [page, query] of [
    ["journey", "station=19"],
    ["journey", "mode=archive"],
    ["journey", "mode=interactive"],
    ["journey", "station=2&read=1"],
    ["stories", "story=20"],
    ["poetry", "poem=0"],
    ["armies", "army=twentyfive"],
    ["learn", "view=reading&focus=quiz"],
  ])
    assert.equal(isAtlasRoute(page, new URLSearchParams(query)), false);
  assert.equal(isAtlasRoute("unknown", new URLSearchParams()), false);
  assert.equal(isAtlasRoute("home", new URLSearchParams("view=reading")), true);
});
test("returning to any detail restores its exact station, including zero-based poems", () => {
  for (const [page, r] of Object.entries(atlasRoutes)) {
    if (page === "home") continue;
    r.stops.forEach((s, i) => {
      const params = new URLSearchParams(s.href.split("?")[1]);
      assert.equal(atlasSelection(page, params), i + 1, s.href);
      const href = atlasMapHref(page, params);
      const back = new URLSearchParams(href.split("?")[1]);
      assert.equal(isAtlasRoute(page, back), true);
      assert.equal(atlasSelection(page, back), i + 1);
    });
  }
  for (const stop of ["0", "99", "1.5", "oops"])
    assert.equal(atlasSelection("journey", new URLSearchParams({ stop })), 1);
});
test("every route has unique unclipped narrative positions", () => {
  for (const r of Object.values(atlasRoutes)) {
    const pts = atlasPositions(r.stops.length);
    assert.equal(new Set(pts.map((p) => p.join(","))).size, r.stops.length);
    pts.forEach(([x, y]) => assert.ok(x >= 8 && x <= 92 && y >= 10 && y <= 90));
  }
});

test("mobile routes keep every stop in order with no more than three per row", () => {
  for (const [page, route] of Object.entries(atlasRoutes)) {
    const columns = page === "home" || route.stops.length === 4 ? 2 : 3;
    const { height, points } = atlasMobileLayout(route.stops.length, columns);
    const rows = new Map<number, number[]>();
    assert.equal(points.length, route.stops.length);
    points.forEach(([x, y], i) => {
      assert.ok(x >= 18 && x <= 82);
      assert.ok((y * height) / 100 + 100 < height);
      if (i) assert.ok(y >= points[i - 1][1]);
      rows.set(y, [...(rows.get(y) || []), x]);
    });
    assert.equal(rows.size, Math.ceil(route.stops.length / columns));
    for (const row of rows.values()) {
      assert.ok(row.length <= 3);
      if (columns === 2) assert.equal(row.length, 2);
    }
  }
});

test("home has only the six themes and theme return links use the new numbering", () => {
  const ids = ["prologue", "journey", "armies", "stories", "meaning", "poetry"];
  assert.deepEqual(
    atlasRoutes.home.stops.map((s) => s.href),
    ids.map((id) => `#/${id}`),
  );
  assert.equal(atlasRoutes.home.image, "/assets/hero.webp");
  ids.forEach((id, i) => assert.equal(homeMapHref(id), `#/home?stop=${i + 1}`));
  assert.equal(homeMapHref("learn"), "#/home");
  const desktop = atlasPositions(6);
  assert.ok(desktop.every(([x], i) => i === 0 || x > desktop[i - 1][0]));
  for (const points of [atlasMobileLayout(6, 2).points]) {
    const rows = new Map<number, number>();
    for (const [, y] of points) rows.set(y, (rows.get(y) || 0) + 1);
    assert.deepEqual([...rows.values()], [2, 2, 2]);
  }
});
