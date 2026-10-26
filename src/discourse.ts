/** Explicit editorial matches to the supplied compilation, never a generic fallback. */
const stationDiscourse: Record<number, number> = {
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
const storyDiscourse: Record<number, number> = {
  1: 16,
  2: 16,
  3: 15,
  8: 16,
  14: 17,
  17: 17,
};

export function discourseIds(page: string, params: URLSearchParams): number[] {
  let id: number | undefined;
  if (page === "journey") id = stationDiscourse[Number(params.get("station"))];
  if (page === "stories") id = storyDiscourse[Number(params.get("story"))];
  if (page === "prologue") {
    const focus = params.get("focus");
    if (focus === "comparison" || focus === "chapter-0") id = 1;
    if (focus === "chapter-1") id = 2;
  }
  if (page === "armies") id = 14;
  if (page === "poetry" && params.get("poem") === "2") id = 13;
  if (page === "meaning") {
    const focus = params.get("focus");
    if (focus === "chapter-0") id = 18;
    if (focus === "chapter-1") id = 19;
    if (["anniversary", "questions", "reflection"].includes(focus || ""))
      id = 19;
  }
  return id ? [id] : [];
}

/** One complete excerpt per detail, selected for that page's subject. */
export function discourseSelection(page: string, params: URLSearchParams) {
  const [entryId] = discourseIds(page, params);
  if (!entryId) return null;
  const useSecondPassage =
    (page === "stories" && params.get("story") === "14") ||
    (page === "journey" &&
      ["10", "22"].includes(params.get("station") || "")) ||
    (page === "meaning" &&
      ["anniversary", "questions", "reflection"].includes(
        params.get("focus") || "",
      ));
  return { entryId, passageIndex: useSecondPassage ? 1 : 0 };
}
