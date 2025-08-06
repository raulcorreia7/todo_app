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

    // Update header statistics
    const totalEl = document.getElementById('headerTotalTasks');
    const completedEl = document.getElementById('headerCompletedTasks');
    
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;

    // Update karma if available
    if (typeof gamificationManager !== 'undefined') {
      const karmaEl = document.getElementById('headerKarmaScore');
      if (karmaEl && gamificationManager.karmaPoints !== undefined) {
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
