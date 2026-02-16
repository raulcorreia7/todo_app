import { taskStore } from "@/stores/taskStore";
import { gamificationState } from "@/stores/gamificationStore";
import { uiActions } from "@/stores/uiStore";

const STORAGE_KEY = "luxury-todo-last-summary";
const INACTIVITY_THRESHOLD = 4 * 60 * 60 * 1000;

export interface DailyStats {
  completed: number;
  added: number;
  karma: number;
  productivityScore: number;
}

let lastHiddenTime: number = Date.now();
let visibilityListenerAdded = false;

function setupVisibilityListener(): void {
  if (typeof document === "undefined" || visibilityListenerAdded) return;
  visibilityListenerAdded = true;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      lastHiddenTime = Date.now();
    } else {
      const hiddenDuration = Date.now() - lastHiddenTime;
      if (hiddenDuration >= INACTIVITY_THRESHOLD) {
        checkForDailySummary();
      }
    }
  });
}

export function initDailySummary(): void {
  setupVisibilityListener();
  checkForDailySummary();
}

export function getLastDailySummary(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLastDailySummary(date: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, date);
  } catch {
    // ignore
  }
}

export function getTodayString(): string {
  return new Date().toDateString();
}

export function getDailyStats(): DailyStats {
  const today = getTodayString();
  const tasks = taskStore.tasks;
  const todayTasks = tasks.filter(
    (task) => new Date(task.createdAt).toDateString() === today
  );

  const completedToday = todayTasks.filter((task) => task.completed).length;
  const addedToday = todayTasks.length;
  const karmaToday =
    gamificationState.dailyStats.completed +
    gamificationState.dailyStats.edited * 2;
  const productivityScore =
    addedToday > 0 ? Math.round((completedToday / addedToday) * 100) : 0;

  return {
    completed: completedToday,
    added: addedToday,
    karma: karmaToday,
    productivityScore,
  };
}

export function getMotivationalMessage(
  score: number,
  completed: number
): string {
  if (completed === 0) {
    return "Tomorrow is a new day to start fresh and make progress!";
  } else if (score === 100) {
    return "Perfect day! You've completed everything you set out to do. Outstanding!";
  } else if (score >= 75) {
    return "Excellent progress! You're building strong productivity habits.";
  } else if (score >= 50) {
    return "Good work! Keep building momentum for tomorrow.";
  } else if (score >= 25) {
    return "Every completed task counts. You're making steady progress!";
  } else {
    return "Small steps lead to big changes. Tomorrow is your day!";
  }
}

export function shouldShowDailySummary(): boolean {
  const lastShown = getLastDailySummary();
  const today = getTodayString();

  if (lastShown === today) {
    return false;
  }

  const tasks = taskStore.tasks;
  const todayTasks = tasks.filter(
    (task) => new Date(task.createdAt).toDateString() === today
  );

  return todayTasks.length > 0;
}

export function checkForDailySummary(): void {
  if (shouldShowDailySummary()) {
    uiActions.showDailySummary();
    setLastDailySummary(getTodayString());
  }
}

export function closeDailySummary(): void {
  uiActions.hideDailySummary();
}
