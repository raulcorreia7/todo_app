/**
 * Progress tracking and visualization
 * Handles progress ring, statistics, and daily insights
 */

class ProgressManager {
  constructor() {
    this.isOpen = false;
    this.isInitialized = false;
    this.progressPanel = null;
    
    this.init();
  }

  init() {
    this.progressPanel = document.getElementById('progressPanel');
    this.setupEventListeners();
    this.isInitialized = true;
  }

  setupEventListeners() {
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.progressPanel.contains(e.target) && !e.target.closest('#progressBtn')) {
        this.closeProgress();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeProgress();
      }
    });

    // Update on task changes
    if (typeof bus !== 'undefined') {
      bus.addEventListener('tasksUpdated', () => this.updateProgress());
    }
  }

  toggleProgress() {
    if (this.isOpen) {
      this.closeProgress();
    } else {
      this.openProgress();
    }
  }

  openProgress() {
    this.isOpen = true;
    this.progressPanel.classList.add('open');
    this.updateProgress();
    
    if (typeof audioManager !== 'undefined') {
      audioManager.play('progress');
    }
  }

  closeProgress() {
    this.isOpen = false;
    this.progressPanel.classList.remove('open');
  }

  updateProgress() {
    const tasks = storageManager.getTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update progress ring
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-percentage');
    
    if (progressFill) {
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (percentage / 100) * circumference;
      progressFill.style.strokeDasharray = `${circumference} ${circumference}`;
      progressFill.style.strokeDashoffset = offset;
    }
    
    if (progressText) {
      progressText.textContent = `${percentage}%`;
    }

    // Update stats
    const totalEl = document.getElementById('totalTasks');
    const completedEl = document.getElementById('completedTasks');
    const karmaEl = document.getElementById('karmaPoints');
    
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

// Create global progress manager
const progressManager = new ProgressManager();

// Export for debugging
if (window.DEV) {
  window.progressManager = progressManager;
}
