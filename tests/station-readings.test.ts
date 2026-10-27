import test from "node:test";
import assert from "node:assert/strict";
import { stories, poems } from "../src/data.ts";
import {
  stationReadings,
  stationReadingDetail,
} from "../src/stationReadings.ts";

test("every story and poem has a reverse link from its existing station", () => {
  const all = Array.from({ length: 22 }, (_, i) => stationReadings(i + 1));
  assert.equal(all.flatMap((s) => s.stories).length, stories.length);
  assert.equal(all.flatMap((s) => s.poems).length, poems.length);
  for (const story of stories) {
    const detail = stationReadingDetail(
      story.station,
      new URLSearchParams({ story: String(story.id) }),
    );
    assert.equal(detail?.title, story.title);
    assert.equal(detail?.page, "stories");
  }
  poems.forEach((poem, index) => {
    const detail = stationReadingDetail(
      poem.station,
      new URLSearchParams({ poem: String(index) }),
    );
    assert.equal(detail?.title, poem.title);
    assert.equal(detail?.params.get("poem"), String(index));
  });
});
test("unrelated or invalid reading IDs never open another station's content", () => {
  assert.equal(stationReadingDetail(1, new URLSearchParams("poem=0")), null);
  assert.equal(stationReadingDetail(15, new URLSearchParams("poem=99")), null);
  assert.equal(stationReadingDetail(15, new URLSearchParams()), null);
  assert.equal(stationReadingDetail(15, new URLSearchParams("story=-1")), null);
  assert.equal(stationReadings(21).poems.length, 2);
});
