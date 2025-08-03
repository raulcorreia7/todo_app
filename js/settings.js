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
        this.setupHeaderButtons();
        this.isInitialized = true;
      });
    } else {
      this.setupEventListeners();
      this.loadSettings();
      this.renderPaletteSelector();
      this.setupHeaderButtons();
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
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const themeName = e.currentTarget.dataset.theme;
        if (themeName) {
          this.setTheme(themeName);
        }
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
        // Play sound toggle sound
        if (typeof audioManager !== 'undefined') {
          audioManager.playSoundToggle();
        }
      });
    }

    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeHandle = document.getElementById('volumeHandle');
    if (volumeSlider && volumeHandle) {
      this.setupVolumeSlider(volumeSlider, volumeHandle);
    }
  }

  setupHeaderButtons() {
    // No header buttons needed anymore
  }

  updateVolumeIcon(icon, isEnabled) {
    if (icon) {
      if (isEnabled) {
        icon.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
      } else {
        icon.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
      }
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

    if (typeof audioManager !== 'undefined') {
      audioManager.play('font');
    }
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
      audioManager.play('volume');
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
    // The theme UI is now defined in HTML, so we just need to set up event listeners
    const container = document.querySelector('.theme-cards-container');
    if (!container) return;

    // Add event listeners for theme cards
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.theme-card');
      if (card) {
        const themeName = card.dataset.theme;
        this.setTheme(themeName);

        // Update active state
        container.querySelectorAll('.theme-card').forEach(c => {
          c.classList.toggle('active', c.dataset.theme === themeName);
        });

        // Use themeManager for consistency
        if (typeof themeManager !== 'undefined') {
          themeManager.changeTheme(themeName);
        }
      }
    });

    // Set initial active state
    const activeCard = container.querySelector(`.theme-card[data-theme="${this.currentTheme}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
    }
  }

  setupVolumeSlider(slider, handle) {
    let isDragging = false;
    let tempVolume = this.volume; // Store current volume as temp

    const updateVolumeUI = (percentage) => {
      const fill = document.getElementById('volumeFill');
      const handle = document.getElementById('volumeHandle');

      if (fill && handle) {
        fill.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
      }
    };

    const updateVolume = (e) => {
      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      // Update UI without playing sound
      updateVolumeUI(percentage);
      tempVolume = percentage; // Store the temp volume
    };

    const applyVolume = () => {
      // Only apply the volume and play sound when dragging ends
      if (isDragging) {
        this.setVolume(tempVolume);
        isDragging = false;
      }
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
      applyVolume();
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

    document.addEventListener('touchend', applyVolume);
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
