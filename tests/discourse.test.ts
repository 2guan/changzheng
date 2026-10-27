import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { discourseIds, discourseSelection } from "../src/discourse.ts";

const entries = JSON.parse(
  readFileSync(new URL("../src/discourse-data.json", import.meta.url), "utf8"),
);
const supplied = readFileSync(
  new URL("../docs/references/总书记重要论述.md", import.meta.url),
  "utf8",
).replaceAll("**", "");

test("discourse passages retain the supplied wording and an explicit source", () => {
  assert.equal(entries.length, 19);
  assert.equal(new Set(entries.map((e: { id: number }) => e.id)).size, 19);
  for (const entry of entries) {
    assert.ok(entry.passages.length > 0);
    for (const passage of entry.passages) {
      assert.ok(passage.source.includes("习近平"));
      assert.ok(/20\d{2}年/.test(passage.source));
      for (const paragraph of passage.paragraphs) {
        assert.ok(paragraph.trim());
        assert.ok(
          supplied.includes(paragraph),
          `Non-verbatim text in entry ${entry.id}: ${paragraph}`,
        );
      }
    }
  }
});

test("all explicitly matched milestones and stories receive their own relevant discourse", () => {
  const stations: Record<number, number> = {
    1: 3,
    3: 4,
    5: 5,
    7: 6,
    8: 6,
    9: 7,
    10: 7,
    11: 8,
    13: 8,
    14: 9,
    15: 8,
    16: 11,
    17: 10,
    18: 11,
    19: 12,
    20: 12,
    21: 13,
    22: 13,
  };
  for (const [id, quote] of Object.entries(stations))
    assert.deepEqual(
      discourseIds("journey", new URLSearchParams({ station: id })),
      [quote],
    );
  for (const [id, quote] of Object.entries({
    1: 16,
    2: 16,
    3: 15,
    8: 16,
    14: 17,
    17: 17,
  }))
    assert.deepEqual(
      discourseIds("stories", new URLSearchParams({ story: id })),
      [quote],
    );
  assert.deepEqual(
    discourseIds("prologue", new URLSearchParams("focus=chapter-0")),
    [1],
  );
  assert.deepEqual(
    discourseIds("prologue", new URLSearchParams("focus=chapter-1")),
    [2],
  );
  assert.deepEqual(
    discourseIds("meaning", new URLSearchParams("focus=chapter-1")),
    [19],
  );
  assert.deepEqual(discourseIds("poetry", new URLSearchParams("poem=2")), [13]);
  assert.deepEqual(
    discourseIds("armies", new URLSearchParams("focus=comparison")),
    [14],
  );
  for (const army of ["first", "second", "fourth", "twentyfive"])
    assert.deepEqual(discourseIds("armies", new URLSearchParams({ army })), []);
});

test("unmatched content and learning tools do not get an unrelated generic quotation", () => {
  for (const [page, query] of [
    ["journey", "station=2"],
    ["stories", "story=10"],
    ["poetry", "poem=0"],
    ["prologue", "focus=packing"],
    ["learn", "focus=quiz"],
    ["home", ""],
  ])
    assert.deepEqual(discourseIds(page, new URLSearchParams(query)), []);
});

test("each related detail selects one existing passage with its original source", () => {
  const pages: [string, string][] = [
    ...Array.from({ length: 22 }, (_, i): [string, string] => [
      "journey",
      `station=${i + 1}`,
    ]),
    ...Array.from({ length: 20 }, (_, i): [string, string] => [
      "stories",
      `story=${i + 1}`,
    ]),
    ...["chapter-0", "chapter-1", "anniversary", "reflection"].map(
      (focus): [string, string] => ["meaning", `focus=${focus}`],
    ),
    ["poetry", "poem=2"],
    ["armies", "army=first"],
    ["prologue", "focus=chapter-0"],
  ];
  for (const [page, query] of pages) {
    const params = new URLSearchParams(query);
    const selection = discourseSelection(page, params);
    assert.ok(discourseIds(page, params).length <= 1);
    if (!selection) continue;
    const passage = entries.find(
      (entry: { id: number }) => entry.id === selection.entryId,
    )?.passages[selection.passageIndex];
    assert.ok(passage?.paragraphs.length);
    assert.ok(passage.source);
  }
  const youth = discourseSelection("stories", new URLSearchParams("story=14"))!;
  assert.ok(
    entries
      .find((e: { id: number }) => e.id === youth.entryId)
      .passages[youth.passageIndex].paragraphs[0].includes("平均年龄不到20岁"),
  );
});
