/**
 * Center Action Bar - Central navigation and actions
 * Handles settings, music, sound, and other global actions
 */

class CenterBar {
    constructor() {
        this.bar = null;
        this.debug = false;
        this._wired = false;
        this.actions = {
            settings: this.handleSettings.bind(this),
            sound: this.handleSound.bind(this),
            music: this.handleMusic.bind(this),
            test: this.handleTest.bind(this),
            clear: this.handleClear.bind(this),
            delete: this.handleDelete.bind(this),
        };
        this.isInitialized = false;
    }

    log(...args) {
        if (this.debug) console.debug('[CenterBar]', ...args);
    }

    /**
     * Check if center bar is ready
     * @returns {boolean} Ready state
     */
    isReady() {
        return this.isInitialized && this._wired;
    }


    // Helper: dispatch via bus
    dispatch(name, detail) {
        try {
            if (typeof bus !== 'undefined' && typeof bus.dispatchEvent === 'function') {
                this.log('dispatch', name, detail || {});
                bus.dispatchEvent(new CustomEvent(name, { detail }));
                return true;
            }
        } catch (error) {
            console.warn('[CenterBar] Failed to dispatch event:', name, error);
        }
        return false;
    }

    // One-time AudioContext unlock on first user gesture
    ensureAudioUnlockedOnce() {
        try {
            if (!window.audioManager || window.audioManager._unlocked) return;
            const resumeIfSuspended = async () => {
                try {
                    if (audioManager?.ctx && audioManager.ctx.state === 'suspended') {
                        await audioManager.ctx.resume();
                    }
                    audioManager._unlocked = true;
                    window.removeEventListener('click', resumeIfSuspended, true);
                    window.removeEventListener('touchend', resumeIfSuspended, true);
                    window.removeEventListener('keydown', resumeIfSuspended, true);
                } catch (_) {}
            };
            window.addEventListener('click', resumeIfSuspended, true);
            window.addEventListener('touchend', resumeIfSuspended, true);
            window.addEventListener('keydown', resumeIfSuspended, true);
        } catch (_) {}
    }

    handleSettings() {
        console.log('[CenterBar] Handling settings action');
        
        // 1) Bus-first (preferred)
        if (this.dispatch('centerbar:settings', { 
            anchor: document.getElementById('cabSettings') || document.getElementById('settingsBtn') || null
        })) {
            console.log('[CenterBar] Settings event dispatched via bus');
            return;
        }

        console.warn('[CenterBar] Settings event not dispatched, falling back to direct call');
        
        // 2) Direct manager
        if (typeof settingsManager?.toggleSettings === 'function') {
            try { 
                console.log('[CenterBar] Calling settingsManager.toggleSettings() directly');
                settingsManager.toggleSettings(); 
                console.log('[CenterBar] settingsManager.toggleSettings() called successfully');
                return;
            } catch (e) { 
                console.warn('settings toggle failed', e); 
            }
        }
        
        console.error('[CenterBar] Failed to open settings panel - no method available');
    }

    handleSound() {
        console.log('[CenterBar] Handling sound action');
        this.ensureAudioUnlockedOnce();

        // 1) Bus-first
        if (this.dispatch('centerbar:sound', { 
            anchor: document.getElementById('cabSound') || document.getElementById('volumeBtn') || null
        })) {
            return;
        }

        console.warn('[CenterBar] Sound event not dispatched, falling back to direct call');
        
        // 2) Direct setting toggle to ensure behavior even if no listener
        if (typeof settingsManager?.toggleSoundEnabled === 'function') {
            try { 
                settingsManager.toggleSoundEnabled(); 
                return;
            } catch (e) { 
                console.warn('sound toggle failed', e); 
            }
        } else if (typeof audioManager !== 'undefined' && typeof audioManager.setEnabled === 'function') {
            try {
                const next = !audioManager.enabled;
                audioManager.setEnabled(next);
                return;
            } catch (e) { 
                console.warn('audio manager toggle failed', e); 
            }
        }

        // 3) Update button state and animation
        this.updateSoundButtonState();

        // 4) Minimal DOM fallback
        const volumeBtn = document.getElementById('volumeBtn');
        if (volumeBtn) {
            volumeBtn.click();
            return;
        }
        
        // 5) Final fallback - trigger click on sound button
        const soundBtn = document.getElementById('cabSound');
        if (soundBtn) {
            soundBtn.click();
        }
    }

    updateSoundButtonState() {
        const soundButton = document.getElementById('cabSound');
        if (!soundButton) return;

        // Get current sound state
        let isSoundEnabled = true;
        if (typeof settingsManager?.getSettings === 'function') {
            isSoundEnabled = settingsManager.getSettings().soundEnabled;
        } else if (typeof audioManager !== 'undefined') {
            isSoundEnabled = audioManager.enabled;
        }

        // Update icon
        const icon = soundButton.querySelector('.lucide-icon');
        if (icon) {
            const iconName = isSoundEnabled ? 'volume-2' : 'volume-x';
            
            // Create a new icon element to properly refresh Lucide
            const newIcon = document.createElement('i');
            newIcon.className = 'lucide-icon';
            newIcon.setAttribute('data-lucide', iconName);
            newIcon.setAttribute('aria-hidden', 'true');
            
            // Replace the old icon
            icon.parentNode.replaceChild(newIcon, icon);
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }

        // Update animation classes
        soundButton.classList.remove('sound-enabled', 'sound-disabled');
        void soundButton.offsetWidth; // Force reflow
        soundButton.classList.add(isSoundEnabled ? 'sound-enabled' : 'sound-disabled');

        // Remove animation class after animation completes
        setTimeout(() => {
            soundButton.classList.remove('sound-enabled', 'sound-disabled');
        }, 600);
    }

    handleMusic() {
        console.log('[CenterBar] Handling music action');
        this.ensureAudioUnlockedOnce();

        // 1) Bus-first to toggle UI/popover
        if (this.dispatch('centerbar:music', { 
            anchor: document.getElementById('cabMusic') || document.getElementById('musicBtn') || null
        })) {
            return;
        }

        console.warn('[CenterBar] Music event not dispatched, falling back to direct call');
        
        // 2) Minimal DOM fallback: click music UI toggle button if exists
        const btn = document.getElementById('musicBtn');
        if (btn) { 
            btn.click(); 
            return; 
        }

        // 3) Try to click the music button directly
        const musicBtn = document.getElementById('cabMusic');
        if (musicBtn) {
            musicBtn.click();
            return;
        }

        // 4) As a last resort: if intent is to toggle playback, try musicManager
        try {
            if (typeof musicManager?.togglePlay === 'function') {
                musicManager.togglePlay();
            }
        } catch (e) { 
            console.warn('music toggle fallback failed', e); 
        }
    }

    handleTest() {
        console.log('[CenterBar] Handling test action');
        if (this.dispatch('centerbar:test')) {
            return;
        }
        
        if (typeof todoApp?.addTestData === 'function') { 
            try { 
                todoApp.addTestData(); 
                return; 
            } catch (_) {} 
        }
        document.querySelector('[data-action="test"]')?.click();
    }

    handleClear() {
        console.log('[CenterBar] Handling clear action');
        if (this.dispatch('centerbar:clear')) {
            return;
        }
        
        if (typeof todoApp?.clearCompleted === 'function') { 
            try { 
                todoApp.clearCompleted(); 
                return; 
            } catch (_) {} 
        }
        document.querySelector('[data-action="clear"]')?.click();
    }

    handleDelete() {
        console.log('[CenterBar] Handling delete action');
        if (this.dispatch('centerbar:delete')) {
            return;
        }
        
        if (typeof todoApp?.deleteAll === 'function') { 
            try { 
                todoApp.deleteAll(); 
                return; 
            } catch (_) {} 
        }
        document.querySelector('[data-action="delete"]')?.click();
    }

    onClick(e) {
        this.log('onClick event triggered');
        const el = e.target?.closest?.('[data-action]');
        if (!el) {
            this.log('No element with data-action found');
            return;
        }
        const action = el.getAttribute('data-action');
        this.log(`Found action: ${action}`);
        if (action && this.actions[action]) {
            this.log('Executing action:', action);
            this.actions[action]();
        } else {
            this.log(`No handler found for action: ${action}`);
        }
    }

    wireScrollHideCenterBar() {
        const bar = this.bar;
        if (!bar) return;

        const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

        if (isMobile()) {
            bar.style.transform = 'translate(-50%, 0)';
            bar.style.opacity = '1';
            bar.style.pointerEvents = 'auto';
            return;
        }

        let lastY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            const y = window.scrollY;
            if (y > lastY && y > 80) {
                bar.style.transform = 'translate(-50%, 24px)';
                bar.style.opacity = '0';
                bar.style.pointerEvents = 'none';
            } else {
                bar.style.transform = 'translate(-50%, 0)';
                bar.style.opacity = '1';
                bar.style.pointerEvents = 'auto';
            }
            lastY = y;
            ticking = false;
        };

        const onScrollHandler = () => {
            if (isMobile()) {
                bar.style.transform = 'translate(-50%, 0)';
                bar.style.opacity = '1';
                bar.style.pointerEvents = 'auto';
                return;
            }
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScrollHandler, { passive: true });

        const ensureVisibleOnMobile = () => {
            if (isMobile()) {
                bar.style.transform = 'translate(-50%, 0)';
                bar.style.opacity = '1';
                bar.style.pointerEvents = 'auto';
            }
        };
        window.addEventListener('resize', ensureVisibleOnMobile);
        window.addEventListener('orientationchange', () => setTimeout(ensureVisibleOnMobile, 150));
    }

    tryWireOnce() {
        const bar = document.getElementById('centerActionBar');
        if (!bar) {
            this.log('centerActionBar not found');
            return false;
        }
        this.bar = bar;

        if (!this._wired) {
            // Use event delegation for better performance and reliability
            bar.addEventListener('click', this.onClick.bind(this), { passive: true, capture: false });
            this._wired = true;
            this.log('Event listener attached to centerActionBar');
        }

        // Check if buttons are found
        const buttons = bar.querySelectorAll('[data-action]');
        this.log(`Found ${buttons.length} buttons with data-action:`);
        buttons.forEach(btn => {
            this.log(`  - ${btn.id}: ${btn.getAttribute('data-action')}`);
        });

        // Hydrate Lucide icons within the Center Action Bar container
        try {
            if (window.lucide && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        } catch (_) {}

        // Initialize sound button state
        this.updateSoundButtonState();

        this.wireScrollHideCenterBar();
        this.log('wired');
        return true;
    }

    /**
     * Initialize center bar with DOM ready check
     */
    init() {
        console.log('CenterBar: Initializing...');
        
        // Check if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.tryWireOnce();
                this.isInitialized = true;
                console.log('CenterBar: Initialized successfully');
                
                // Mark as ready on bus
                if (typeof bus !== 'undefined' && typeof bus.markReady === 'function') {
                    bus.markReady('centerbar');
                }
                
                // Dispatch ready event to notify other components
                this.dispatch('centerbar:ready', { component: 'centerbar' });
            });
        } else {
            // DOM is already ready
            this.tryWireOnce();
            this.isInitialized = true;
            console.log('CenterBar: Initialized successfully');
            
            // Mark as ready on bus
            if (typeof bus !== 'undefined' && typeof bus.markReady === 'function') {
                bus.markReady('centerbar');
            }
            
            // Dispatch ready event to notify other components
            this.dispatch('centerbar:ready', { component: 'centerbar' });
        }
    }
}

// Create global center bar instance
const centerBar = new CenterBar();

// Initialize center bar immediately
centerBar.init();

// Export for debugging
if (window.DEV) {
    window.centerBar = centerBar;
}
