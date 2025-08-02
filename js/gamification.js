/**
 * Gamification system
 * Handles karma points, achievements, and celebration effects
 */

class GamificationManager {
  constructor() {
    this.karmaPoints = 0;
    this.achievements = [];
    this.dailyStats = {
      completed: 0,
      edited: 0,
      deleted: 0,
      focusTime: 0
    };
    
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.loadData();
    this.isInitialized = true;
  }

  loadData() {
    const data = storageManager.getGamification();
    this.karmaPoints = data.karmaPoints || 0;
    this.achievements = data.achievements || [];
    this.dailyStats = data.dailyStats || this.getDefaultDailyStats();
  }

  saveData() {
    storageManager.setGamification({
      karmaPoints: this.karmaPoints,
      achievements: this.achievements,
      dailyStats: this.dailyStats
    });
  }

  getDefaultDailyStats() {
    return {
      completed: 0,
      edited: 0,
      deleted: 0,
      focusTime: 0,
      lastUpdate: new Date().toDateString()
    };
  }

  addTask() {
    this.karmaPoints += 1;
    this.checkAchievements();
    this.saveData();
    this.updateUI();
  }

  completeTask() {
    this.karmaPoints += 1;
    this.dailyStats.completed += 1;
    this.checkAchievements();
    this.saveData();
    this.updateUI();
    
    // Check for affirmation
    if (typeof affirmationManager !== 'undefined') {
      affirmationManager.checkForAffirmation();
    }
    
    // Check for victory
    const tasks = storageManager.getTasks();
    const completed = tasks.filter(t => t.completed).length;
    if (completed === tasks.length && tasks.length > 0) {
      this.celebrateVictory();
    }
  }

  editTask() {
    this.karmaPoints += 2;
    this.dailyStats.edited += 1;
    this.checkAchievements();
    this.saveData();
    this.updateUI();
  }

  deleteTask() {
    this.dailyStats.deleted += 1;
    this.saveData();
    this.updateUI();
  }

  checkAchievements() {
    const achievements = [
      { id: 'mindful_beginning', name: 'Mindful Beginning', description: 'Your journey starts with a single step', condition: () => this.karmaPoints >= 1 },
      { id: 'gentle_progress', name: 'Gentle Progress', description: 'Small steps lead to great changes', condition: () => this.dailyStats.completed >= 5 },
      { id: 'mindful_refinement', name: 'Mindful Refinement', description: 'Each adjustment brings clarity', condition: () => this.dailyStats.edited >= 3 },
      { id: 'peaceful_presence', name: 'Peaceful Presence', description: 'Cultivating calm through consistency', condition: () => this.karmaPoints >= 25 },
      { id: 'daily_harmony', name: 'Daily Harmony', description: 'Finding balance in each day', condition: () => this.checkDailyCompletion() }
    ];

    achievements.forEach(achievement => {
      if (!this.hasAchievement(achievement.id) && achievement.condition()) {
        this.unlockAchievement(achievement);
      }
    });
  }

  hasAchievement(id) {
    return this.achievements.some(a => a.id === id);
  }

  unlockAchievement(achievement) {
    this.achievements.push({
      ...achievement,
      unlockedAt: new Date().toISOString()
    });
    
    this.showZenAchievementNotification(achievement);
  }

  checkDailyCompletion() {
    const tasks = storageManager.getTasks();
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(t => 
      new Date(t.createdAt).toDateString() === today
    );
    return todayTasks.length > 0 && todayTasks.every(t => t.completed);
  }

  showZenAchievementNotification(achievement) {
    // Create subtle zen notification
    const notification = document.createElement('div');
    notification.className = 'zen-achievement-notification';
    notification.innerHTML = `
      <div class="zen-achievement-content">
        <div class="zen-achievement-text">Mindful moment</div>
        <div class="zen-achievement-name">${achievement.name}</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Gentle fade in
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Gentle fade out
    setTimeout(() => {
      notification.classList.add('exit');
      setTimeout(() => notification.remove(), 600);
    }, 2500);
  }

  celebrateVictory() {
    // Subtle completion acknowledgment instead of epic celebration
    if (typeof affirmationManager !== 'undefined') {
      // Let affirmation system handle the gentle acknowledgment
      return;
    }
  }

  updateUI() {
    const karmaElement = document.getElementById('karmaPoints');
    if (karmaElement) {
      karmaElement.textContent = this.karmaPoints;
    }
  }

  getStats() {
    return {
      karmaPoints: this.karmaPoints,
      achievements: this.achievements,
      dailyStats: this.dailyStats
    };
  }
}

// Create global gamification manager
const gamificationManager = new GamificationManager();

// Export for debugging
if (window.DEV) {
  window.gamificationManager = gamificationManager;
}
