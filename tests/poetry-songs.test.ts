import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { poetrySongs } from "../src/poetrySongs.ts";
const data = JSON.parse(readFileSync(new URL("../src/content.json", import.meta.url), "utf8"));
test("each poem has a different song with an official viewing link and attribution", () => {
  const songs = data.poems.map((poem: { title: string }) => poetrySongs[poem.title]);
  assert.equal(songs.length, 6);
  assert.ok(songs.every(Boolean));
  assert.equal(new Set(songs.map((song) => song.title)).size, 6);
  for (const song of songs) {
    assert.equal(new URL(song.video.url).hostname, "tv.cctv.com");
    assert.ok(song.source.url.startsWith("https://"));
    assert.ok(song.credits && song.background && song.connection);
  }
});
