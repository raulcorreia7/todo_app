/**
 * Safe localStorage wrapper with versioning and error handling
 */

class StorageManager {
    constructor() {
        this.version = '1.0.0';
        this.key = 'luxury-todos-v1';
        this.gamificationKey = 'luxury-todo-gamification';
        this.statsKey = 'luxury-todo-stats';
        this.isInitialized = false;
        this.settingsCache = null;
        this.settingsLoaded = false;
    }

    /**
     * Initialize storage manager
     */
    init() {
        this.isInitialized = true;
        this.settingsLoaded = this.checkLocalStorageAccess();
        return true;
    }

    /**
     * Check if storage is ready
     * @returns {boolean} Storage ready state
     */
    isReady() {
        return this.isInitialized && this.settingsLoaded && typeof localStorage !== 'undefined';
    }

    /**
     * Check if localStorage is accessible
     * @returns {boolean} Whether localStorage is accessible
     */
    checkLocalStorageAccess() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not accessible:', e);
            return false;
        }
    }

    /**
     * Get all tasks from storage
     * @returns {Array} Array of task objects
     */
    getTasks() {
        if (!this.isReady()) return [];
        
        try {
            const data = localStorage.getItem(this.key);
            if (!data) return [];
            
            const parsed = JSON.parse(data);
            if (parsed.version !== this.version) {
                return this.migrateData(parsed);
            }
            
            return Array.isArray(parsed.tasks) ? parsed.tasks : [];
        } catch (error) {
            console.warn('Failed to load tasks from storage:', error);
            return [];
        }
    }

    /**
     * Save tasks to storage
     * @param {Array} tasks - Array of task objects
     */
    setTasks(tasks) {
        if (!this.isReady()) return false;
        
        try {
            const data = {
                version: this.version,
                tasks: Array.isArray(tasks) ? tasks : [],
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save tasks to storage:', error);
            return false;
        }
    }

    /**
     * Get gamification data
     * @returns {Object} Gamification data
     */
    getGamification() {
        if (!this.isReady()) return this.getDefaultGamification();
        
        try {
            const data = localStorage.getItem(this.gamificationKey);
            return data ? JSON.parse(data) : this.getDefaultGamification();
        } catch (error) {
            console.warn('Failed to load gamification data:', error);
            return this.getDefaultGamification();
        }
    }

    /**
     * Save gamification data
     * @param {Object} data - Gamification data
     */
    setGamification(data) {
        if (!this.isReady()) return false;
        
        try {
            localStorage.setItem(this.gamificationKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save gamification data:', error);
            return false;
        }
    }

    /**
     * Get achievements from gamification data
     * @returns {Array} Array of achievement objects
     */
    getAchievements() {
        const gamification = this.getGamification();
        return gamification.achievements || [];
    }

    /**
     * Get stats data
     * @returns {Object} Stats data
     */
    getStats() {
        if (!this.isReady()) return this.getDefaultStats();
        
        try {
            const data = localStorage.getItem(this.statsKey);
            return data ? JSON.parse(data) : this.getDefaultStats();
        } catch (error) {
            console.warn('Failed to load stats:', error);
            return this.getDefaultStats();
        }
    }

    /**
     * Save stats data
     * @param {Object} stats - Stats data
     */
    saveStats(stats) {
        if (!this.isReady()) return false;
        
        try {
            localStorage.setItem(this.statsKey, JSON.stringify(stats));
            return true;
        } catch (error) {
            console.warn('Failed to save stats:', error);
            return false;
        }
    }

    /**
     * Get settings from storage
     * @returns {Object} Settings object
     */
    getSettings() {
        if (!this.isReady()) return this.getDefaultSettings();
        
        try {
            const data = localStorage.getItem('luxury-todo-settings');
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Save settings to storage
     * @param {Object} settings - Settings object
     */
    setSettings(settings) {
        if (!this.isReady()) return false;
        
        try {
            localStorage.setItem('luxury-todo-settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.warn('Failed to save settings:', error);
            return false;
        }
    }

    /**
     * Get default gamification data
     * @returns {Object} Default gamification data
     */
    getDefaultGamification() {
        return {
            karmaPoints: 0,
            achievements: [],
            dailyStats: {
                completed: 0,
                edited: 0,
                deleted: 0,
                focusTime: 0,
                lastUpdate: new Date().toDateString()
            }
        };
    }

    /**
     * Get default stats data
     * @returns {Object} Default stats data
     */
    getDefaultStats() {
        return {
            totalTasks: 0,
            completedTasks: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalFocusTime: 0,
            lastActivity: new Date().toISOString()
        };
    }

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            theme: 'midnight',
            darkMode: true,
            soundEnabled: false,
            volume: 50,
            animations: true,
            font: 'inter'
        };
    }

    /**
     * Migrate old data format to new version
     * @param {Object} oldData - Old data format
     * @returns {Array} Migrated tasks
     */
    migrateData(oldData) {
        if (Array.isArray(oldData)) {
            // Old format was just an array of tasks
            return oldData;
        }
        return [];
    }

    /**
     * Clear all data (for debugging)
     */
    clearAll() {
        if (!this.isReady()) return false;
        
        try {
            localStorage.removeItem(this.key);
            localStorage.removeItem(this.gamificationKey);
            localStorage.removeItem(this.statsKey);
            localStorage.removeItem('luxury-todo-settings');
            return true;
        } catch (error) {
            console.warn('Failed to clear storage:', error);
            return false;
        }
    }
}

// Create global storage manager
const storageManager = new StorageManager();

// Initialize storage manager immediately
storageManager.init();

// Export for debugging
if (window.DEV) {
    window.storageManager = storageManager;
}
