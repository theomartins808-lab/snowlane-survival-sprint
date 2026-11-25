import type { CharacterId, MapId } from "./catalog";

const STORAGE_KEY = "thzinkkj_best_record_v1";
const NICKNAME_KEY = "thzinkkj_nickname_v1";
const PREFS_KEY = "thzinkkj_prefs_v1";

export interface PlayerPrefs {
  character: CharacterId;
  map: MapId;
}

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

export function loadPlayerPrefs(): PlayerPrefs {
  if (typeof window === "undefined") return { character: "thzin", map: "natal" };
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { character: "thzin", map: "natal" };
    const parsed = JSON.parse(raw) as Partial<PlayerPrefs>;
    const validChars: CharacterId[] = ["thzin", "noel", "explorador", "robo"];
    const validMaps: MapId[] = ["natal", "deserto", "selva"];
    return {
      character: parsed.character && validChars.includes(parsed.character) ? parsed.character : "thzin",
      map: parsed.map && validMaps.includes(parsed.map) ? parsed.map : "natal",
    };
  } catch {
    return { character: "thzin", map: "natal" };
  }
}

export function savePlayerPrefs(prefs: PlayerPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}