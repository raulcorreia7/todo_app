/**
 * Simple Achievement System
 * Shows achievements for 1, 3, 7, 10, 15, 20 tasks with golden borders and celebration
 */

class AffirmationManager {
  constructor() {
    this.shownToday = new Set();
    this.init();
  }

  init() {
    this.loadShownAchievements();
  }

  /**
   * Load which achievements have been shown today
   */
  loadShownAchievements() {
    const data = storageManager.getShownAffirmations();
    const today = new Date().toDateString();

    if (data && data.date === today) {
      this.shownToday = new Set(data.achievements || []);
    } else {
      this.shownToday = new Set();
      this.saveShownAchievements();
    }
  }

  /**
   * Save shown achievements to storage
   */
  saveShownAchievements() {
    storageManager.setShownAffirmations({
      date: new Date().toDateString(),
      achievements: Array.from(this.shownToday),
    });
  }

  /**
   * Check if should show achievement after task completion
   */
  checkForAffirmation() {
    const tasks = storageManager.getTasks();
    const today = new Date().toDateString();
    const todayCompleted = tasks.filter(
      (task) =>
        task.completed && new Date(task.updatedAt).toDateString() === today
    ).length;

    // Show achievements for 1, 3, 7, 10, 15, 20 tasks
    const achievementCounts = [1, 3, 7, 10, 15, 20];
    if (achievementCounts.includes(todayCompleted)) {
      const achievement = this.getAchievement(todayCompleted);
      this.displayAchievement(achievement);
    }
  }

  /**
   * Get zen achievement based on task count
   */
  getAchievement(completedCount) {
    const achievements = {
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

    return (
      achievements[completedCount] || {
        title: "Mindful Moment",
        message: `${completedCount} mindful completions`,
        icon: "🌿",
      }
    );
  }

  /**
   * Display zen achievement with subtle notification
   */
  displayAchievement(achievement) {
    // Use the existing zen notification system
    if (typeof gamificationManager !== "undefined") {
      // Create a temporary achievement object for zen notification
      const zenAchievement = {
        name: achievement.title,
        description: achievement.message,
        icon: achievement.icon || "🌿",
      };
      gamificationManager.showZenAchievementNotification(zenAchievement);
    }
  }
}

// Extend storage manager for achievements
StorageManager.prototype.getShownAffirmations = function () {
  if (!this.isReady()) return null;

  try {
    const data = localStorage.getItem("luxury-todo-affirmations");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to load shown achievements:", error);
    return null;
  }
};

StorageManager.prototype.setShownAffirmations = function (data) {
  if (!this.isReady()) return false;

  try {
    localStorage.setItem("luxury-todo-affirmations", JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("Failed to save shown achievements:", error);
    return false;
  }
};

// Create global achievement manager
const affirmationManager = new AffirmationManager();

// Export for debugging
if (window.DEV) {
  window.affirmationManager = affirmationManager;
}
