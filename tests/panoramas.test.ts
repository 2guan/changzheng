import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  panoramas,
  panoramaStation,
  sanitizePanoramaProgress,
} from "../src/panoramas.ts";
import { milestones } from "../src/data.ts";

test("all 22 stations have distinct local panoramas and two optional observations", () => {
  assert.equal(panoramas.length, 22);
  assert.equal(new Set(panoramas.map((p) => p.image)).size, 22);
  for (const [index, p] of panoramas.entries()) {
    assert.equal(p.id, milestones[index].id);
    assert.ok(
      existsSync(new URL(`../public${p.image}`, import.meta.url)),
      p.image,
    );
    assert.equal(p.details.length, 2);
    for (const d of p.details) {
      assert.ok(d.title && d.text.length > 25);
      assert.ok(d.x >= 0 && d.x <= 100 && d.y >= 0 && d.y <= 100);
    }
    assert.ok(milestones[index].body.length >= 2);
  }
  const ledger = JSON.parse(
    readFileSync(
      new URL("../docs/panorama-assets.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(ledger.assets.length, 19);
  assert.equal(ledger.reused.length, 3);
});
test("panorama navigation accepts direct access to every station without completion gates", () => {
  for (let id = 1; id <= 22; id++)
    assert.equal(panoramaStation(String(id)), id);
  for (const raw of ["", "0", "23", "-1", "4.5", "oops", null])
    assert.equal(panoramaStation(raw, 7), 7);
});
test("panorama storage rejects corrupt positions and keeps unique valid view records", () => {
  assert.deepEqual(sanitizePanoramaProgress(null), {
    lastStation: 1,
    seen: [],
  });
  assert.deepEqual(
    sanitizePanoramaProgress({
      lastStation: 99,
      seen: [0, 1, 1, 22, "2", 23, -3],
    }),
    { lastStation: 1, seen: [1, 22] },
  );
  const data = { lastStation: 17, seen: [1, 8, 17] };
  assert.deepEqual(
    sanitizePanoramaProgress(JSON.parse(JSON.stringify(data))),
    data,
  );
});
