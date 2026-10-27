import type { Progress } from "./storage.ts";

/** Save the last completed attempt independently from a new attempt in progress. */
export function answerQuiz(progress: Progress, index: number, answer: number): Progress {
  if (!Number.isInteger(index) || index < 0 || index >= 15 ||
      !Number.isInteger(answer) || answer < 0 || answer > 2 ||
      progress.answers[index] != null) return progress;
  const answers = Array.from({ length: 15 }, (_, i) => progress.answers[i] ?? null);
  answers[index] = answer;
  return {
    ...progress,
    answers,
    lastQuizAnswers: answers.every((value) => value !== null)
      ? answers as number[] : progress.lastQuizAnswers,
  };
}

export function restartQuiz(progress: Progress): Progress {
  const complete = progress.answers.length === 15 && progress.answers.every((value) => value !== null);
  return {
    ...progress,
    lastQuizAnswers: complete ? [...progress.answers] as number[] : progress.lastQuizAnswers,
    answers: [],
  };
}
