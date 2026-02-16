import type { Achievement, GamificationState } from '@/types'

type Stats = { completed: number; currentStreak: number }

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task_created',
    title: 'First Steps',
    description: 'Create your first task',
    icon: 'sprout',
    condition: (state: GamificationState) => state.firstTaskCreated,
    conditionText: 'Create your first task',
  },
  {
    id: 'first_task_completed',
    title: 'Getting Things Done',
    description: 'Complete your first task',
    icon: 'check-circle',
    condition: (_state: GamificationState, stats: Stats) => stats.completed >= 1,
    conditionText: 'Complete 1 task',
  },
  {
    id: 'first_task_edited',
    title: 'Refiner',
    description: 'Edit your first task',
    icon: 'pencil',
    condition: (state: GamificationState) => state.firstTaskEdited,
    conditionText: 'Edit your first task',
  },
  {
    id: 'first_task_deleted',
    title: 'Clean Slate',
    description: 'Delete your first task',
    icon: 'trash-2',
    condition: (state: GamificationState) => state.firstTaskDeleted,
    conditionText: 'Delete your first task',
  },
  {
    id: 'ten_tasks',
    title: 'Productivity Starter',
    description: 'Complete 10 tasks',
    icon: 'trending-up',
    condition: (_state: GamificationState, stats: Stats) => stats.completed >= 10,
    conditionText: 'Complete 10 tasks',
  },
  {
    id: 'fifty_tasks',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: 'award',
    condition: (_state: GamificationState, stats: Stats) => stats.completed >= 50,
    conditionText: 'Complete 50 tasks',
  },
  {
    id: 'hundred_tasks',
    title: 'Century Club',
    description: 'Complete 100 tasks',
    icon: 'trophy',
    condition: (_state: GamificationState, stats: Stats) => stats.completed >= 100,
    conditionText: 'Complete 100 tasks',
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: '7 day streak',
    icon: 'flame',
    condition: (_state: GamificationState, stats: Stats) => stats.currentStreak >= 7,
    conditionText: 'Maintain a 7 day streak',
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: '30 day streak',
    icon: 'zap',
    condition: (_state: GamificationState, stats: Stats) => stats.currentStreak >= 30,
    conditionText: 'Maintain a 30 day streak',
  },
  {
    id: 'ai_editor_bronze',
    title: 'Budding Insight',
    description: 'Complete your first AI-powered task edit',
    icon: 'sparkles',
    condition: (state: GamificationState) => state.aiEditCount >= 1,
    conditionText: '1 AI edit',
  },
  {
    id: 'ai_editor_silver',
    title: 'Flourishing Clarity',
    description: 'Complete 5 AI-powered task edits',
    icon: 'sparkles',
    condition: (state: GamificationState) => state.aiEditCount >= 5,
    conditionText: '5 AI edits',
  },
  {
    id: 'ai_editor_gold',
    title: 'Blossoming Wisdom',
    description: 'Complete 20 AI-powered task edits',
    icon: 'sparkles',
    condition: (state: GamificationState) => state.aiEditCount >= 20,
    conditionText: '20 AI edits',
  },
  {
    id: 'divine_editor',
    title: 'Luminous Expression',
    description: 'Edit 50 words with AI',
    icon: 'sparkles',
    condition: (state: GamificationState) => state.aiWordsEdited >= 50,
    conditionText: '50 words edited with AI',
  },
]

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS
}
