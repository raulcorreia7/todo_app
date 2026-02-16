import { createStore, produce } from "solid-js/store";
import type { GamificationState, Achievement, DailyStats } from "@/types";
import { gamificationStorage } from "@/services/storage";
import { audioService } from "@/services/audio";
import { ACHIEVEMENTS } from "@/utils/achievements";
import { showAchievementNotification } from "@/components/gamification";
import { checkForAffirmation, displayAffirmation } from "@/utils/affirmations";

const defaultDailyStats: DailyStats = {
  completed: 0,
  edited: 0,
  deleted: 0,
  focusTime: 0,
  lastUpdate: new Date().toISOString().split("T")[0]!,
};

const defaultState: GamificationState = {
  karmaPoints: 0,
  achievements: [],
  dailyStats: { ...defaultDailyStats },
  firstTaskCreated: false,
  firstTaskDeleted: false,
  firstTaskEdited: false,
  aiEditCount: 0,
  aiWordsEdited: 0,
};

function checkDailyReset(state: GamificationState): GamificationState {
  const today = new Date().toISOString().split("T")[0]!;
  if (state.dailyStats.lastUpdate !== today) {
    return {
      ...state,
      dailyStats: { ...defaultDailyStats, lastUpdate: today },
    };
  }
  return state;
}

const savedState = gamificationStorage.get();
const initialState = savedState ? checkDailyReset(savedState) : defaultState;

export const [gamificationState, setGamificationState] =
  createStore<GamificationState>(initialState);

function persist() {
  gamificationStorage.set(gamificationState);
}

export function hasAchievement(id: string): boolean {
  return gamificationState.achievements.some((a) => a.id === id);
}

export function addKarma(points: number): void {
  setGamificationState(
    produce((state) => {
      state.karmaPoints += points;
    }),
  );
  persist();
}

export function unlockAchievement(achievement: Achievement): void {
  if (hasAchievement(achievement.id)) return;
  setGamificationState(
    produce((state) => {
      state.achievements.push({ ...achievement, unlockedAt: new Date().toISOString() });
    }),
  );
  audioService.play("achievement");
  showAchievementNotification(achievement);
  persist();
}

export function recordTaskCreation(): void {
  setGamificationState(
    produce((state) => {
      state.firstTaskCreated = true;
    }),
  );
  addKarma(1);
  checkAchievements({ completed: gamificationState.dailyStats.completed, currentStreak: 0 });
}

export function recordTaskCompletion(): void {
  const today = new Date().toISOString().split("T")[0]!;
  setGamificationState(
    produce((state) => {
      if (state.dailyStats.lastUpdate !== today) {
        state.dailyStats = { ...defaultDailyStats, lastUpdate: today };
      }
      state.dailyStats.completed += 1;
    }),
  );
  addKarma(1);
  checkAchievements({ completed: gamificationState.dailyStats.completed, currentStreak: 0 });

  const affirmation = checkForAffirmation(gamificationState.dailyStats.completed);
  if (affirmation) {
    displayAffirmation(affirmation);
  }
}

export function recordTaskEdit(): void {
  const today = new Date().toISOString().split("T")[0]!;
  setGamificationState(
    produce((state) => {
      if (state.dailyStats.lastUpdate !== today) {
        state.dailyStats = { ...defaultDailyStats, lastUpdate: today };
      }
      state.dailyStats.edited += 1;
      state.firstTaskEdited = true;
    }),
  );
  addKarma(2);
  checkAchievements({ completed: gamificationState.dailyStats.completed, currentStreak: 0 });
}

export function recordTaskDelete(): void {
  const today = new Date().toISOString().split("T")[0]!;
  setGamificationState(
    produce((state) => {
      if (state.dailyStats.lastUpdate !== today) {
        state.dailyStats = { ...defaultDailyStats, lastUpdate: today };
      }
      state.dailyStats.deleted += 1;
      state.firstTaskDeleted = true;
    }),
  );
  persist();
  checkAchievements({ completed: gamificationState.dailyStats.completed, currentStreak: 0 });
}

export function recordAIEdit(wordsCount: number = 0): void {
  setGamificationState(
    produce((state) => {
      state.aiEditCount += 1;
      state.aiWordsEdited += wordsCount;
    }),
  );
  persist();
  checkAchievements({ completed: gamificationState.dailyStats.completed, currentStreak: 0 });
}

export function resetStats(): void {
  setGamificationState(defaultState);
  persist();
}

export function checkAchievements(stats: { completed: number; currentStreak: number }): void {
  for (const achievement of ACHIEVEMENTS) {
    if (hasAchievement(achievement.id)) continue;
    if (achievement.condition?.(gamificationState, stats)) {
      unlockAchievement(achievement);
    }
  }
}
