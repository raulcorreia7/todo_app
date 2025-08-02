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
                border: 'rgba(233, 69, 96, 0.2)'
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
                border: 'rgba(108, 117, 125, 0.1)'
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
                border: 'rgba(218, 165, 32, 0.2)'
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
                border: 'rgba(153, 153, 153, 0.2)'
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
                border: 'rgba(0, 255, 136, 0.2)'
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
                border: 'rgba(255, 105, 180, 0.2)'
            }
        };
        
        this.currentTheme = 'midnight';
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        this.loadTheme();
        this.setupCSSVariables();
        this.setupEventListeners();
        this.isInitialized = true;
        
        // Mark as ready
        if (typeof bus !== 'undefined') {
            bus.markReady('theme');
        }
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
        if (typeof settingsManager !== 'undefined' && settingsManager.isReady()) {
            const settings = settingsManager.getSettings();
            this.currentTheme = settings.theme || 'midnight';
        }
    }

    /**
     * Setup CSS custom properties for dynamic theming
     */
    setupCSSVariables() {
        const root = document.documentElement;
        const theme = this.themes[this.currentTheme];
        
        if (!theme) return;
        
        // Set CSS variables
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--glow-color', theme.glow);
        root.style.setProperty('--shadow-color', theme.shadow);
        root.style.setProperty('--glass-color', theme.glass);
        root.style.setProperty('--border-color', theme.border);
        
        // Apply theme class to body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${this.currentTheme}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for settings changes
        if (typeof bus !== 'undefined') {
            bus.addEventListener('settingsChanged', (event) => {
                if (event.detail.theme && event.detail.theme !== this.currentTheme) {
                    this.changeTheme(event.detail.theme);
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
}

// Initialize theme manager
const themeManager = new ThemeManager();
