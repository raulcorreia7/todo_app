/**
 * Theme system with glass-morphism and ambient glow effects
 * Handles theme switching, dynamic styling, and visual effects
 */

class ThemeManager {
    constructor() {
        this.themes = {
            midnight: {
                name: 'Midnight',
                primary: '#1a1a2e',
                secondary: '#16213e',
                accent: '#0f3460',
                text: '#e94560',
                glow: '#e94560',
                shadow: 'rgba(233, 69, 96, 0.3)',
                glass: 'rgba(26, 26, 46, 0.8)',
                border: 'rgba(233, 69, 96, 0.2)',
                tags: ['dark', 'cool']
            },
            ivory: {
                name: 'Ivory',
                primary: '#f8f9fa',
                secondary: '#e9ecef',
                accent: '#dee2e6',
                text: '#495057',
                glow: '#6c757d',
                shadow: 'rgba(108, 117, 125, 0.2)',
                glass: 'rgba(248, 249, 250, 0.8)',
                border: 'rgba(108, 117, 125, 0.1)',
                tags: ['light']
            },
            champagne: {
                name: 'Champagne',
                primary: '#fff8e7',
                secondary: '#f3e5ab',
                accent: '#daa520',
                text: '#8b4513',
                glow: '#daa520',
                shadow: 'rgba(218, 165, 32, 0.3)',
                glass: 'rgba(255, 248, 231, 0.8)',
                border: 'rgba(218, 165, 32, 0.2)',
                tags: ['light', 'warm']
            },
            graphite: {
                name: 'Graphite',
                primary: '#2c2c2c',
                secondary: '#404040',
                accent: '#666666',
                text: '#cccccc',
                glow: '#999999',
                shadow: 'rgba(153, 153, 153, 0.3)',
                glass: 'rgba(44, 44, 44, 0.8)',
                border: 'rgba(153, 153, 153, 0.2)',
                tags: ['dark']
            },
            aurora: {
                name: 'Aurora',
                primary: '#0a0a0a',
                secondary: '#1a1a2e',
                accent: '#16213e',
                text: '#00ff88',
                glow: '#00ff88',
                shadow: 'rgba(0, 255, 136, 0.3)',
                glass: 'rgba(10, 10, 10, 0.8)',
                border: 'rgba(0, 255, 136, 0.2)',
                tags: ['dark', 'cool']
            },
            arcticSky: {
                name: 'Arctic Sky',
                primary: '#e6f2ff',
                secondary: '#cce5ff',
                accent: '#4da6ff',
                text: '#2c5282',
                glow: '#4da6ff',
                shadow: 'rgba(77, 166, 255, 0.3)',
                glass: 'rgba(230, 242, 255, 0.7)',
                border: 'rgba(77, 166, 255, 0.2)',
                tags: ['light', 'cool']
            },
            emerald: {
                name: 'Emerald',
                primary: '#0c4a3e',
                secondary: '#134e4a',
                accent: '#2ecc71',
                text: '#e8f8f5',
                glow: '#2ecc71',
                shadow: 'rgba(46, 204, 113, 0.3)',
                glass: 'rgba(12, 74, 62, 0.8)',
                border: 'rgba(46, 204, 113, 0.2)',
                tags: ['dark', 'cool']
            },
            sakura: {
                name: 'Sakura',
                primary: '#fff5f5',
                secondary: '#ffe0e0',
                accent: '#ffb3ba',
                text: '#8b2635',
                glow: '#ff69b4',
                shadow: 'rgba(255, 105, 180, 0.3)',
                glass: 'rgba(255, 245, 245, 0.8)',
                border: 'rgba(255, 105, 180, 0.2)',
                tags: ['light', 'warm']
            },
            pearl: {
                name: 'Pearl',
                primary: '#f8f8ff',
                secondary: '#e6e6fa',
                accent: '#d4af37',
                text: '#4b0082',
                glow: '#d4af37',
                shadow: 'rgba(212, 175, 55, 0.3)',
                glass: 'rgba(248, 248, 255, 0.8)',
                border: 'rgba(212, 175, 55, 0.2)',
                tags: ['light', 'warm']
            },
            mint: {
                name: 'Mint',
                primary: '#f0fff0',
                secondary: '#e0ffe0',
                accent: '#2dd4bf',
                text: '#006400',
                glow: '#2dd4bf',
                shadow: 'rgba(45, 212, 191, 0.3)',
                glass: 'rgba(240, 255, 240, 0.8)',
                border: 'rgba(45, 212, 191, 0.2)',
                tags: ['light', 'cool']
            },
            coral: {
                name: 'Coral',
                primary: '#fff0f5',
                secondary: '#ffe4e1',
                accent: '#ff7f50',
                text: '#8b0000',
                glow: '#ff7f50',
                shadow: 'rgba(255, 127, 80, 0.3)',
                glass: 'rgba(255, 240, 245, 0.8)',
                border: 'rgba(255, 127, 80, 0.2)',
                tags: ['light', 'warm']
            },
            frost: {
                name: 'Frost',
                primary: '#f0f8ff',
                secondary: '#e6f2ff',
                accent: '#22d3ee',
                text: '#000080',
                glow: '#22d3ee',
                shadow: 'rgba(34, 211, 238, 0.3)',
                glass: 'rgba(240, 248, 255, 0.8)',
                border: 'rgba(34, 211, 238, 0.2)',
                tags: ['light', 'cool']
            },
            lavender: {
                name: 'Lavender',
                primary: '#f5f3ff',
                secondary: '#e9d5ff',
                accent: '#a78bfa',
                text: '#4b0082',
                glow: '#a78bfa',
                shadow: 'rgba(167, 139, 250, 0.3)',
                glass: 'rgba(245, 243, 255, 0.8)',
                border: 'rgba(167, 139, 250, 0.2)',
                tags: ['light', 'cool']
            },
            amethyst: {
                name: 'Amethyst',
                primary: '#4b0082',
                secondary: '#483d8b',
                accent: '#9b59b6',
                text: '#dda0dd',
                glow: '#9b59b6',
                shadow: 'rgba(155, 89, 182, 0.3)',
                glass: 'rgba(75, 0, 130, 0.8)',
                border: 'rgba(155, 89, 182, 0.2)',
                tags: ['dark', 'cool']
            },
            burgundy: {
                name: 'Burgundy',
                primary: '#800020',
                secondary: '#800000',
                accent: '#dc143c',
                text: '#f8f8ff',
                glow: '#dc143c',
                shadow: 'rgba(220, 20, 60, 0.3)',
                glass: 'rgba(128, 0, 32, 0.8)',
                border: 'rgba(220, 20, 60, 0.2)',
                tags: ['dark', 'warm']
            }
        };

        this.signatureThemes = Object.keys(this.themes);

        this.currentTheme = 'emerald';
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        console.log('ThemeManager: Initializing...');
        
        // Load theme from settings first (this will be called before DOM is ready)
        this.loadTheme();
        console.log('ThemeManager: Loaded theme:', this.currentTheme);
        
        // Setup CSS variables with the loaded theme
        this.setupCSSVariables();
        
        // Setup event listeners for runtime changes
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('ThemeManager: Initialized successfully');

        // Mark as ready
        if (typeof bus !== 'undefined') {
            bus.markReady('theme');
        }
        
        // Listen for settings loaded event to ensure proper initialization
        document.addEventListener('settingsLoaded', (event) => {
            console.log('ThemeManager: Settings loaded event received:', event.detail);
            if (event.detail && event.detail.theme && event.detail.theme !== this.currentTheme) {
                this.changeTheme(event.detail.theme);
            }
        });
    }

    /**
     * Check if theme manager is ready
     * @returns {boolean} Ready state
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Load theme from settings
     */
    loadTheme() {
        console.log('ThemeManager: Loading theme...');
        
        // Try to get theme from settings manager if available
        if (typeof settingsManager !== 'undefined' && settingsManager.isReady()) {
            const settings = settingsManager.getSettings();
            this.currentTheme = settings.theme || 'emerald';
            console.log('ThemeManager: Got theme from settings:', this.currentTheme);
        } else {
            // Fallback to default theme if settings manager not ready
            this.currentTheme = 'emerald';
            console.log('ThemeManager: Settings manager not ready, using default theme:', this.currentTheme);
        }
        
        // Ensure we have a valid theme
        if (!this.themes[this.currentTheme]) {
            this.currentTheme = 'emerald';
            console.log('ThemeManager: Invalid theme, falling back to emerald');
        }
        
        console.log('ThemeManager: Final theme selected:', this.currentTheme);
    }

    /**
     * Setup CSS custom properties for dynamic theming
     */
    setupCSSVariables() {
        const root = document.documentElement;
        const theme = this.themes[this.currentTheme];

        if (!theme) {
            console.warn('ThemeManager: No theme found for', this.currentTheme);
            return;
        }

        console.log('ThemeManager: Setting CSS variables for theme', this.currentTheme, theme);

        // Set CSS variables on :root for global access
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--color-text', theme.text);
        root.style.setProperty('--glow-color', theme.glow);
        root.style.setProperty('--shadow-color', theme.shadow);
        root.style.setProperty('--color-glass', theme.glass);
        root.style.setProperty('--color-border', theme.border);

        // Remove old theme classes to avoid conflicts
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        // Add data-theme attribute for CSS selectors that need it
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        console.log('ThemeManager: CSS variables set. --color-text =', getComputedStyle(root).getPropertyValue('--color-text'));
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for settings changes
        if (typeof bus !== 'undefined') {
            bus.addEventListener('settingsChanged', (event) => {
                // Harden against null/undefined detail payloads
                // Prefer event.detail; fallback to settingsManager snapshot; default to current theme
                let nextTheme = this.currentTheme;
                try {
                    const detail = event && event.detail ? event.detail : (typeof settingsManager !== 'undefined' && settingsManager.getSettings ? settingsManager.getSettings() : null);
                    if (detail && typeof detail.theme === 'string') {
                        nextTheme = detail.theme;
                    }
                } catch (_) {
                    // keep current theme
                }
                if (nextTheme && nextTheme !== this.currentTheme) {
                    this.changeTheme(nextTheme);
                }
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                if (typeof settingsManager !== 'undefined') {
                    const settings = settingsManager.getSettings();
                    if (settings.darkMode === undefined) {
                        this.applySystemTheme(e.matches);
                    }
                }
            });
        }
    }

    /**
     * Change theme
     * @param {string} themeName - Name of the theme to apply
     */
    changeTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme ${themeName} not found`);
            return;
        }

        this.currentTheme = themeName;
        this.setupCSSVariables();

        // Update glass effects
        this.updateGlassEffects();

        // Notify other components
        if (typeof bus !== 'undefined') {
            bus.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: themeName, colors: this.themes[themeName] }
            }));
        }

        // Play theme change sound
        if (typeof audioManager !== 'undefined' && audioManager.isReady()) {
            audioManager.play('settings');
        }
    }

    /**
     * Apply system theme
     * @param {boolean} isDark - Whether system is in dark mode
     */
    applySystemTheme(isDark) {
        const root = document.documentElement;
        root.style.setProperty('--system-dark', isDark ? '1' : '0');
    }

    /**
     * Update glass effects based on current theme
     */
    updateGlassEffects() {
        const theme = this.themes[this.currentTheme];
        if (!theme) return;

        // Update glass panels
        const glassElements = document.querySelectorAll('.glass-panel, .glass-card, .glass-button');
        glassElements.forEach(element => {
            // Update backdrop filter based on theme
            const intensity = this.getGlassIntensity(theme);
            element.style.setProperty('--glass-blur', `${intensity}px`);

            // Update glow effect
            this.updateGlowEffect(element, theme);
        });
    }

    /**
     * Get glass blur intensity based on theme
     * @param {Object} theme - Theme object
     * @returns {number} Blur intensity in pixels
     */
    getGlassIntensity(theme) {
        // Adjust blur based on theme brightness
        const isDark = this.isDarkColor(theme.primary);
        return isDark ? 20 : 15;
    }

    /**
     * Update glow effect for an element
     * @param {Element} element - DOM element
     * @param {Object} theme - Theme object
     */
    updateGlowEffect(element, theme) {
        const glowIntensity = this.getGlowIntensity(theme);
        const glowColor = theme.glow;

        element.style.setProperty('--glow-intensity', glowIntensity);
        element.style.setProperty('--glow-color', glowColor);

        // Add hover glow effect
        element.addEventListener('mouseenter', () => {
            element.style.setProperty('--glow-opacity', '0.6');
        });

        element.addEventListener('mouseleave', () => {
            element.style.setProperty('--glow-opacity', '0.3');
        });
    }

    /**
     * Get glow intensity based on theme
     * @param {Object} theme - Theme object
     * @returns {number} Glow intensity
     */
    getGlowIntensity(theme) {
        // Adjust glow based on accent color brightness
        const brightness = this.getColorBrightness(theme.glow);
        return Math.max(0.3, Math.min(1.0, brightness / 255));
    }

    /**
     * Check if a color is dark
     * @param {string} hexColor - Hex color string
     * @returns {boolean} True if color is dark
     */
    isDarkColor(hexColor) {
        const brightness = this.getColorBrightness(hexColor);
        return brightness < 128;
    }

    /**
     * Get color brightness (0-255)
     * @param {string} hexColor - Hex color string
     * @returns {number} Brightness value
     */
    getColorBrightness(hexColor) {
        // Remove # if present
        hexColor = hexColor.replace('#', '');

        // Convert to RGB
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);

        // Calculate brightness using luminance formula
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    /**
     * Get current theme
     * @returns {Object} Current theme object
     */
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }

    /**
     * Get all available themes
     * @returns {Object} All themes
     */
    getAllThemes() {
        return this.themes;
    }

    /**
     * Get theme by name
     * @param {string} themeName - Theme name
     * @returns {Object} Theme object or null
     */
    getTheme(themeName) {
        return this.themes[themeName] || null;
    }

    /**
     * Check if a theme is light or dark
     * @param {string} themeName - Theme name
     * @returns {boolean} True if theme is light
     */
    isLightTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return false;

        return this.getColorBrightness(theme.primary) > 128;
    }

    /**
     * Get color temperature (warm vs cool) based on RGB values
     * @param {string} hexColor - Hex color string
     * @returns {string} 'warm' or 'cool'
     */
    getColorTemperature(hexColor) {
        // Remove # if present
        hexColor = hexColor.replace('#', '');
        
        // Convert to RGB
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        // Calculate color temperature using RGB ratios
        // Higher red values = warmer, higher blue values = cooler
        const warmth = (r * 0.7) - (b * 0.3);
        
        return warmth > 0 ? 'warm' : 'cool';
    }

    /**
     * Sort themes intelligently by type and color temperature
     * @returns {Array} Array of sorted theme names
     */
    getSortedThemes() {
        const themeNames = Object.keys(this.themes);
        
        // Sort themes by:
        // 1. Dark themes first, then light themes
        // 2. Within each group, warm themes first, then cool themes
        // 3. Alphabetically as a final tiebreaker
        return themeNames.sort((a, b) => {
            const themeA = this.themes[a];
            const themeB = this.themes[b];
            
            // Determine if themes are dark or light
            const isADark = this.getColorBrightness(themeA.primary) <= 128;
            const isBDark = this.getColorBrightness(themeB.primary) <= 128;
            
            // Sort by darkness (dark first)
            if (isADark !== isBDark) {
                return isADark ? -1 : 1;
            }
            
            // If both are dark or both are light, sort by color temperature
            const tempA = this.getColorTemperature(themeA.accent);
            const tempB = this.getColorTemperature(themeB.accent);
            
            if (tempA !== tempB) {
                // Warm themes first
                return tempA === 'warm' ? -1 : 1;
            }
            
            // If darkness and temperature are the same, sort alphabetically
            return themeA.name.localeCompare(themeB.name);
        });
    }
}

// Initialize theme manager
console.log('ThemeManager: Creating instance...');
const themeManager = new ThemeManager();
console.log('ThemeManager: Instance created, calling init...');
themeManager.init();
