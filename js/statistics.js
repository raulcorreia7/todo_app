/**
 * Statistics tracking and visualization
 * Handles statistics ring, statistics, and insights
 */

class StatisticsManager {
  constructor() {
    this.isOpen = false;
    this.isInitialized = false;
    this.statisticsPanel = null;
    
    this.init();
  }

  init() {
    this.statisticsPanel = document.getElementById('statisticsPanel');
    this.setupEventListeners();
    this.isInitialized = true;
  }

  setupEventListeners() {
    // Update on task changes
    if (typeof bus !== 'undefined') {
      bus.addEventListener('tasksUpdated', () => {
        if (this.isOpen) {
          this.updateStatistics();
        }
      });
    }
  }

  toggleStatistics() {
    if (this.isOpen) {
      // Panel is already open, do nothing
      return;
    } else {
      this.openStatistics();
    }
  }

  openStatistics() {
    this.isOpen = true;
    this.statisticsPanel.classList.add('open');
    this.updateStatistics();
    
    if (typeof audioManager !== 'undefined') {
      audioManager.play('progress');
    }
  }

  closeStatistics() {
    this.isOpen = false;
    this.statisticsPanel.classList.remove('open');
  }

  updateStatistics() {
    const tasks = storageManager.getTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update progress ring
    const progressFill = document.getElementById('statsProgressRing');
    const progressText = document.getElementById('statsPercentage');
    
    if (progressFill) {
      const circumference = 2 * Math.PI * 60;
      const offset = circumference - (percentage / 100) * circumference;
      progressFill.style.strokeDasharray = `${circumference} ${circumference}`;
      progressFill.style.strokeDashoffset = offset;
    }
    
    if (progressText) {
      progressText.textContent = `${percentage}%`;
    }

    // Update stats
    const totalEl = document.getElementById('statsTotal');
    const completedEl = document.getElementById('statsCompleted');
    const karmaEl = document.getElementById('statsKarma');
    
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    
    if (karmaEl && typeof gamificationManager !== 'undefined') {
      karmaEl.textContent = gamificationManager.karmaPoints;
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
