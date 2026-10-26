const played = new Set<string>();
const key = (id: string) => `changzheng-narration-played-v1:${id}`;

export function hasPlayedNarration(id: string): boolean {
  if (played.has(id)) return true;
  try {
    return localStorage.getItem(key(id)) === "1";
  } catch {
    return false;
  }
}

export function markNarrationPlayed(id: string): void {
  played.add(id);
  try {
    localStorage.setItem(key(id), "1");
  } catch {
    // Still remember playback for this visit when browser storage is unavailable.
  }
}
