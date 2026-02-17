import type { Task, Settings, GamificationState, Statistics } from "@/types";

const STORAGE_KEYS = {
  TASKS: "luxury-todos-v2",
  SETTINGS: "luxury-todo-settings-v2",
  GAMIFICATION: "luxury-todo-gamification-v2",
  STATISTICS: "luxury-todo-stats-v2",
  MUSIC_VOLUME: "music-volume",
  MUSIC_PLAYING: "music-playing",
  MUSIC_CURRENT_TRACK: "music-current-track",
  AFFIRMATIONS: "luxury-todo-affirmations",
  DAILY_SUMMARY: "luxury-todo-last-summary",
  QUOTE: "luxury-todo-quote",
} as const;

const RESETTABLE_STORAGE_KEYS: readonly string[] = Object.values(STORAGE_KEYS);

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const available = isLocalStorageAvailable();

export function getItems<T>(key: string, defaultValue: T): T {
  if (!available) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  if (!available) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): boolean {
  if (!available) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const tasksStorage = {
  get: (): Task[] => getItems<Task[]>(STORAGE_KEYS.TASKS, []),
  set: (tasks: Task[]): boolean => setItem(STORAGE_KEYS.TASKS, tasks),
  clear: (): boolean => setItem(STORAGE_KEYS.TASKS, []),
};

export const settingsStorage = {
  get: (): Settings | null =>
    getItems<Settings | null>(STORAGE_KEYS.SETTINGS, null),
  set: (settings: Settings): boolean =>
    setItem(STORAGE_KEYS.SETTINGS, settings),
};

export const gamificationStorage = {
  get: (): GamificationState | null =>
    getItems<GamificationState | null>(STORAGE_KEYS.GAMIFICATION, null),
  set: (state: GamificationState): boolean =>
    setItem(STORAGE_KEYS.GAMIFICATION, state),
};

export const statisticsStorage = {
  get: (): Statistics | null =>
    getItems<Statistics | null>(STORAGE_KEYS.STATISTICS, null),
  set: (stats: Statistics): boolean => setItem(STORAGE_KEYS.STATISTICS, stats),
};

export function clearAllStorage(): boolean {
  if (!available) return false;

  try {
    RESETTABLE_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch {
    return false;
  }
}

export { STORAGE_KEYS };
