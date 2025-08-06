/**
 * Statistics tracking and visualization
 * Handles header statistics display
 */

class StatisticsManager {
  constructor() {
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.isInitialized = true;
  }

  setupEventListeners() {
    // Update on task changes
    if (typeof bus !== 'undefined') {
      bus.addEventListener('tasksUpdated', () => {
        this.updateStatistics();
      });
    }
  }

  updateStatistics() {
    const tasks = storageManager.getTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update header statistics
    const totalEl = document.getElementById('headerTotalTasks');
    const completedEl = document.getElementById('headerCompletedTasks');
    const progressText = document.getElementById('headerProgressText');
    const progressFill = document.getElementById('headerProgressRing');
    
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (progressText) progressText.textContent = `${percentage}%`;
    
    // Update progress ring
    if (progressFill) {
      const circumference = 2 * Math.PI * 10;
      const offset = circumference - (percentage / 100) * circumference;
      progressFill.style.strokeDasharray = `${circumference}`;
      progressFill.style.strokeDashoffset = offset;
    }

    // Update karma if available
    if (typeof gamificationManager !== 'undefined') {
      const karmaEl = document.getElementById('headerKarmaScore');
      if (karmaEl) {
        karmaEl.textContent = gamificationManager.karmaPoints;
      }
    }
  }

  isReady() {
    return this.isInitialized;
  }
}

// Create global statistics manager
const statisticsManager = new StatisticsManager();

// Export for debugging
if (window.DEV) {
  window.statisticsManager = statisticsManager;
}
