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
      focusTime: 0,
      lastUpdate: new Date().toDateString()
    };
    
    // Track first-time events
    this.firstTaskCreated = false;
    this.firstTaskDeleted = false;
    this.firstTaskEdited = false;
    
    this.achievementQueue = [];
    this.isProcessingQueue = false;
    
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
    
    // Load first-time event flags
    this.firstTaskCreated = data.firstTaskCreated || false;
    this.firstTaskDeleted = data.firstTaskDeleted || false;
    this.firstTaskEdited = data.firstTaskEdited || false;
  }

  saveData() {
    storageManager.setGamification({
      karmaPoints: this.karmaPoints,
      achievements: this.achievements,
      dailyStats: this.dailyStats,
      firstTaskCreated: this.firstTaskCreated,
      firstTaskDeleted: this.firstTaskDeleted,
      firstTaskEdited: this.firstTaskEdited
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
    
    // Check if this is the first task created
    if (!this.firstTaskCreated) {
      this.firstTaskCreated = true;
      this.unlockAchievement(AchievementDefinitions.getAchievementById('first_task_created'));
    }
    
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
      
      // Play victory sound
      if (typeof audioManager !== 'undefined') {
        audioManager.play('victory');
      }
    }
  }

  editTask() {
    this.karmaPoints += 2;
    this.dailyStats.edited += 1;
    
    // Check if this is the first task edited
    if (!this.firstTaskEdited) {
      this.firstTaskEdited = true;
      this.unlockAchievement(AchievementDefinitions.getAchievementById('first_task_edited'));
    }
    
    this.checkAchievements();
    this.saveData();
    this.updateUI();
  }

  deleteTask() {
    this.dailyStats.deleted += 1;
    
    // Check if this is the first task deleted
    if (!this.firstTaskDeleted) {
      this.firstTaskDeleted = true;
      this.unlockAchievement(AchievementDefinitions.getAchievementById('first_task_deleted'));
    }
    
    this.saveData();
    this.updateUI();
  }

  checkAchievements() {
    const allAchievements = AchievementDefinitions.getAllAchievements();
    
    allAchievements.forEach(achievement => {
      if (!this.hasAchievement(achievement.id) && achievement.condition(this)) {
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
    
    // Add to queue instead of showing immediately
    this.achievementQueue.push(achievement);
    
    // Start queue processing if not already running
    if (!this.isProcessingQueue) {
      this.processAchievementQueue();
    }
  }

  checkDailyCompletion() {
    const tasks = storageManager.getTasks();
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(t => 
      new Date(t.createdAt).toDateString() === today
    );
    return todayTasks.length > 0 && todayTasks.every(t => t.completed);
  }

  renderAchievementIcon(iconName) {
    try {
      // Check if Lucide is loaded and has createIcon function
      if (typeof lucide !== 'undefined' && typeof lucide.createIcon === 'function') {
        const iconElement = document.createElement('span');
        iconElement.className = 'zen-achievement-icon';
        iconElement.innerHTML = lucide.createIcon(iconName, {
          'class': 'zen-achievement-icon-svg',
          'stroke': 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        });
        return iconElement.outerHTML;
      }
    } catch (error) {
      console.warn('Lucide icon rendering failed, using fallback:', error);
    }
    
    // Check if the icon is already an emoji
    const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}-\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}-\u{2667}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}-\u{26F6}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2767}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}-\u{3299}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}-\u{2667}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}-\u{26F6}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2767}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]+$/gu;
    if (emojiRegex.test(iconName)) {
      return iconName;
    }
    
    // Fallback to emoji if Lucide not loaded or fails
    const emojiFallbacks = {
      'sprout': '🌱',
      'trending-up': '📈',
      'pencil': '✏️',
      'leaf': '🍃',
      'check-circle': '✅',
      'plus-circle': '➕',
      'trash-2': '🗑️',
      'edit': '✏️',
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

  showZenAchievementNotification(achievement) {
    // Clear any existing notification
    const existingNotification = document.querySelector('.zen-achievement-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'zen-achievement-notification';
    
    const iconHtml = this.renderAchievementIcon(achievement.icon);
    
    notification.innerHTML = `
      <div class="zen-achievement-content">
        <div class="zen-achievement-text">Mindful moment</div>
        <div class="zen-achievement-name">
          <span class="zen-achievement-icon">${iconHtml}</span>
          ${achievement.name}
        </div>
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
      setTimeout(() => {
        notification.remove();
        this.processAchievementQueue();
      }, 600);
    }, 2500);
  }

  async processAchievementQueue() {
    if (this.achievementQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }
    
    this.isProcessingQueue = true;
    const achievement = this.achievementQueue.shift();
    
    // Show the achievement
    await this.showZenAchievementNotification(achievement);
  }

  celebrateVictory() {
    // Subtle completion acknowledgment instead of epic celebration
    if (typeof affirmationManager !== 'undefined') {
      // Let affirmation system handle the gentle acknowledgment
      return;
    }
  }

  resetStats() {
    this.karmaPoints = 0;
    this.achievements = [];
    this.dailyStats = this.getDefaultDailyStats();
    this.firstTaskCreated = false;
    this.firstTaskDeleted = false;
    this.firstTaskEdited = false;
    this.achievementQueue = [];
    this.isProcessingQueue = false;
    this.saveData();
    this.updateUI();
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
      dailyStats: this.dailyStats,
      firstTaskCreated: this.firstTaskCreated,
      firstTaskDeleted: this.firstTaskDeleted,
      firstTaskEdited: this.firstTaskEdited,
      dailyCompleted: this.checkDailyCompletion()
    };
  }
}

// Create global gamification manager
const gamificationManager = new GamificationManager();

// Export for debugging
if (window.DEV) {
  window.gamificationManager = gamificationManager;
}
