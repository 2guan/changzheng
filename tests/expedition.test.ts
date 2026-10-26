import test from "node:test";
import assert from "node:assert/strict";
import {
  freshExpedition,
  sanitizeExpedition,
  isChapterReady,
  completeChapter,
} from "../src/expedition.ts";

test("corrupt or future saves return a usable starting state", () => {
  for (const raw of [
    null,
    [],
    42,
    { version: 9 },
    {
      version: 1,
      chapter: NaN,
      role: "bad",
      gear: ["book", "book", "injected"],
      completed: [3, 5],
      letter: 5,
    },
  ]) {
    const s = sanitizeExpedition(raw);
    assert.equal(s.chapter, 0);
    assert.equal(s.role, "courier");
    assert.ok(s.gear.length <= 3);
    assert.equal(s.letter, "");
  }
  const s = sanitizeExpedition({
    version: 1,
    chapter: 4,
    completed: [0, 1, 3],
    snow: 900,
    crossing: -3,
    probes: ["0-0", "8-8"],
    letter: "字".repeat(900),
  });
  assert.equal(s.chapter, 2);
  assert.deepEqual(s.completed, [0, 1]);
  assert.equal(s.snow, 100);
  assert.equal(s.crossing, 0);
  assert.deepEqual(s.probes, ["0-0"]);
  assert.equal(s.letter.length, 500);
});
test("all six scenes gate advancement on their actual actions", () => {
  let p = freshExpedition();
  assert.equal(completeChapter(p), p);
  p = { ...p, gear: ["shoes", "cloth", "bowl"], started: true };
  p = completeChapter(p);
  assert.equal(p.chapter, 1);
  p = { ...p, crossing: 100 };
  assert.equal(isChapterReady(p), false);
  p = { ...p, observed: ["boats", "lamp", "bridge"] };
  p = completeChapter(p);
  assert.equal(p.chapter, 2);
  p = { ...p, crossings: 3 };
  assert.equal(isChapterReady(p), false);
  p = { ...p, crossings: 4 };
  p = completeChapter(p);
  assert.equal(p.chapter, 3);
  p = { ...p, snow: 100, companion: true };
  assert.equal(isChapterReady(p), false);
  p = { ...p, kindness: "share" };
  p = completeChapter(p);
  assert.equal(p.chapter, 4);
  p = { ...p, steps: 3 };
  assert.equal(isChapterReady(p), false);
  p = { ...p, steps: 4 };
  p = completeChapter(p);
  assert.equal(p.chapter, 5);
  p = { ...p, letter: "   " };
  assert.equal(isChapterReady(p), false);
  p = { ...p, letter: "等一等身边的人。" };
  p = completeChapter(p);
  assert.deepEqual(p.completed, [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(sanitizeExpedition(JSON.parse(JSON.stringify(p))), p);
  assert.deepEqual(completeChapter(p).completed, [0, 1, 2, 3, 4, 5]);
});
