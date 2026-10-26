import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { earnedBadgeIds } from "./achievements";
import { emptyProgress, STORAGE_KEY, sanitizeProgress } from "./storage";
import type { Progress } from "./storage";
const Context = createContext<{
  progress: Progress;
  setProgress: Dispatch<SetStateAction<Progress>>;
  storageError: boolean;
}>({ progress: emptyProgress, setProgress: () => {}, storageError: false });
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [storageError, setError] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      return sanitizeProgress(
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"),
      );
    } catch {
      return { ...emptyProgress };
    }
  });
  useEffect(() => {
    const earned = earnedBadgeIds(progress).filter(
      (id) => !progress.badges.includes(id),
    );
    if (earned.length)
      setProgress((p) => ({
        ...p,
        badges: [...new Set([...p.badges, ...earned])],
      }));
  }, [progress]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setError(false);
    } catch {
      setError(true);
    }
  }, [progress]);
  return (
    <Context.Provider value={{ progress, setProgress, storageError }}>
      {children}
    </Context.Provider>
  );
}
export const useProgress = () => useContext(Context);
export function useRoute() {
  const [hash, setHash] = useState(location.hash || "#/home");
  useEffect(() => {
    const update = () => setHash(location.hash || "#/home");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const [path, q] = hash.replace(/^#\/?/, "").split("?");
  return { page: path || "home", params: new URLSearchParams(q), hash };
}
export function go(page: string, params: Record<string, string | number> = {}) {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  location.hash = `/${page}${q ? "?" + q : ""}`;
}
