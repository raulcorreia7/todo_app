/**
 * Settings Manager
 * Handles settings panel, theme switching, and preferences
 */

class SettingsManager {
  constructor() {
    this.isOpen = false;
    this.isInitialized = false;
    this.settingsPanel = null;
    this.currentTheme = 'midnight';
    this.currentFont = 'inter';
    this.soundEnabled = true;
    this.volume = 50;
    
    this.init();
  }

  init() {
    this.settingsPanel = document.getElementById('settingsPanel');
    
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
        this.loadSettings();
        this.renderPaletteSelector();
        this.isInitialized = true;
      });
    } else {
      this.setupEventListeners();
      this.loadSettings();
      this.renderPaletteSelector();
      this.isInitialized = true;
    }
  }

  setupEventListeners() {
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.settingsPanel.contains(e.target) && !e.target.closest('#settingsBtn')) {
        this.closeSettings();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeSettings();
      }
    });

    // Theme toggle
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setTheme(e.target.dataset.theme);
      });
    });

    // Font selector
    document.querySelectorAll('[data-font]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFont(e.target.dataset.font);
      });
    });

    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        this.setSoundEnabled(e.target.checked);
      });
    }

    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeHandle = document.getElementById('volumeHandle');
    if (volumeSlider && volumeHandle) {
      this.setupVolumeSlider(volumeSlider, volumeHandle);
    }
  }

  loadSettings() {
    const settings = storageManager.getSettings();
    
    // Check if we have actual saved settings (not just defaults)
    const hasSavedSettings = localStorage.getItem('luxury-todo-settings') !== null;
    
    if (hasSavedSettings) {
      // Use the actual saved settings
      this.currentTheme = settings.theme;
      this.currentFont = settings.font;
      this.soundEnabled = settings.soundEnabled;
      this.volume = settings.volume;
    } else {
      // Only use defaults if no settings exist
      this.currentTheme = settings.theme || 'midnight';
      this.currentFont = settings.font || 'inter';
      this.soundEnabled = settings.soundEnabled !== false;
      this.volume = settings.volume || 50;
      
      // Save the defaults as actual settings
      this.saveSettings();
    }

    this.applyTheme(this.currentTheme);
    this.applyFont(this.currentFont);
    this.applySoundSettings();
  }

  saveSettings() {
    storageManager.setSettings({
      theme: this.currentTheme,
      font: this.currentFont,
      soundEnabled: this.soundEnabled,
      volume: this.volume
    });
  }

  toggleSettings() {
    if (this.isOpen) {
      this.closeSettings();
    } else {
      this.openSettings();
    }
  }

  openSettings() {
    this.isOpen = true;
    this.settingsPanel.classList.add('open');
    this.updateUI();
    
    if (typeof audioManager !== 'undefined') {
      audioManager.play('settings');
    }
  }

  closeSettings() {
    this.isOpen = false;
    this.settingsPanel.classList.remove('open');
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveSettings();
    
    // Update UI
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    if (typeof themeManager !== 'undefined') {
      themeManager.changeTheme(theme);
    }
    
    if (typeof audioManager !== 'undefined') {
      audioManager.play('palette');
    }
  }

  setFont(font) {
    this.currentFont = font;
    this.applyFont(font);
    this.saveSettings();
    
    // Update UI
    document.querySelectorAll('[data-font]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === font);
    });
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    this.saveSettings();
    
    if (typeof audioManager !== 'undefined') {
      audioManager.setEnabled(enabled);
    }
  }

  setVolume(volume) {
    this.volume = volume;
    this.saveSettings();
    
    if (typeof audioManager !== 'undefined') {
      audioManager.setVolume(volume);
    }
  }

  applyTheme(theme) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
  }

  applyFont(font) {
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${font}`);
  }

  applySoundSettings() {
    if (typeof audioManager !== 'undefined') {
      audioManager.setEnabled(this.soundEnabled);
      audioManager.setVolume(this.volume);
    }
  }

  renderPaletteSelector() {
    const container = document.getElementById('paletteSelector');
    if (!container) return;

    // Theme definitions with actual theme colors for preview
    const themeDefinitions = {
      midnight: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        text: '#e94560',
        glow: '#e94560',
        shadow: 'rgba(233, 69, 96, 0.3)',
        glass: 'rgba(26, 26, 46, 0.8)',
        border: 'rgba(233, 69, 96, 0.2)'
      },
      ivory: {
        primary: '#f8f9fa',
        secondary: '#e9ecef',
        accent: '#dee2e6',
        text: '#495057',
        glow: '#6c757d',
        shadow: 'rgba(108, 117, 125, 0.2)',
        glass: 'rgba(248, 249, 250, 0.8)',
        border: 'rgba(108, 117, 125, 0.1)'
      },
      champagne: {
        primary: '#fff8e7',
        secondary: '#f3e5ab',
        accent: '#daa520',
        text: '#8b4513',
        glow: '#daa520',
        shadow: 'rgba(218, 165, 32, 0.3)',
        glass: 'rgba(255, 248, 231, 0.8)',
        border: 'rgba(218, 165, 32, 0.2)'
      },
      graphite: {
        primary: '#2c2c2c',
        secondary: '#404040',
        accent: '#666666',
        text: '#cccccc',
        glow: '#999999',
        shadow: 'rgba(153, 153, 153, 0.3)',
        glass: 'rgba(44, 44, 44, 0.8)',
        border: 'rgba(153, 153, 153, 0.2)'
      },
      aurora: {
        primary: '#0a0a0a',
        secondary: '#1a1a2e',
        accent: '#16213e',
        text: '#00ff88',
        glow: '#00ff88',
        shadow: 'rgba(0, 255, 136, 0.3)',
        glass: 'rgba(10, 10, 10, 0.8)',
        border: 'rgba(0, 255, 136, 0.2)'
      },
      sakura: {
        primary: '#fff5f5',
        secondary: '#ffe0e0',
        accent: '#ffb3ba',
        text: '#8b2635',
        glow: '#ff69b4',
        shadow: 'rgba(255, 105, 180, 0.3)',
        glass: 'rgba(255, 245, 245, 0.8)',
        border: 'rgba(255, 105, 180, 0.2)'
      }
    };

    const themes = Object.keys(themeDefinitions);
    
    container.innerHTML = themes.map(themeName => {
      const theme = themeDefinitions[themeName];
      return `
        <div class="palette-swatch ${themeName === this.currentTheme ? 'active' : ''}" 
             data-theme="${themeName}" 
             data-palette="${themeName}"
             style="background-color: ${theme.glow}"
             title="${themeName}">
        </div>
      `;
    }).join('');

    // Add event listeners with theme-specific hover preview
    container.addEventListener('click', (e) => {
      const swatch = e.target.closest('.palette-swatch');
      if (swatch) {
        const themeName = swatch.dataset.palette;
        this.setTheme(themeName);
        
        // Update active state
        container.querySelectorAll('.palette-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.palette === themeName);
        });
        
        // Use themeManager for consistency
        if (typeof themeManager !== 'undefined') {
          themeManager.changeTheme(themeName);
        }
      }
    });

    // Remove any inline styles that might interfere with CSS
    container.querySelectorAll('.palette-swatch').forEach(swatch => {
      swatch.style.transform = '';
      swatch.style.boxShadow = '';
      swatch.style.borderColor = '';
    });
  }

  setupVolumeSlider(slider, handle) {
    let isDragging = false;

    const updateVolume = (e) => {
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      this.setVolume(percentage);
      this.updateVolumeUI(percentage);
    };

    const onMouseDown = (e) => {
      isDragging = true;
      updateVolume(e);
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        updateVolume(e);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    slider.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Touch events
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateVolume(e.touches[0]);
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        updateVolume(e.touches[0]);
      }
    });

    document.addEventListener('touchend', onMouseUp);
  }

  updateVolumeUI(volume) {
    const fill = document.getElementById('volumeFill');
    const handle = document.getElementById('volumeHandle');
    
    if (fill && handle) {
      fill.style.width = `${volume}%`;
      handle.style.left = `${volume}%`;
    }
  }

  updateUI() {
    // Update theme buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
    });

    // Update font buttons
    document.querySelectorAll('[data-font]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === this.currentFont);
    });

    // Update sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.checked = this.soundEnabled;
    }

    // Update volume
    this.updateVolumeUI(this.volume);
  }

  isReady() {
    return this.isInitialized;
  }

  /**
   * Get current settings
   * @returns {Object} Current settings
   */
  getSettings() {
    return {
      theme: this.currentTheme,
      font: this.currentFont,
      soundEnabled: this.soundEnabled,
      volume: this.volume,
      animations: true // Default to true for animations
    };
  }
}

// Create global settings manager
const settingsManager = new SettingsManager();

// Export for debugging
if (window.DEV) {
  window.settingsManager = settingsManager;
}
