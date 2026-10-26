import test from "node:test";
import assert from "node:assert/strict";
import { atlasRoutes } from "../src/atlas.ts";
import { atlasDetail } from "../src/details.ts";

test("every non-panorama map detail resolves to exactly its selected content", () => {
  for (const [page, route] of Object.entries(atlasRoutes)) {
    if (page === "home" || page === "journey") continue;
    route.stops.forEach((node, i) => {
      const params = new URLSearchParams(node.href.split("?")[1]);
      const detail = atlasDetail(page, params);
      assert.ok(detail);
      assert.equal(detail.stop, i + 1);
      assert.equal(detail.title, node.title);
      assert.equal(detail.params.toString(), params.toString());
    });
  }
});
test("map links stay maps and journey readers retain the panorama background", () => {
  for (const page of Object.keys(atlasRoutes)) {
    assert.equal(atlasDetail(page, new URLSearchParams()), null);
    assert.equal(atlasDetail(page, new URLSearchParams("stop=2")), null);
    assert.equal(
      atlasDetail(page, new URLSearchParams("view=map&story=1")),
      null,
    );
  }
  assert.equal(
    atlasDetail("journey", new URLSearchParams("station=5&read=1")),
    null,
  );
  assert.equal(
    atlasDetail("missing", new URLSearchParams("view=reading")),
    null,
  );
});
test("legacy focus links and invalid detail IDs have safe, relevant defaults", () => {
  assert.equal(
    atlasDetail("learn", new URLSearchParams("view=reading&focus=quiz"))?.stop,
    2,
  );
  assert.equal(
    atlasDetail(
      "meaning",
      new URLSearchParams("view=reading&focus=chapter-1"),
    )?.params.get("focus"),
    "chapter-1",
  );
  assert.equal(
    atlasDetail("stories", new URLSearchParams("story=999"))?.params.get(
      "story",
    ),
    "1",
  );
  assert.equal(
    atlasDetail("poetry", new URLSearchParams("poem=-2"))?.params.get("poem"),
    "0",
  );
});

test("anniversary reading leads the meaning map and previous chapter links remain relevant", () => {
  assert.deepEqual(
    atlasRoutes.meaning.stops.map((s) => s.title),
    ["赓续长征", "三个比喻", "四重价值", "写下回望"],
  );
  for (const [query, title, stop] of [
    ["view=reading&stop=3&focus=questions", "赓续长征", 1],
    ["view=reading&stop=1&focus=chapter-0", "三个比喻", 2],
    ["view=reading&stop=2&focus=chapter-1", "四重价值", 3],
  ] as const) {
    const detail = atlasDetail("meaning", new URLSearchParams(query));
    assert.equal(detail?.title, title);
    assert.equal(detail?.stop, stop);
  }
});
