import { showAchievementNotification } from "@/components/gamification";

export interface Affirmation {
  title: string;
  message: string;
  icon: string;
}

const MILESTONE_COUNTS = [1, 3, 7, 10, 15, 20] as const;

const AFFIRMATIONS: Record<number, Affirmation> = {
  1: {
    title: "Mindful Beginning",
    message: "A gentle start to your day",
    icon: "🌱",
  },
  3: {
    title: "Gentle Progress",
    message: "Three mindful completions",
    icon: "🍃",
  },
  7: {
    title: "Weekly Rhythm",
    message: "A week of mindful moments",
    icon: "🕊️",
  },
  10: {
    title: "Daily Harmony",
    message: "Ten steps toward balance",
    icon: "✨",
  },
  15: {
    title: "Mindful Flow",
    message: "Fifteen moments of presence",
    icon: "🧘",
  },
  20: {
    title: "Peaceful Practice",
    message: "Twenty mindful completions",
    icon: "🌸",
  },
};

const STORAGE_KEY = "luxury-todo-affirmations";

interface AffirmationStorage {
  date: string;
  achievements: number[];
}

function getStorage(): AffirmationStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setStorage(data: AffirmationStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getTodayDateString(): string {
  return new Date().toDateString();
}

function loadShownToday(): Set<number> {
  const data = getStorage();
  const today = getTodayDateString();

  if (data && data.date === today) {
    return new Set(data.achievements || []);
  }

  return new Set();
}

function saveShownToday(shown: Set<number>): void {
  setStorage({
    date: getTodayDateString(),
    achievements: Array.from(shown),
  });
}

let shownToday: Set<number> | null = null;

function getShownToday(): Set<number> {
  if (shownToday === null) {
    shownToday = loadShownToday();
  }
  return shownToday;
}

export function checkForAffirmation(todayCompleted: number): Affirmation | null {
  const shown = getShownToday();

  if (!MILESTONE_COUNTS.includes(todayCompleted as typeof MILESTONE_COUNTS[number])) {
    return null;
  }

  if (shown.has(todayCompleted)) {
    return null;
  }

  const affirmation = AFFIRMATIONS[todayCompleted];
  if (!affirmation) {
    return null;
  }

  shown.add(todayCompleted);
  saveShownToday(shown);

  return affirmation;
}

export function displayAffirmation(affirmation: Affirmation): void {
  const achievement = {
    id: `affirmation-${Date.now()}`,
    title: affirmation.title,
    description: affirmation.message,
    icon: affirmation.icon,
    unlockedAt: new Date().toISOString(),
  };

  showAchievementNotification(achievement);
}

export function resetAffirmations(): void {
  shownToday = null;
}
