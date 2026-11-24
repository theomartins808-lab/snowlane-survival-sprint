const STORAGE_KEY = "thzinkkj_best_record_v1";
const NICKNAME_KEY = "thzinkkj_nickname_v1";

export interface LocalRecord {
  bestTime: number;
  bestDistance: number;
}

export function loadLocalRecord(): LocalRecord {
  if (typeof window === "undefined") return { bestTime: 0, bestDistance: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bestTime: 0, bestDistance: 0 };
    const parsed = JSON.parse(raw) as Partial<LocalRecord>;
    return {
      bestTime: typeof parsed.bestTime === "number" && Number.isFinite(parsed.bestTime) ? parsed.bestTime : 0,
      bestDistance:
        typeof parsed.bestDistance === "number" && Number.isFinite(parsed.bestDistance)
          ? parsed.bestDistance
          : 0,
    };
  } catch {
    return { bestTime: 0, bestDistance: 0 };
  }
}

export function saveLocalRecord(time: number, distance: number): { record: LocalRecord; isNewBest: boolean } {
  const current = loadLocalRecord();
  const isNewBest = time > current.bestTime;
  const next: LocalRecord = {
    bestTime: Math.max(current.bestTime, time),
    bestDistance: Math.max(current.bestDistance, Math.floor(distance)),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
  return { record: next, isNewBest };
}

export function loadSavedNickname(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NICKNAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NICKNAME_KEY, name.trim().slice(0, 20));
  } catch {
    // ignore
  }
}