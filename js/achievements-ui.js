/**
 * Achievement Display System
 * Shows achievements and progress in settings modal
 */

class AchievementsUI {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.createAchievementsSection();
    this.isInitialized = true;
  }

  /**
   * Create achievements section in settings
   */
  createAchievementsSection() {
    const settingsContent = document.querySelector('.settings-content');
    if (!settingsContent) return;

    // Create achievements section
    const achievementsSection = document.createElement('div');
    achievementsSection.className = 'settings-section achievements-section';
    achievementsSection.innerHTML = `
      <h4>Achievements</h4>
      <div class="achievements-grid" id="achievementsGrid">
        ${this.renderAchievements()}
      </div>
    `;

    // Insert after sound controls
    const soundSection = settingsContent.querySelector('.settings-section:nth-child(4)');
    if (soundSection) {
      soundSection.insertAdjacentElement('afterend', achievementsSection);
    } else {
      settingsContent.appendChild(achievementsSection);
    }
  }

  /**
   * Render achievements
   */
  renderAchievements() {
    const achievements = [
      {
        id: 'mindful_beginning',
        name: 'Mindful Beginning',
        description: 'Your journey starts with a single step',
        icon: '🌱',
        progress: 0,
        max: 1,
        unlocked: false
      },
      {
        id: 'gentle_progress',
        name: 'Gentle Progress',
        description: 'Small steps lead to great changes',
        icon: '🍃',
        progress: 0,
        max: 5,
        unlocked: false
      },
      {
        id: 'mindful_refinement',
        name: 'Mindful Refinement',
        description: 'Each adjustment brings clarity',
        icon: '✨',
        progress: 0,
        max: 3,
        unlocked: false
      },
      {
        id: 'peaceful_presence',
        name: 'Peaceful Presence',
        description: 'Cultivating calm through consistency',
        icon: '🧘',
        progress: 0,
        max: 25,
        unlocked: false
      },
      {
        id: 'daily_harmony',
        name: 'Daily Harmony',
        description: 'Finding balance in each day',
        icon: '🕊️',
        progress: 0,
        max: 1,
        unlocked: false
      }
    ];

    // Update with actual progress
    const gamificationData = gamificationManager.getStats();
    const tasks = storageManager.getTasks();
    
    // Calculate progress for each achievement
    achievements.forEach(achievement => {
      switch (achievement.id) {
        case 'mindful_beginning':
          achievement.progress = tasks.length > 0 ? 1 : 0;
          achievement.unlocked = tasks.length > 0;
          break;
          
        case 'gentle_progress':
          achievement.progress = tasks.filter(t => t.completed).length;
          achievement.unlocked = achievement.progress >= achievement.max;
          break;
          
        case 'mindful_refinement':
          achievement.progress = gamificationData.dailyStats.edited || 0;
          achievement.unlocked = achievement.progress >= achievement.max;
          break;
          
        case 'peaceful_presence':
          achievement.progress = gamificationData.karmaPoints || 0;
          achievement.unlocked = achievement.progress >= achievement.max;
          break;
          
        case 'daily_harmony':
          const todayTasks = tasks.filter(t => 
            new Date(t.createdAt).toDateString() === new Date().toDateString()
          );
          achievement.progress = todayTasks.length > 0 && todayTasks.every(t => t.completed) ? 1 : 0;
          achievement.unlocked = achievement.progress >= achievement.max;
          break;
      }
    });

    return achievements.map(achievement => this.renderAchievement(achievement)).join('');
  }

  /**
   * Render individual achievement
   */
  renderAchievement(achievement) {
    const progressPercent = Math.min((achievement.progress / achievement.max) * 100, 100);
    const isUnlocked = achievement.unlocked;
    
    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" data-achievement="${achievement.id}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h5>${achievement.name}</h5>
          <p>${achievement.description}</p>
          <div class="achievement-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <span class="progress-text">${achievement.progress}/${achievement.max}</span>
          </div>
        </div>
        ${isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
      </div>
    `;
  }

  /**
   * Update achievements display
   */
  updateAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (grid) {
      grid.innerHTML = this.renderAchievements();
    }
  }

  /**
   * Show achievement unlock notification
   */
  showAchievementUnlock(achievementName, icon) {
    // Use zen-style notification instead of epic celebration
    if (typeof gamificationManager !== 'undefined') {
      // Let gamification manager handle zen notifications
      return;
    }
  }
}

// CSS styles will be added to luxury-components.css instead

// Create global achievements UI
const achievementsUI = new AchievementsUI();

// Export for debugging
if (window.DEV) {
  window.achievementsUI = achievementsUI;
}
