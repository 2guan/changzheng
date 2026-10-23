export type Progress = {
  visited: number[];
  saved: number[];
  stories: number[];
  tasks: string[];
  answers: (number | null)[];
  lastStation: number;
};
export const STORAGE_KEY = "changzheng-fieldnotes-v1";
export const emptyProgress: Progress = {
  visited: [],
  saved: [],
  stories: [],
  tasks: [],
  answers: [],
  lastStation: 1,
};
export function sanitizeProgress(raw: unknown): Progress {
  if (!raw || typeof raw !== "object") return { ...emptyProgress };
  const r = raw as Record<string, unknown>;
  const ids = (v: unknown, max: number) =>
    Array.isArray(v)
      ? ([
          ...new Set(
            v.filter((x) => Number.isInteger(x) && x >= 1 && x <= max),
          ),
        ] as number[])
      : [];
  return {
    visited: ids(r.visited, 22),
    saved: ids(r.saved, 22),
    stories: ids(r.stories, 20),
    tasks: Array.isArray(r.tasks)
      ? [
          ...new Set(
            r.tasks.filter(
              (x): x is string =>
                typeof x === "string" &&
                ["pack", "decision", "bridge", "night"].includes(x),
            ),
          ),
        ]
      : [],
    answers: Array.isArray(r.answers)
      ? r.answers
          .slice(0, 15)
          .map((x) => (Number.isInteger(x) && x >= 0 && x <= 2 ? x : null))
      : [],
    lastStation:
      Number.isInteger(r.lastStation) &&
      Number(r.lastStation) >= 1 &&
      Number(r.lastStation) <= 22
        ? Number(r.lastStation)
        : 1,
  };
}
export function packingStats(weights: number[]) {
  const weight = weights.reduce((a, b) => a + b, 0);
  return {
    weight,
    speed: Math.max(1, 5 - weight * 0.075),
    effort: weight > 25 ? "负担沉重" : weight > 15 ? "需要取舍" : "轻装前行",
  };
}
export function scoreAnswers(answers: (number | null)[], correct: number[]) {
  return correct.reduce((n, a, i) => n + (answers[i] === a ? 1 : 0), 0);
}
