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
    console.log('[Settings] init called');
    this.settingsPanel = document.getElementById('settingsPanel');
    console.log('[Settings] Settings panel element found:', !!this.settingsPanel);

    // Ensure DOM is ready
    const onReady = () => {
      console.log('[Settings] DOM ready callback executed');
      // Enhance the static panel sections dynamically
      this.enhanceStaticPanel();
      this.setupEventListeners();
      this.loadSettings();
      this.renderPaletteSelector();
      this.setupHeaderButtons();
      this.isInitialized = true;
      console.log('[Settings] Settings manager initialized successfully');
    };

    if (document.readyState === 'loading') {
      console.log('[Settings] DOM still loading, adding DOMContentLoaded listener');
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      console.log('[Settings] DOM already ready, executing onReady immediately');
      onReady();
    }
    console.log('[Settings] init completed');
  }

    setupEventListeners() {
        console.log('[SettingsManager] Setting up event listeners');
        
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
            console.log('[SettingsManager] Adding centerbar:ready event listener');
            bus.addEventListener('centerbar:ready', (event) => {
                console.log('[SettingsManager] Center bar is ready, setting up event listeners');
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
            console.log('[SettingsManager] Adding settingsChanged event listener');
            bus.addEventListener('settingsChanged', (event) => {
                console.log('[SettingsManager] Received settingsChanged event', event.detail);
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
    console.log('[SettingsManager] Setting up center bar event listeners');
    
    // Listen for centerbar:sound event from center bar
    if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
      console.log('[SettingsManager] Adding centerbar:sound event listener');
      bus.addEventListener('centerbar:sound', (event) => {
        console.log('[SettingsManager] Received centerbar:sound event', event.detail);
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
    console.log('[Settings] Enhancing static settings panel');
    const panel = document.getElementById('settingsPanel');
    if (!panel) {
      console.warn('[Settings] Settings panel not found for enhancement');
      return;
    }
    console.log('[Settings] Settings panel found, proceeding with enhancement');

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
                    'Are you sure you want to reset to default settings? This will revert your theme, font, and sound preferences.',
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

          if (window.confirm('Are you sure you want to reset to default settings? This will revert your theme, font, and sound preferences.')) {
            doReset();
          }
        });
      }

      // Achievements chime toggle (optional subtle audio)
      if (!utilitiesContainer.querySelector('#achvChimeToggle')) {
        const row = document.createElement('div');
        row.className = 'settings-row';
        row.innerHTML = `
          <label class="settings-checkbox" style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" id="achvChimeToggle" />
            <span class="checkmark" aria-hidden="true"></span>
            <span>Achievements chime</span>
          </label>
        `;
        utilitiesContainer.appendChild(row);

        const toggle = row.querySelector('#achvChimeToggle');
        // Initialize from persisted settings (fallback true for premium feedback)
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
      }
    }
  }

  /**
   * Reset all settings back to default values with a single source of truth
   */
  resetToDefaults() {
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
      bus.dispatchEvent(new CustomEvent('settingsChanged'));
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
    console.log('[Settings] loadSettings called');
    const settings = storageManager.getSettings();
    console.log('[Settings] Retrieved settings from storage:', settings);

    // Check if we have actual saved settings (not just defaults)
    const hasSavedSettings = localStorage.getItem('luxury-todo-settings') !== null;
    console.log('[Settings] Has saved settings:', hasSavedSettings);

    if (hasSavedSettings) {
      // Use the actual saved settings
      this.currentTheme = settings.theme;
      this.currentFont = settings.font;
      this.soundEnabled = settings.soundEnabled;
      this.volume = settings.volume;
      console.log('[Settings] Using saved settings:', settings);
    } else {
      // Only use defaults if no settings exist
      this.currentTheme = settings.theme || 'emerald';
      this.currentFont = settings.font || 'inter';
      this.soundEnabled = settings.soundEnabled !== false;
      this.volume = settings.volume || 50;
      console.log('[Settings] Using default settings:', { theme: this.currentTheme, font: this.currentFont, soundEnabled: this.soundEnabled, volume: this.volume });

      // Save the defaults as actual settings
      this.saveSettings();
    }

    // Apply theme immediately (this will be called before DOM is ready)
    console.log('[Settings] Applying theme immediately');
    this.applyTheme(this.currentTheme);
    
    // Apply other settings after DOM is ready
    if (document.readyState === 'loading') {
      console.log('[Settings] DOM still loading, will apply other settings on DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Settings] DOM loaded, applying font and sound settings');
        this.applyFont(this.currentFont);
        this.applySoundSettings();
        // Also make sure theme is applied properly when DOM is ready
        this.updateUI();
      });
    } else {
      console.log('[Settings] DOM already loaded, applying font and sound settings immediately');
      this.applyFont(this.currentFont);
      this.applySoundSettings();
      // Also make sure theme is applied properly when DOM is ready
      this.updateUI();
    }
    console.log('[Settings] loadSettings completed');
  }

  saveSettings() {
    console.log('[Settings] Saving settings:', this.getSettings());
    storageManager.setSettings({
      theme: this.currentTheme,
      font: this.currentFont,
      soundEnabled: this.soundEnabled,
      volume: this.volume,
      achievementsChime: !!this.achievementsChime
    });
    console.log('[Settings] Settings saved successfully');
  }

  toggleSettings(anchor) {
    console.log('[Settings] toggleSettings called with anchor:', anchor, 'current state:', this.isOpen);
    
    if (this.isOpen) {
      console.log('[Settings] Panel is open, closing it');
      this.closeSettings();
    } else {
      console.log('[Settings] Panel is closed, opening it with anchor:', anchor);
      this.openSettings(anchor);
    }
    
    console.log('[Settings] toggleSettings completed');
  }

  openSettings(anchor) {
    console.log('[Settings] openSettings called with anchor:', anchor);
    
    // Static panel exists; ensure it's enhanced before showing
    if (!this.settingsPanel) {
      console.log('[Settings] Settings panel not cached, getting from DOM');
      this.settingsPanel = document.getElementById('settingsPanel');
      if (!this.settingsPanel) {
        console.error('[Settings] Settings panel element not found in DOM!');
        return;
      }
    }
    console.log('[Settings] Settings panel element found:', !!this.settingsPanel);
    this.enhanceStaticPanel();

    // Render theme cards into existing container
    console.log('[Settings] Rendering palette selector');
    this.renderPaletteSelector();

    this.isOpen = true;
    console.log('[Settings] Adding open class to settings panel');
    this.settingsPanel.classList.add('open');
    this.updateUI();

    // Center the settings panel in the viewport
    console.log('[Settings] Applying positioning styles to settings panel');
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
    
    console.log('[Settings] Settings panel opened successfully');
  }

  closeSettings() {
    console.log('[Settings] closeSettings called');
    if (!this.settingsPanel) {
      console.warn('[Settings] Settings panel not cached, getting from DOM');
      this.settingsPanel = document.getElementById('settingsPanel');
      if (!this.settingsPanel) {
        console.error('[Settings] Settings panel element not found in DOM!');
        return;
      }
    }
    
    console.log('[Settings] Removing open class from settings panel');
    this.isOpen = false;
    this.settingsPanel.classList.remove('open');
    
    // Reset positioning styles to avoid affecting layout when closed
    console.log('[Settings] Resetting positioning styles');
    this.settingsPanel.style.position = '';
    this.settingsPanel.style.top = '';
    this.settingsPanel.style.left = '';
    this.settingsPanel.style.transform = '';
    this.settingsPanel.style.maxWidth = '';
    this.settingsPanel.style.width = '';
    this.settingsPanel.style.maxHeight = '';
    this.settingsPanel.style.overflowY = '';
    this.settingsPanel.style.zIndex = '';
    
    console.log('[Settings] Settings panel closed successfully');
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
    console.log('[Settings] setSoundEnabled called with:', enabled);
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
      console.log('[Settings] audioManager.setGlobalMute:', nextGlobalMute, ' audioManager.setEnabled:', enabled);
    } else {
      console.warn('[Settings] audioManager not available for setSoundEnabled');
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
      console.log('[Settings] settingsChanged event dispatched with:', { soundEnabled: enabled, globalMute: !enabled, volume: this.volume });
    } else {
      console.warn('[Settings] bus not available for settingsChanged event');
    }
    
    // Update volume button state
    if (typeof todoApp !== 'undefined' && todoApp.updateVolumeButtonState) {
      todoApp.updateVolumeButtonState(enabled);
      console.log('[Settings] todoApp.updateVolumeButtonState called with:', enabled);
    } else {
      console.warn('[Settings] todoApp not available for updateVolumeButtonState');
    }
    
    // Update center action bar sound button
    if (typeof centerBar !== 'undefined' && typeof centerBar.updateSoundButtonState === 'function') {
      centerBar.updateSoundButtonState();
      console.log('[Settings] centerBar.updateSoundButtonState called');
    } else {
      console.warn('[Settings] centerBar not available for updateSoundButtonState');
    }
    
    console.log('[Settings] setSoundEnabled completed');
  }

  toggleSoundEnabled() {
    console.log('[Settings] toggleSoundEnabled called, current state:', this.soundEnabled);
    this.setSoundEnabled(!this.soundEnabled);
    console.log('[Settings] toggleSoundEnabled completed');
  }

  setVolume(volume) {
    console.log('[Settings] setVolume called with:', volume);
    this.volume = volume;
    this.saveSettings();

    if (typeof audioManager !== 'undefined') {
      audioManager.setVolume(volume);
      audioManager.play('volume');
      console.log('[Settings] audioManager.setVolume called with:', volume);
    } else {
      console.warn('[Settings] audioManager not available for setVolume');
    }
    
    // Dispatch settingsChanged event to notify other components (always send payload)
    if (typeof bus !== 'undefined') {
      bus.dispatchEvent(new CustomEvent('settingsChanged', { detail: this.getSettings() }));
      console.log('[Settings] settingsChanged event dispatched with:', this.getSettings());
    } else {
      console.warn('[Settings] bus not available for settingsChanged event');
    }
    
    console.log('[Settings] setVolume completed');
  }

  applyTheme(theme) {
    console.log('[Settings] Applying theme:', theme);
    // Apply theme using the new ThemeManager system
    if (typeof themeManager !== 'undefined' && typeof themeManager.changeTheme === 'function') {
      console.log('[Settings] Using ThemeManager to apply theme');
      themeManager.changeTheme(theme);
    } else {
      // Fallback to old system if ThemeManager not available
      console.log('[Settings] ThemeManager not available, using fallback system');
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${theme}`);
    }
    
    // Also update the settings manager's current theme
    this.currentTheme = theme;
    console.log('[Settings] Theme applied successfully');
  }

  applyFont(font) {
    console.log('[Settings] Applying font:', font);
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${font}`);
    console.log('[Settings] Font applied successfully');
  }

  applySoundSettings() {
    console.log('[Settings] Applying sound settings - enabled:', this.soundEnabled, 'volume:', this.volume);
    if (typeof audioManager !== 'undefined') {
      audioManager.setEnabled(this.soundEnabled);
      audioManager.setVolume(this.volume);
      console.log('[Settings] Sound settings applied to audioManager');
    } else {
      console.warn('[Settings] audioManager not available for applying sound settings');
    }
  }

  renderPaletteSelector() {
    console.log('[Settings] Rendering palette selector');
    const container = document.getElementById('themeCardsContainer');
    if (!container) {
      console.warn('[Settings] Theme cards container not found');
      return;
    }
    console.log('[Settings] Theme cards container found, proceeding with rendering');

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
    console.log('[Settings] Setting up volume slider');
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
    
    console.log('[Settings] Volume slider setup completed');
  }

  updateVolumeUI(volume) {
    console.log('[Settings] updateVolumeUI called with:', volume);
    const fill = document.getElementById('volumeFill');
    const handle = document.getElementById('volumeHandle');

    if (fill && handle) {
      fill.style.width = `${volume}%`;
      handle.style.left = `${volume}%`;
      console.log('[Settings] Volume UI elements updated successfully');
    } else {
      console.warn('[Settings] Volume UI elements not found - fill:', !!fill, 'handle:', !!handle);
    }
    console.log('[Settings] updateVolumeUI completed');
  }

  updateUI() {
    console.log('[Settings] updateUI called with current settings:', this.getSettings());
    
    // Update theme buttons
    const themeButtons = document.querySelectorAll('[data-theme]');
    console.log('[Settings] Found', themeButtons.length, 'theme buttons');
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
    });

    // Update font buttons
    const fontButtons = document.querySelectorAll('[data-font]');
    console.log('[Settings] Found', fontButtons.length, 'font buttons');
    fontButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === this.currentFont);
    });

    // Update sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
      soundToggle.checked = this.soundEnabled;
      console.log('[Settings] Sound toggle updated to:', this.soundEnabled);
    } else {
      console.warn('[Settings] Sound toggle element not found');
    }

    // Update volume
    console.log('[Settings] Calling updateVolumeUI with volume:', this.volume);
    this.updateVolumeUI(this.volume);
    
    console.log('[Settings] UI update completed');
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
}

// Create global settings manager
const settingsManager = new SettingsManager();

// Export for debugging
if (window.DEV) {
  window.settingsManager = settingsManager;
}
