import { stories, poems } from "./data.ts";

/** Reverse the existing story/poem links without maintaining a second mapping. */
export function stationReadings(station: number) {
  return {
    stories: stories.filter((story) => story.station === station),
    poems: poems
      .map((poem, index) => ({ ...poem, index }))
      .filter((poem) => poem.station === station),
  };
}

export function stationReadingDetail(station: number, params: URLSearchParams) {
  const related = stationReadings(station);
  const story = related.stories.find(
    (s) => String(s.id) === params.get("story"),
  );
  if (story)
    return {
      page: "stories",
      stop: story.id,
      title: story.title,
      params: new URLSearchParams({ story: String(story.id) }),
    };
  const poem = related.poems.find(
    (p) => String(p.index) === params.get("poem"),
  );
  if (poem)
    return {
      page: "poetry",
      stop: poem.index + 1,
      title: poem.title,
      params: new URLSearchParams({ poem: String(poem.index) }),
    };
  return null;
}
