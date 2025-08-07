/**
 * Settings Manager
 * Handles settings panel, theme switching, and preferences
 */

class SettingsManager {
  constructor() {
    this.isOpen = false;
    this.isInitialized = false;
    this.settingsPanel = null;
    this.currentTheme = 'emerald';
    this.currentFont = 'inter';
    this.soundEnabled = true;
    this.volume = 50;

    this.init();
  }

  init() {
    this.settingsPanel = document.getElementById('settingsPanel');

    // Ensure DOM is ready
    const onReady = () => {
      // Enhance the static panel sections dynamically
      this.enhanceStaticPanel();
      this.setupEventListeners();
      this.loadSettings();
      this.renderPaletteSelector();
      this.setupHeaderButtons();
      this.isInitialized = true;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

    setupEventListeners() {
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.settingsPanel.contains(e.target) && !e.target.closest('#cabSettings')) {
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
                    audioManager.play('toggle');
                }
            });
        }

        // Volume slider
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeHandle = document.getElementById('volumeHandle');
        if (volumeSlider && volumeHandle) {
            this.setupVolumeSlider(volumeSlider, volumeHandle);
        }
        
        // Listen for theme ready event to update UI properly
        document.addEventListener('themeReady', () => {
            this.updateUI();
        });

        // Listen for settingsChanged event to update UI when settings change from other components
        document.addEventListener('settingsChanged', (e) => {
            if (e.detail && e.detail.soundEnabled !== undefined) {
                this.soundEnabled = e.detail.soundEnabled;
                this.updateUI();
            }
        });

        // Listen for centerbar:ready event before setting up other listeners
        if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
            bus.addEventListener('centerbar:ready', (event) => {
                // Now that center bar is ready, set up the actual event listeners
                this.setupCenterBarEventListeners();
            });
        } else {
            console.warn('[SettingsManager] Bus not available for centerbar:ready event');
            // Fallback: set up event listeners immediately if bus is not available
            this.setupCenterBarEventListeners();
        }
        
        // Also listen for settingsChanged event to update UI when settings change
        if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
            bus.addEventListener('settingsChanged', (event) => {
                if (event.detail && event.detail.soundEnabled !== undefined) {
                    this.soundEnabled = event.detail.soundEnabled;
                    this.updateUI();
                }
                if (event.detail && event.detail.volume !== undefined) {
                    this.volume = event.detail.volume;
                    this.updateUI();
                }
            });
        } else {
            console.warn('[SettingsManager] Bus not available for settingsChanged event');
        }
    }

  setupHeaderButtons() {
    // No header buttons needed anymore
  }

  /**
   * Setup event listeners for center bar actions
   */
  setupCenterBarEventListeners() {
    
    // Listen for centerbar:sound event from center bar
    if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
      bus.addEventListener('centerbar:sound', (event) => {
        this.toggleSoundEnabled();
      });
    } else {
      console.warn('[SettingsManager] Bus not available for centerbar:sound event');
    }
  }

  /**
   * Enhance the static settings panel by injecting dynamic controls/components.
   * - Ensure font options reflect current state
   * - Ensure sound toggle/slider are bound
   * - Inject Utilities -> Reset to Defaults button with custom modal confirm
   * - Ensure Theme cards container exists (rendered separately)
   */
  enhanceStaticPanel() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) {
      console.warn('[Settings] Settings panel not found for enhancement');
      return;
    }

    // Font options (ensure active state reflects current)
    const fontSelector = document.getElementById('fontSelector');
    if (fontSelector) {
      // Ensure default options exist; add if missing
      const fonts = [
        { id: 'inter', name: 'Inter' },
        { id: 'playfair', name: 'Playfair' },
        { id: 'sf', name: 'SF Pro' }
      ];
      // If no buttons inside, populate defaults
      if (fontSelector.querySelectorAll('[data-font]').length === 0) {
        fontSelector.innerHTML = fonts.map(font => `
          <button class="font-option" data-font="${font.id}">${font.name}</button>
        `).join('');
      }
    }

    // Sound controls: bind if present
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle && !soundToggle._bound) {
      soundToggle.checked = this.soundEnabled;
      soundToggle.addEventListener('change', (e) => {
        this.setSoundEnabled(e.target.checked);
        if (typeof audioManager !== 'undefined') audioManager.play('toggle');
      });
      soundToggle._bound = true;
    }

    const volumeSlider = document.getElementById('volumeSlider');
    const volumeHandle = document.getElementById('volumeHandle');
    if (volumeSlider && volumeHandle && !volumeSlider._bound) {
      this.setupVolumeSlider(volumeSlider, volumeHandle);
      volumeSlider._bound = true;
    }

    // Utilities: inject controls
    const utilitiesContainer = document.getElementById('utilitiesContainer');
    if (utilitiesContainer) {
      // Reset to Defaults button
      if (!utilitiesContainer.querySelector('#resetDefaultsBtn')) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn--danger-hybrid';
        resetBtn.id = 'resetDefaultsBtn';
        resetBtn.setAttribute('aria-label', 'Reset to default settings');
        resetBtn.textContent = 'Reset to Defaults';
        utilitiesContainer.appendChild(resetBtn);

        resetBtn.addEventListener('click', async () => {
          const doReset = () => this.resetToDefaults();

          try {
            if (typeof modalManager !== 'undefined' && typeof modalManager.show === 'function') {
              const confirmed = await modalManager
                .show({
                  title: 'Reset to Defaults',
                  message:
                    'Are you sure you want to reset to default settings? This will revert your theme, font, and sound preferences, clear all tasks, and reset all statistics.',
                  cancelText: 'Cancel',
                  confirmText: 'Reset',
                  confirmStyle: 'danger'
                })
                .catch(() => false);

              if (confirmed === true) doReset();
              return;
            }
          } catch (err) {
            console.warn('modalManager.show threw an error, falling back to window.confirm', err);
          }

          if (window.confirm('Are you sure you want to reset to default settings? This will revert your theme, font, and sound preferences, clear all tasks, and reset all statistics.')) {
            doReset();
          }
        });
      }
 
      // Achievements chime toggle (optional subtle audio)
      if (!utilitiesContainer.querySelector('#achvChimeToggle')) {
        // Build the row via helper, but do NOT append it to the DOM per request.
        const row = this.createAchievementsChimeRow();
        // utilitiesContainer.appendChild(row); // intentionally disabled: do not add to HTML
      }
    }
  }

  /**
   * Reset all settings back to default values with a single source of truth
   */
  resetToDefaults() {
    
    // Dispatch resetToDefaults event to allow all subsystems to reset themselves
    if (typeof bus !== 'undefined') {
      bus.dispatchEvent(new CustomEvent('resetToDefaults'));
    }

    // Pull defaults from storage manager
    const defaults = typeof storageManager !== 'undefined' && storageManager.getDefaultSettings
      ? storageManager.getDefaultSettings()
      : {
          theme: 'emerald',
          darkMode: true,
          soundEnabled: false,
          volume: 50,
          animations: true,
          font: 'inter'
        };

    // Update internal state
    this.currentTheme = defaults.theme || 'emerald';
    this.currentFont = defaults.font || 'inter';
    this.soundEnabled = defaults.soundEnabled !== false;
    this.volume = typeof defaults.volume === 'number' ? defaults.volume : 50;

    // Apply settings to UI/system
    this.applyTheme(this.currentTheme);
    this.applyFont(this.currentFont);
    this.applySoundSettings();

    // Persist
    this.saveSettings();

    // Update UI states
    this.updateUI();

    // Notify other components
    if (typeof bus !== 'undefined') {
      bus.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: this.getSettings()
      }));
      
      // Dispatch tasksUpdated event to ensure UI components reload/update
      bus.dispatchEvent(new CustomEvent('tasksUpdated'));
      
      // Trigger reset handlers when resetToDefaults event is dispatched
      bus.addEventListener('resetToDefaults', () => {
        bus.triggerReset();
      });
    }

    if (typeof audioManager !== 'undefined') {
      audioManager.play('settings');
    }
    
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
      this.currentTheme = settings.theme || 'emerald';
      this.currentFont = settings.font || 'inter';
      this.soundEnabled = settings.soundEnabled !== false;
      this.volume = settings.volume || 50;

      // Save the defaults as actual settings
      this.saveSettings();
    }

    // Apply theme immediately (this will be called before DOM is ready)
    this.applyTheme(this.currentTheme);
    
    // Apply other settings after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.applyFont(this.currentFont);
        this.applySoundSettings();
        // Also make sure theme is applied properly when DOM is ready
        this.updateUI();
      });
    } else {
      this.applyFont(this.currentFont);
      this.applySoundSettings();
      // Also make sure theme is applied properly when DOM is ready
      this.updateUI();
    }
  }

  saveSettings() {
    storageManager.setSettings({
      theme: this.currentTheme,
      font: this.currentFont,
      soundEnabled: this.soundEnabled,
      volume: this.volume,
      achievementsChime: !!this.achievementsChime
    });
  }

  toggleSettings(anchor) {
    
    if (this.isOpen) {
      this.closeSettings();
    } else {
      this.openSettings(anchor);
    }
    
  }

  openSettings(anchor) {
    
    // Static panel exists; ensure it's enhanced before showing
    if (!this.settingsPanel) {
      this.settingsPanel = document.getElementById('settingsPanel');
      if (!this.settingsPanel) {
        console.error('[Settings] Settings panel element not found in DOM!');
        return;
      }
    }
    this.enhanceStaticPanel();

    // Render theme cards into existing container
    this.renderPaletteSelector();

    this.isOpen = true;
    this.settingsPanel.classList.add('open');
    this.updateUI();

    // Center the settings panel in the viewport
    this.settingsPanel.style.position = 'fixed';
    this.settingsPanel.style.top = '50%';
    this.settingsPanel.style.left = '50%';
    this.settingsPanel.style.transform = 'translate(-50%, -50%)';
    this.settingsPanel.style.maxWidth = '480px';
    this.settingsPanel.style.width = '90%';
    this.settingsPanel.style.maxHeight = '80vh';
    this.settingsPanel.style.overflowY = 'auto';
    // Keep settings panel below modal/backdrop using design-system scale
    const rootStyles = getComputedStyle(document.documentElement);
    const zFixed = rootStyles.getPropertyValue('--z-fixed')?.trim() || '1030';
    this.settingsPanel.style.zIndex = zFixed;

    // Proactively warn once if modalManager is not ready to help debugging
    if (!(typeof modalManager !== 'undefined' && typeof modalManager.confirm === 'function')) {
      console.warn('modalManager.confirm is not available. Custom confirm modal will not show; falling back to window.confirm.');
    }

    if (typeof audioManager !== 'undefined') {
      audioManager.play('settings');
    }
    
  }

  closeSettings() {
    if (!this.settingsPanel) {
      this.settingsPanel = document.getElementById('settingsPanel');
      if (!this.settingsPanel) {
        console.error('[Settings] Settings panel element not found in DOM!');
        return;
      }
    }
    
    this.isOpen = false;
    this.settingsPanel.classList.remove('open');
    
    // Reset positioning styles to avoid affecting layout when closed
    this.settingsPanel.style.position = '';
    this.settingsPanel.style.top = '';
    this.settingsPanel.style.left = '';
    this.settingsPanel.style.transform = '';
    this.settingsPanel.style.maxWidth = '';
    this.settingsPanel.style.width = '';
    this.settingsPanel.style.maxHeight = '';
    this.settingsPanel.style.overflowY = '';
    this.settingsPanel.style.zIndex = '';
    
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
    // Keep legacy field for UI/back-compat
    this.soundEnabled = enabled;
    this.saveSettings();

    // Drive centralized global mute and mirror legacy enabled for compatibility
    if (typeof audioManager !== 'undefined') {
      const nextGlobalMute = !enabled;
      if (typeof audioManager.setGlobalMute === 'function') {
        audioManager.setGlobalMute(nextGlobalMute);
      }
      // Keep legacy enabled in sync (power saving path remains separate)
      audioManager.setEnabled?.(enabled);
      audioManager.enabled = enabled;
    } else {
    }
    
    // Dispatch settingsChanged with both fields so all listeners stay in sync
    if (typeof bus !== 'undefined') {
      bus.dispatchEvent(new CustomEvent('settingsChanged', { 
        detail: { 
          soundEnabled: enabled,
          globalMute: !enabled,
          volume: this.volume
        } 
      }));
    } else {
    }
    
    // Update volume button state
    if (typeof todoApp !== 'undefined' && todoApp.updateVolumeButtonState) {
      todoApp.updateVolumeButtonState(enabled);
    } else {
    }
    
    // Update center action bar sound button
    if (typeof centerBar !== 'undefined' && typeof centerBar.updateSoundButtonState === 'function') {
      centerBar.updateSoundButtonState();
    } else {
    }
    
  }

  toggleSoundEnabled() {
    this.setSoundEnabled(!this.soundEnabled);
  }

  setVolume(volume) {
    this.volume = volume;
    this.saveSettings();

    if (typeof audioManager !== 'undefined') {
      audioManager.setVolume(volume);
      audioManager.play('volume');
    } else {
    }
    
    // Dispatch settingsChanged event to notify other components (always send payload)
    if (typeof bus !== 'undefined') {
      bus.dispatchEvent(new CustomEvent('settingsChanged', { detail: this.getSettings() }));
    } else {
    }
    
  }

  applyTheme(theme) {
    // Apply theme using the new ThemeManager system
    if (typeof themeManager !== 'undefined' && typeof themeManager.changeTheme === 'function') {
      themeManager.changeTheme(theme);
    } else {
      // Fallback to old system if ThemeManager not available
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${theme}`);
    }
    
    // Also update the settings manager's current theme
    this.currentTheme = theme;
  }

  applyFont(font) {
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${font}`);
  }

  applySoundSettings() {
    if (typeof audioManager !== 'undefined') {
      audioManager.setEnabled(this.soundEnabled);
      audioManager.setVolume(this.volume);
    } else {
    }
  }

  renderPaletteSelector() {
    const container = document.getElementById('themeCardsContainer');
    if (!container) {
      console.warn('[Settings] Theme cards container not found');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Get sorted themes
    if (typeof themeManager !== 'undefined') {
      const sortedThemes = themeManager.getSortedThemes();
      
      // Create and append theme cards
      sortedThemes.forEach(themeName => {
        const theme = themeManager.getTheme(themeName);
        if (theme) {
          const card = document.createElement('div');
          card.className = 'theme-card';
          card.dataset.theme = themeName;
          
          // Determine light/dark tone for badge hint
          const tone = (() => {
            // prefer explicit theme flag if provided by ThemeManager
            if (typeof theme.isDark === 'boolean') return theme.isDark ? 'dark' : 'light';
            // fallback: estimate using primary color luminance
            const hex = (theme.primary || '#000').toString().trim();
            const toRGB = (h) => {
              const clean = h.replace('#', '');
              const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
              const r = parseInt(full.slice(0, 2), 16) / 255;
              const g = parseInt(full.slice(2, 4), 16) / 255;
              const b = parseInt(full.slice(4, 6), 16) / 255;
              // relative luminance
              const srgb = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
              const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
              return L;
            };
            return toRGB(hex) < 0.5 ? 'dark' : 'light';
          })();

          // Create preview with gradient
          const preview = document.createElement('div');
          preview.className = 'theme-preview';
          preview.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`;
          
          // Create name element
          const name = document.createElement('div');
          name.className = 'theme-name';
          name.textContent = theme.name;

          // Add light/dark tone badge via data attribute (used by CSS ::after)
          card.setAttribute('data-tone', tone);
          
          // Assemble card
          card.appendChild(preview);
          card.appendChild(name);
          
          // Add to container
          container.appendChild(card);
        }
      });
    } else {
      // Fallback if themeManager is not available
      console.warn('ThemeManager not available, using static theme list');
      const fallbackThemes = [
        { name: 'Midnight', primary: '#1a1a2e', accent: '#0f3460', id: 'midnight' },
        { name: 'Emerald', primary: '#0c4a3e', accent: '#2ecc71', id: 'emerald' },
        { name: 'Graphite', primary: '#2c2c2c', accent: '#666666', id: 'graphite' },
        { name: 'Aurora', primary: '#0a0a0a', accent: '#00ff88', id: 'aurora' },
        { name: 'Amethyst', primary: '#4b0082', accent: '#9b59b6', id: 'amethyst' },
        { name: 'Burgundy', primary: '#800020', accent: '#dc143c', id: 'burgundy' },
        { name: 'Ivory', primary: '#f8f9fa', accent: '#dee2e6', id: 'ivory' },
        { name: 'Champagne', primary: '#fff8e7', accent: '#daa520', id: 'champagne' },
        { name: 'Sakura', primary: '#fff5f5', accent: '#ff69b4', id: 'sakura' },
        { name: 'Pearl', primary: '#f8f8ff', accent: '#d4af37', id: 'pearl' },
        { name: 'Mint', primary: '#f0fff0', accent: '#2dd4bf', id: 'mint' },
        { name: 'Coral', primary: '#fff0f5', accent: '#ff7f50', id: 'coral' },
        { name: 'Frost', primary: '#f0f8ff', accent: '#22d3ee', id: 'frost' },
        { name: 'Lavender', primary: '#e6e6fa', accent: '#a78bfa', id: 'lavender' },
        { name: 'Arctic Sky', primary: '#e6f2ff', accent: '#4da6ff', id: 'arcticSky' }
      ];
      
      fallbackThemes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.theme = theme.id;

        // Estimate tone from primary color
        const hex = (theme.primary || '#000').toString().trim();
        const toRGB = (h) => {
          const clean = h.replace('#', '');
          const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
          const r = parseInt(full.slice(0, 2), 16) / 255;
          const g = parseInt(full.slice(2, 4), 16) / 255;
          const b = parseInt(full.slice(4, 6), 16) / 255;
          const srgb = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
          const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
          return L;
        };
        const tone = toRGB(hex) < 0.5 ? 'dark' : 'light';
        card.setAttribute('data-tone', tone);
        
        // Create preview with gradient
        const preview = document.createElement('div');
        preview.className = 'theme-preview';
        preview.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`;
        
        // Create name element
        const name = document.createElement('div');
        name.className = 'theme-name';
        name.textContent = theme.name;
        
        // Assemble card
        card.appendChild(preview);
        card.appendChild(name);
        
        // Add to container
        container.appendChild(card);
      });
    }

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

    // Accessibility: label list and each option
    container.setAttribute('role', 'listbox');
    container.querySelectorAll('.theme-card').forEach(card => {
      card.setAttribute('role', 'option');
      const isActive = card.classList.contains('active');
      card.setAttribute('aria-selected', isActive ? 'true' : 'false');
      const tone = card.getAttribute('data-tone') || '';
      const nameEl = card.querySelector('.theme-name');
      const label = nameEl ? nameEl.textContent : card.dataset.theme;
      card.setAttribute('aria-label', `${label} theme (${tone})`);
    });
  }

  // Static panel is the source; no longer creating it dynamically
  createSettingsPanel() {
    return document.getElementById('settingsPanel');
  }

  createThemeCards() {
    // This will be populated by renderPaletteSelector
    return '';
  }

  createFontOptions() {
    const fonts = [
      { id: 'inter', name: 'Inter' },
      { id: 'playfair', name: 'Playfair' },
      { id: 'sf', name: 'SF Pro' }
    ];

    return fonts.map(font => `
      <button class="font-option ${this.currentFont === font.id ? 'active' : ''}" 
              data-font="${font.id}">
        ${font.name}
      </button>
    `).join('');
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
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));

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

    // Mouse events
    slider.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Touch events
    const onTouchStart = (e) => {
      // Prevent scrolling when touching the slider
      e.preventDefault();
      isDragging = true;
      updateVolume(e.touches[0]);

      // Add active class to enable pointer events
      slider.classList.add('active');
      handle.classList.add('active');
    };

    const onTouchMove = (e) => {
      if (isDragging) {
        // Prevent scrolling when dragging the slider
        e.preventDefault();
        updateVolume(e.touches[0]);
      }
    };

    const onTouchEnd = () => {
      applyVolume();

      // Remove active class after interaction
      slider.classList.remove('active');
      handle.classList.remove('active');
    };

    slider.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    
  }

  updateVolumeUI(volume) {
    const fill = document.getElementById('volumeFill');
    const handle = document.getElementById('volumeHandle');

    if (fill && handle) {
      fill.style.width = `${volume}%`;
      handle.style.left = `${volume}%`;
    } else {
    }
  }

  updateUI() {
    
    // Update theme buttons
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
    });

    // Update font buttons
    const fontButtons = document.querySelectorAll('[data-font]');
    fontButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === this.currentFont);
    });

    // Update sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.checked = this.soundEnabled;
    } else {
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
      animations: true, // Default to true for animations
      achievementsChime: !!this.achievementsChime
    };
  }
 
  /**
   * Construct the Achievements Chime row and wire its behavior, without appending to DOM.
   * @returns {HTMLDivElement} The constructed row element (not attached).
   */
  createAchievementsChimeRow() {
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.innerHTML = `
      <label class="settings-checkbox" style="display:flex;align-items:center;gap:10px;">
        <input type="checkbox" id="achvChimeToggle" />
        <span class="checkmark" aria-hidden="true"></span>
        <span>Achievements chime</span>
      </label>
    `;
 
    const toggle = row.querySelector('#achvChimeToggle');
    // Initialize from persisted settings (fallback false)
    const persisted = storageManager.getSettings ? storageManager.getSettings() : {};
    this.achievementsChime = typeof persisted.achievementsChime === 'boolean' ? persisted.achievementsChime : false;
    toggle.checked = !!this.achievementsChime;
 
    toggle.addEventListener('change', () => {
      this.achievementsChime = toggle.checked;
      this.saveSettings();
      // Notify others
      if (typeof bus !== 'undefined') {
        bus.dispatchEvent(new CustomEvent('settingsChanged', { detail: { achievementsChime: this.achievementsChime } }));
      }
      // Soft feedback if chime enabled and sound allowed
      try {
        const notMuted = typeof audioManager === 'undefined' ? true : !(audioManager.getGlobalMute && audioManager.getGlobalMute());
        if (this.achievementsChime && notMuted && typeof audioManager !== 'undefined') {
          audioManager.play('toggle');
        }
      } catch (_) {}
    });
 
    return row;
  }
}
 
// Create global settings manager
const settingsManager = new SettingsManager();

// Export for debugging
if (window.DEV) {
  window.settingsManager = settingsManager;
}
