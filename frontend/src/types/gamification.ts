export interface DailyStats {
  completed: number;
  edited: number;
  deleted: number;
  focusTime: number;
  lastUpdate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition?: (
    state: GamificationState,
    stats: { completed: number; currentStreak: number }
  ) => boolean;
  conditionText?: string;
}

export interface GamificationState {
  karmaPoints: number;
  achievements: Achievement[];
  dailyStats: DailyStats;
  firstTaskCreated: boolean;
  firstTaskDeleted: boolean;
  firstTaskEdited: boolean;
  aiEditCount: number;
  aiWordsEdited: number;
}
