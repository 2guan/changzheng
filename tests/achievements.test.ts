import test from "node:test";
import assert from "node:assert/strict";
import { emptyProgress, sanitizeProgress } from "../src/storage.ts";
import { badges, earnedBadgeIds } from "../src/achievements.ts";
import { moduleNarration, stationNarration } from "../src/narration.ts";
import { speechParts } from "../src/audioText.ts";

test("badges use actual completion thresholds, not page visits or individual station choices", () => {
  assert.deepEqual(earnedBadgeIds(emptyProgress), []);
  assert.deepEqual(
    earnedBadgeIds({ ...emptyProgress, visited: [1], tasks: ["station-1"] }),
    ["first-light"],
  );
  const complete = {
    ...emptyProgress,
    visited: Array.from({ length: 22 }, (_, i) => i + 1),
    stories: Array.from({ length: 20 }, (_, i) => i + 1),
    tasks: ["pack", "decision", "bridge", "night"],
    answers: Array(15).fill(0),
  };
  assert.deepEqual(
    earnedBadgeIds(complete),
    badges.map((b) => b.id),
  );
});
test("earned medals survive imports and sanitized legacy saves remain compatible", () => {
  const p = sanitizeProgress({
    badges: ["first-light", "first-light", "fake"],
    visited: [1, 1, 99],
    quizVersion: 2,
  });
  assert.deepEqual(p.badges, ["first-light"]);
  assert.deepEqual(p.visited, [1]);
  assert.deepEqual(sanitizeProgress({ visited: [1] }).badges, []);
  assert.deepEqual(sanitizeProgress(JSON.parse(JSON.stringify(p))), p);
});
test("all 8 landing pages and 22 panorama pages have distinct narration", () => {
  assert.equal(Object.keys(moduleNarration).length, 8);
  assert.equal(stationNarration.length, 22);
  assert.equal(new Set(stationNarration).size, 22);
  for (const text of [...Object.values(moduleNarration), ...stationNarration])
    assert.ok(text.length > 80);
});
test("long readings split within the API limit without losing content", () => {
  const text = "山河长路。" + "同行".repeat(1200) + "！这里是新的出发。";
  const parts = speechParts(text);
  assert.ok(parts.every((p) => p.length <= 500));
  assert.equal(parts.join(""), text);
  assert.deepEqual(speechParts("  "), []);
});
