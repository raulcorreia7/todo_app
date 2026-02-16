import { createStore, produce } from "solid-js/store";
import type { Statistics, Task } from "@/types";
import { statisticsStorage } from "@/services/storage";

const defaultState: Statistics = {
  totalTasks: 0,
  completedTasks: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  lastActivity: new Date().toISOString(),
};

const savedState = statisticsStorage.get();
const initialState = savedState ?? defaultState;

export const [statisticsState, setStatisticsState] =
  createStore<Statistics>(initialState);

function persist() {
  statisticsStorage.set(statisticsState);
}

export function completionRate(): number {
  if (statisticsState.totalTasks === 0) return 0;
  return Math.round((statisticsState.completedTasks / statisticsState.totalTasks) * 100);
}

export function updateFromTasks(tasks: Task[]): void {
  const completed = tasks.filter((t) => t.completed).length;
  setStatisticsState(
    produce((state) => {
      state.totalTasks = tasks.length;
      state.completedTasks = completed;
      state.lastActivity = new Date().toISOString();
    }),
  );
  persist();
}

export function incrementStreak(): void {
  setStatisticsState(
    produce((state) => {
      state.currentStreak += 1;
      if (state.currentStreak > state.longestStreak) {
        state.longestStreak = state.currentStreak;
      }
      state.lastActivity = new Date().toISOString();
    }),
  );
  persist();
}

export function resetStreak(): void {
  setStatisticsState(
    produce((state) => {
      state.currentStreak = 0;
      state.lastActivity = new Date().toISOString();
    }),
  );
  persist();
}

export function resetAll(): void {
  setStatisticsState(defaultState);
  persist();
}
