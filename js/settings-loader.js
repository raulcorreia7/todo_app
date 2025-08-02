/**
 * Settings Loader - Ensures settings are loaded reliably regardless of refresh count
 * Implements robust settings loading with retry mechanisms and synchronization
 */

class SettingsLoader {
  constructor() {
    this.isLoaded = false;
    this.maxRetries = 5;
    this.retryDelay = 100;
    this.settingsCache = null;
    this.loadPromise = null;
    this.init();
  }

  init() {
    // Ensure we only load settings once, even on rapid refreshes
    if (this.loadPromise) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadSettings());
    } else {
      this.loadSettings();
    }
  }

  async loadSettings() {
    if (this.loadPromise) return this.loadPromise;
    
    this.loadPromise = this.loadSettingsWithRetry();
    return this.loadPromise;
  }

  async loadSettingsWithRetry() {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Ensure storage is ready
        await this.waitForStorage();
        
        // Load settings from storage
        const settings = await this.getSettingsWithTimeout();
        
        // Cache settings for reliability
        this.settingsCache = settings;
        
        // Apply settings to all components
        await this.applySettingsSafely(settings);
        
        this.isLoaded = true;
        console.log('Settings loaded successfully on attempt', attempt);
        
        // Emit event for other components
        this.emitSettingsLoaded(settings);
        
        return settings;
        
      } catch (error) {
        lastError = error;
        console.warn(`Settings load attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    console.error('Failed to load settings after all retries:', lastError);
    // Don't apply default settings on failure - use cached or empty settings
    const fallbackSettings = this.settingsCache || this.getMinimalSettings();
    await this.applySettingsSafely(fallbackSettings);
    this.isLoaded = true;
    return fallbackSettings;
  }

  async waitForStorage() {
    return new Promise((resolve, reject) => {
      const maxWait = 5000; // 5 seconds max
      const startTime = Date.now();
      
      const checkStorage = () => {
        if (storageManager && storageManager.isReady()) {
          resolve();
        } else if (Date.now() - startTime > maxWait) {
          reject(new Error('Storage timeout'));
        } else {
          setTimeout(checkStorage, 50);
        }
      };
      
      checkStorage();
    });
  }

  async getSettingsWithTimeout() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Settings load timeout'));
      }, 3000);
      
      try {
        const settings = storageManager.getSettings();
        clearTimeout(timeout);
        resolve(settings);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async applySettingsSafely(settings) {
    // Ensure all components are ready before applying settings
    await this.waitForComponents();
    
    // Apply settings with error handling for each component
    const promises = [];
    
    // Apply theme
    if (settings.theme) {
      promises.push(this.applyTheme(settings.theme));
    }
    
    // Apply font
    if (settings.font) {
      promises.push(this.applyFont(settings.font));
    }
    
    // Apply sound settings
    promises.push(this.applySoundSettings(settings));
    
    // Update settings manager
    promises.push(this.updateSettingsManager(settings));
    
    await Promise.allSettled(promises);
    
    // Mark that settings have been applied by loader
    window.settingsAppliedByLoader = true;
  }

  async waitForComponents() {
    const checkComponents = () => {
      return (
        typeof themeManager !== 'undefined' && themeManager.isReady &&
        typeof settingsManager !== 'undefined' && settingsManager.isInitialized &&
        typeof audioManager !== 'undefined'
      );
    };
    
    return new Promise((resolve) => {
      const check = () => {
        if (checkComponents()) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  async applyTheme(theme) {
    try {
      if (typeof themeManager !== 'undefined' && themeManager.changeTheme) {
        themeManager.changeTheme(theme);
      }
    } catch (error) {
      console.warn('Failed to apply theme:', error);
    }
  }

  async applyFont(font) {
    try {
      if (typeof settingsManager !== 'undefined' && settingsManager.setFont) {
        settingsManager.setFont(font);
      }
    } catch (error) {
      console.warn('Failed to apply font:', error);
    }
  }

  async applySoundSettings(settings) {
    try {
      if (typeof audioManager !== 'undefined') {
        audioManager.setEnabled(settings.soundEnabled !== false);
        audioManager.setVolume(settings.volume || 50);
      }
    } catch (error) {
      console.warn('Failed to apply sound settings:', error);
    }
  }

  async updateSettingsManager(settings) {
    try {
      if (typeof settingsManager !== 'undefined') {
        settingsManager.currentTheme = settings.theme || 'midnight';
        settingsManager.currentFont = settings.font || 'inter';
        settingsManager.soundEnabled = settings.soundEnabled !== false;
        settingsManager.volume = settings.volume || 50;
        
        if (settingsManager.updateUI) {
          settingsManager.updateUI();
        }
      }
    } catch (error) {
      console.warn('Failed to update settings manager:', error);
    }
  }

  applyDefaultSettings() {
    const defaultSettings = this.getDefaultSettings();
    this.applySettingsSafely(defaultSettings);
    this.emitSettingsLoaded(defaultSettings);
  }

  getDefaultSettings() {
    return {
      theme: 'midnight',
      font: 'inter',
      soundEnabled: false,
      volume: 50,
      animations: true
    };
  }

  emitSettingsLoaded(settings) {
    // Emit custom event for other components
    const event = new CustomEvent('settingsLoaded', { detail: settings });
    document.dispatchEvent(event);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isReady() {
    return this.isLoaded;
  }

  /**
   * Force reload settings (useful for debugging)
   */
  async reloadSettings() {
    this.isLoaded = false;
    this.loadPromise = null;
    return this.loadSettings();
  }
}

// Create global settings loader
const settingsLoader = new SettingsLoader();

// Emergency backup - ensure settings are loaded even if everything fails
setTimeout(() => {
  if (!window.settingsAppliedByLoader && typeof storageManager !== 'undefined') {
    console.warn('Emergency settings load triggered');
    try {
      const settings = storageManager.getSettings();
      
      // Apply basic settings directly
      if (settings.theme && typeof themeManager !== 'undefined') {
        themeManager.changeTheme(settings.theme);
      }
      
      if (settings.font) {
        document.body.className = document.body.className.replace(/font-\w+/g, '');
        document.body.classList.add(`font-${settings.font}`);
      }
      
      window.settingsAppliedByLoader = true;
    } catch (error) {
      console.error('Emergency settings load failed:', error);
    }
  }
}, 2000);

// Export for debugging
if (window.DEV) {
  window.settingsLoader = settingsLoader;
}
