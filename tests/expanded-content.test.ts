import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const data = JSON.parse(
  readFileSync(new URL("../src/content.json", import.meta.url), "utf8"),
);
test("complete source chapters cover all 22 milestones and 20 stories", () => {
  assert.equal(data.stations.length, 22);
  assert.equal(data.stories.length, 20);
  for (const [i, s] of data.stations.entries()) {
    assert.equal(s.id, i + 1);
    assert.ok(s.sections.length >= 1);
    assert.ok(s.sections.map((x) => x.text).join("").length > 100);
    assert.ok(!s.sections.some((x) => /网站|交互/.test(x.title)));
  }
  for (const s of data.stories) assert.ok(s.text.length > 200, s.title);
  assert.equal(data.prologue.length, 2);
  assert.equal(data.meaning.length, 2);
  assert.equal(data.poems.length, 6);
  assert.equal(data.quiz.length, 15);
});
test("each story has a distinct real local image and documented prompt", () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL("../docs/generated-assets-v2.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.length, 21);
  assert.equal(new Set(manifest.map((x) => x.file)).size, 21);
  for (const item of manifest) {
    assert.ok(existsSync(new URL("../" + item.file, import.meta.url)));
    assert.ok(item.prompt.length > 100);
  }
  for (let id = 1; id <= 20; id++)
    assert.ok(
      existsSync(
        new URL(
          `../public/assets/object-${String(id).padStart(2, "0")}.webp`,
          import.meta.url,
        ),
      ),
    );
});
test("source quiz and scenario links have valid options and correct answer bounds", () => {
  for (const q of data.quiz) {
    assert.equal(q.options.length, 3);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 3);
    assert.ok(q.station >= 1 && q.station <= 22);
  }
  assert.ok(data.quiz[10].question.includes("1936"));
});
