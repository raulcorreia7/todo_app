export { taskStore, taskActions } from "./taskStore";
export { settingsStore, settingsActions } from "./settingsStore";

export {
  gamificationState,
  setGamificationState,
  addKarma,
  unlockAchievement,
  recordTaskCompletion,
  recordTaskEdit,
  recordTaskDelete,
  recordAIEdit,
  resetStats,
  hasAchievement,
} from "./gamificationStore";

export {
  statisticsState,
  setStatisticsState,
  updateFromTasks,
  incrementStreak,
  resetStreak,
  resetAll,
  completionRate,
} from "./statisticsStore";

export { uiStore, uiActions } from "./uiStore";
