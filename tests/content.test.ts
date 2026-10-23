import test from "node:test";
import assert from "node:assert/strict";
import {
  milestones,
  stories,
  quiz,
  armies,
  modules,
  project,
} from "../src/data.ts";
import {
  sanitizeProgress,
  packingStats,
  scoreAnswers,
} from "../src/storage.ts";
test("eight modules and all learning content are present", () => {
  assert.equal(modules.length, 8);
  assert.equal(milestones.length, 22);
  assert.equal(stories.length, 20);
  assert.equal(quiz.length, 15);
  assert.equal(armies.length, 4);
  assert.equal(new Set(modules.map((m) => m.id)).size, 8);
});
test("every historical station has narrative, ordered ID and map coordinates", () => {
  milestones.forEach((m, i) => {
    assert.equal(m.id, i + 1);
    assert.ok(m.body.length >= 2);
    const [x, y] = project(m.point);
    assert.ok(x >= 0 && x <= 1000 && y >= 0 && y <= 620);
    assert.ok(m.summary.length > 20);
  });
  assert.equal(milestones[9].title, "遵义会议");
  assert.equal(milestones[21].id, 22);
});
test("story links and quiz explanations always resolve to a real station", () => {
  for (const s of [...stories, ...quiz])
    assert.ok(milestones.some((m) => m.id === s.station));
  for (const q of quiz) {
    assert.equal(q.options.length, 3);
    assert.ok(q.answer >= 0 && q.answer < 3);
    assert.ok(q.explanation.length > 10);
  }
});
test("saved state rejects malformed IDs, impossible answers and unknown tasks", () => {
  const p = sanitizeProgress({
    visited: [1, 1, 22, 23, -1, "3"],
    saved: [10, 100],
    stories: [20, 21],
    tasks: ["pack", "bad", "pack"],
    answers: [0, 9, null, 2],
    lastStation: 999,
  });
  assert.deepEqual(p.visited, [1, 22]);
  assert.deepEqual(p.saved, [10]);
  assert.deepEqual(p.stories, [20]);
  assert.deepEqual(p.tasks, ["pack"]);
  assert.deepEqual(p.answers, [0, null, null, 2]);
  assert.equal(p.lastStation, 1);
  assert.equal(sanitizeProgress(null).visited.length, 0);
});
test("carrying additional heavy collective equipment slows the teaching model", () => {
  assert.ok(
    packingStats([4.5, 2, 1.5]).speed > packingStats([4.5, 2, 1.5, 20]).speed,
  );
  assert.equal(packingStats([1000]).speed, 1);
});
test("unanswered or incorrect quiz entries cannot earn points", () => {
  assert.equal(scoreAnswers([null, 1, 2], [0, 1, 1]), 1);
  assert.equal(
    scoreAnswers(
      quiz.map((q) => q.answer),
      quiz.map((q) => q.answer),
    ),
    15,
  );
  assert.equal(
    scoreAnswers(
      [],
      quiz.map((q) => q.answer),
    ),
    0,
  );
});
