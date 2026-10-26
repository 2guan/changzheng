import test from "node:test";
import assert from "node:assert/strict";
import { certificateRecord } from "../src/certificate.ts";
import { emptyProgress } from "../src/storage.ts";

test("certificate uses actual learning activity rather than a quiz score", () => {
  const record = certificateRecord({
    ...emptyProgress,
    visited: [1, 2, 3, 4, 5, 6],
    stories: [1, 2, 3, 4, 5],
    tasks: ["pack", "station-1"],
    answers: [0, null, 2],
  });
  assert.deepEqual(
    record.metrics.map((m) => m.value),
    [6, 5, 1, 2],
  );
  assert.deepEqual(
    record.badges.map((b) => b.id),
    ["first-light", "mountain-path", "fireside", "practice"],
  );
});
test("certificate includes just-earned badges and preserves previously awarded medals", () => {
  const record = certificateRecord({
    ...emptyProgress,
    badges: ["learning", "learning", "unknown"],
    visited: [1],
  });
  assert.deepEqual(
    record.badges.map((b) => b.id),
    ["first-light", "learning"],
  );
  const finalAnswer = certificateRecord({
    ...emptyProgress,
    answers: Array(15).fill(0),
  });
  assert.deepEqual(
    finalAnswer.badges.map((b) => b.id),
    ["learning"],
  );
});
test("empty and malformed progress never invent achievements", () => {
  const record = certificateRecord({
    ...emptyProgress,
    visited: [0, 25, 1, 1],
    stories: [50],
    tasks: ["fake"],
    answers: [null],
  });
  assert.deepEqual(
    record.metrics.map((m) => m.value),
    [1, 0, 0, 0],
  );
  assert.deepEqual(certificateRecord(emptyProgress).badges, []);
});
