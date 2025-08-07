/**
 * Statistics tracking and visualization
 * Handles header statistics display
 */

class StatisticsManager {
  constructor() {
    this.isInitialized = false;
    this.aiEditCount = 0;
    this.aiWordsEdited = 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.isInitialized = true;
    
    // Register reset handler for resetting statistics
    if (typeof bus !== 'undefined' && typeof bus.registerResetHandler === 'function') {
      bus.registerResetHandler(() => {
        this.resetAllStats();
      });
    }
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

  incrementAIEditCount() {
    this.aiEditCount++;
    this.save();
  }
  
  incrementAIWordsEdited(wordCount) {
    this.aiWordsEdited += wordCount;
    this.save();
  }
  
  save() {
    // Save AI statistics to storage
    const existingData = storageManager.getStatistics() || {};
    storageManager.setStatistics({
      ...existingData,
      aiEditCount: this.aiEditCount,
      aiWordsEdited: this.aiWordsEdited
    });
  }
  
  load() {
    // Load AI statistics from storage
    const data = storageManager.getStatistics() || {};
    this.aiEditCount = data.aiEditCount || 0;
    this.aiWordsEdited = data.aiWordsEdited || 0;
  }

  /**
   * Reset all statistics to default values
   * @returns {boolean} Whether the operation succeeded
   */
  resetAllStats() {
    try {
      // Reset AI statistics
      this.aiEditCount = 0;
      this.aiWordsEdited = 0;
      
      // Reset storage statistics
      storageManager.saveStats(storageManager.getDefaultStats());
      
      // Update UI
      this.updateStatistics();
      
      return true;
    } catch (error) {
      console.warn('Failed to reset statistics:', error);
      return false;
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
