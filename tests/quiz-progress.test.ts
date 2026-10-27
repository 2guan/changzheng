import test from "node:test";
import assert from "node:assert/strict";
import { emptyProgress, sanitizeProgress, scoreAnswers } from "../src/storage.ts";
import { answerQuiz, restartQuiz } from "../src/quizProgress.ts";

const correct = Array(15).fill(1);
const reload = (p: unknown) => sanitizeProgress(JSON.parse(JSON.stringify(p)));

test("completed score survives reload and restarting the next attempt", () => {
  let p = { ...emptyProgress };
  for (let i = 0; i < 15; i++) p = answerQuiz(p, i, i < 10 ? 1 : 0);
  p = reload(p);
  assert.equal(scoreAnswers(p.lastQuizAnswers, correct), 10);
  p = answerQuiz(restartQuiz(p), 0, 0);
  p = reload(p);
  assert.equal(p.answers[0], 0);
  assert.equal(p.answers[1], null);
  assert.equal(scoreAnswers(p.lastQuizAnswers, correct), 10);
  p = restartQuiz(p);
  assert.deepEqual(p.answers, []);
  assert.equal(scoreAnswers(p.lastQuizAnswers, correct), 10);
  for (let i = 0; i < 15; i++) p = answerQuiz(p, i, 1);
  assert.equal(scoreAnswers(reload(p).lastQuizAnswers, correct), 15);
});

test("zero scores are retained and existing completed answers are migrated", () => {
  const p = reload({ ...emptyProgress, answers: Array(15).fill(0) });
  assert.equal(p.lastQuizAnswers.length, 15);
  assert.equal(scoreAnswers(reload(restartQuiz(p)).lastQuizAnswers, correct), 0);
});

test("invalid, incomplete and outdated results cannot become saved scores", () => {
  for (const lastQuizAnswers of [Array(14).fill(0), [...Array(14).fill(0), 99], Array(15).fill(null)]) {
    assert.deepEqual(reload({ ...emptyProgress, lastQuizAnswers }).lastQuizAnswers, []);
  }
  assert.deepEqual(reload({ ...emptyProgress, quizVersion: 1, lastQuizAnswers: correct }).lastQuizAnswers, []);
  const p = answerQuiz(emptyProgress, 0, 1);
  assert.equal(answerQuiz(p, 0, 2), p);
  assert.equal(answerQuiz(p, 16, 1), p);
});
