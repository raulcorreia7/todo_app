/**
 * Achievement System
 * Centralized achievement checking and management
 */

class Achievements {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.isInitialized = true;
  }

  /**
   * Check for newly unlocked achievements
   */
  checkForNewAchievements() {
    if (!this.isInitialized) return;
    
    // The gamification manager already handles achievement checking
    // This method is provided for compatibility with the ai-providers.js call
    if (typeof gamificationManager !== 'undefined' && gamificationManager) {
      gamificationManager.checkAchievements();
    }
  }

  /**
   * Check if an achievement is unlocked
   */
  hasAchievement(id) {
    if (typeof gamificationManager !== 'undefined' && gamificationManager) {
      return gamificationManager.hasAchievement(id);
    }
    return false;
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    if (typeof AchievementDefinitions !== 'undefined' && AchievementDefinitions) {
      return AchievementDefinitions.getAllAchievements();
    }
    return [];
  }

  /**
   * Get achievement by ID
   */
  getAchievementById(id) {
    if (typeof AchievementDefinitions !== 'undefined' && AchievementDefinitions) {
      return AchievementDefinitions.getAchievementById(id);
    }
    return null;
  }
}

// Create global achievements instance
const achievements = new Achievements();

// Export for debugging
if (window.DEV) {
  window.achievements = achievements;
}

// Global exposure for app integration
try {
  window.Achievements = achievements;
} catch (_) {}