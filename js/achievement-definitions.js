/**
 * Achievement Definitions
 * Centralized definitions for all achievements in the app
 */

const ACHIEVEMENTS = {
  mindful_beginning: {
    id: 'mindful_beginning',
    name: 'Mindful Beginning',
    description: 'Your journey starts with a single step',
    icon: 'sprout',
    condition: (stats) => stats.karmaPoints >= 1,
    conditionText: 'Earn 1 karma point'
  },
  gentle_progress: {
    id: 'gentle_progress',
    name: 'Gentle Progress',
    description: 'Small steps lead to great changes',
    icon: 'trending-up',
    condition: (stats) => stats.dailyStats.completed >= 5,
    conditionText: 'Complete 5 tasks in a day'
  },
  mindful_refinement: {
    id: 'mindful_refinement',
    name: 'Mindful Refinement',
    description: 'Each adjustment brings clarity',
    icon: 'pencil',
    condition: (stats) => stats.dailyStats.edited >= 3,
    conditionText: 'Edit 3 tasks in a day'
  },
  peaceful_presence: {
    id: 'peaceful_presence',
    name: 'Peaceful Presence',
    description: 'Cultivating calm through consistency',
    icon: 'leaf',
    condition: (stats) => stats.karmaPoints >= 25,
    conditionText: 'Earn 25 karma points'
  },
  daily_harmony: {
    id: 'daily_harmony',
    name: 'Daily Harmony',
    description: 'Finding balance in each day',
    icon: 'check-circle',
    condition: (stats) => stats.dailyCompleted,
    conditionText: 'Complete all tasks created today'
  },
  first_task_created: {
    id: 'first_task_created',
    name: 'First Creation',
    description: 'Bringing ideas to life',
    icon: 'plus-circle',
    condition: (stats) => stats.firstTaskCreated,
    conditionText: 'Create your first task'
  },
  first_task_deleted: {
    id: 'first_task_deleted',
    name: 'Mindful Release',
    description: 'Letting go with intention',
    icon: 'trash-2',
    condition: (stats) => stats.firstTaskDeleted,
    conditionText: 'Delete your first task'
  },
  first_task_edited: {
    id: 'first_task_edited',
    name: 'First Refinement',
    description: 'Improving with care',
    icon: 'edit',
    condition: (stats) => stats.firstTaskEdited,
    conditionText: 'Edit your first task'
  },
  ai_editor_bronze: {
    id: 'ai_editor_bronze',
    name: 'Budding Insight',
    description: 'Complete 1 AI edit',
    icon: 'ai-bronze',
    condition: (stats) => stats.aiEditCount >= 1,
    conditionText: 'Complete 1 AI edit'
  },
  ai_editor_silver: {
    id: 'ai_editor_silver',
    name: 'Flourishing Clarity',
    description: 'Complete 5 AI edits',
    icon: 'ai-silver',
    condition: (stats) => stats.aiEditCount >= 5,
    conditionText: 'Complete 5 AI edits'
  },
  ai_editor_gold: {
    id: 'ai_editor_gold',
    name: 'Blossoming Wisdom',
    description: 'Complete 20 AI edits',
    icon: 'ai-gold',
    condition: (stats) => stats.aiEditCount >= 20,
    conditionText: 'Complete 20 AI edits'
  },
  divine_editor: {
    id: 'divine_editor',
    name: 'Luminous Expression',
    description: 'Edit over 50 words with AI',
    icon: 'divine-editor',
    condition: (stats) => stats.aiWordsEdited >= 50,
    conditionText: 'Edit 50 words with AI'
  }
};

// Helper function to get achievement by ID
function getAchievementById(id) {
  return ACHIEVEMENTS[id];
}

// Helper function to get all achievements
function getAllAchievements() {
  return Object.values(ACHIEVEMENTS);
}

// Helper function to render achievement icon with emoji support
function renderAchievementIcon(iconName) {
  // Check if the icon is already an emoji
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}-\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}-\u{2667}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}-\u{26F6}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2767}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}-\u{3299}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}-\u{2667}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}-\u{26F6}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2767}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]+$/gu;
  if (emojiRegex.test(iconName)) {
    return iconName;
  }
  
  // Fallback to emoji if icon name doesn't match
  const emojiFallbacks = {
    'sprout': '🌱',
    'trending-up': '📈',
    'pencil': '✏️',
    'leaf': '🍃',
    'check-circle': '✅',
    'plus-circle': '➕',
    'trash-2': '🗑️',
    'edit': '✏️',
    // AI achievement icons
    'ai-bronze': '🥉',
    'ai-silver': '🥈',
    'ai-gold': '🥇',
    'divine-editor': '✨',
    // Add emojis from affirmations.js
    '🌱': '🌱',
    '🍃': '🍃',
    '🕊️': '🕊️',
    '✨': '✨',
    '🧘': '🧘',
    '🌸': '🌸',
    '🌿': '🌿'
  };
  return emojiFallbacks[iconName] || '🏆';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ACHIEVEMENTS,
    getAchievementById,
    getAllAchievements
  };
} else {
  // For browser use
  window.AchievementDefinitions = {
    ACHIEVEMENTS,
    getAchievementById,
    getAllAchievements
  };
}
