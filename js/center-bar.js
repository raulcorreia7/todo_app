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
        
        // microinteraction: pulse when opening
        try {
            const settingsBtn = document.getElementById('cabSettings');
            if (settingsBtn) {
                settingsBtn.classList.remove('open-pulse');
                // force reflow to restart animation
                void settingsBtn.offsetWidth;
                settingsBtn.classList.add('open-pulse');
                // cleanup after animation
                setTimeout(() => settingsBtn && settingsBtn.classList.remove('open-pulse'), 600);
            }
        } catch (_) {}

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

        // Primary path: dispatch centerbar:sound so managers handle canonical toggle + emit standardized events
        if (this.dispatch('centerbar:sound', {
            anchor: document.getElementById('cabSound') || document.getElementById('volumeBtn') || null
        })) {
            // 3) Update button state and animation after dispatch
            this.updateSoundButtonState();
            return;
        }

        // Fallbacks: call settingsManager or audioManager with GLOBAL mute semantics (no local emissions here)
        if (typeof settingsManager?.toggleSoundEnabled === 'function') {
            try {
                settingsManager.toggleSoundEnabled();
                // Update UI state after fallback
                this.updateSoundButtonState();
                return;
            } catch (e) {
                console.warn('[CenterBar] settingsManager.toggleSoundEnabled failed', e);
            }
        } else if (typeof audioManager !== 'undefined' && typeof audioManager.setGlobalMute === 'function') {
            try {
                const nextMuted = typeof audioManager.getGlobalMute === 'function'
                    ? !audioManager.getGlobalMute()
                    : !audioManager.enabled;
                audioManager.setGlobalMute(nextMuted);
                audioManager.setEnabled?.(!nextMuted);
                // Update UI state after fallback
                this.updateSoundButtonState();
                return;
            } catch (e) {
                console.warn('[CenterBar] audioManager.setGlobalMute fallback failed', e);
            }
        }

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
            return;
        }

        console.error('[CenterBar] Failed to toggle sound - no method available');
    }

    updateSoundButtonState() {
        const soundButton = document.getElementById('cabSound');
        if (!soundButton) return;

        // Get current sound state (prefer globalMute when available)
        let isSoundEnabled = true;
        if (typeof audioManager !== 'undefined' && typeof audioManager.getGlobalMute === 'function') {
            isSoundEnabled = !audioManager.getGlobalMute();
        } else if (typeof settingsManager?.getSettings === 'function') {
            isSoundEnabled = !!settingsManager.getSettings().soundEnabled;
        } else if (typeof audioManager !== 'undefined') {
            isSoundEnabled = !!audioManager.enabled;
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

        // Always open/close the music UI via bus; do NOT trigger playback here.
        const anchor = document.getElementById('cabMusic') || document.getElementById('musicBtn') || null;

        // Microinteraction: premium "zen burst" on toggle of UI for dopamine hit
        try {
            const btn = anchor;
            if (btn) {
                this.createZenBurst(btn, { tint: 'var(--glow-color, rgba(99,102,241,0.65))' });
            }
        } catch (_) {}

        if (this.dispatch('centerbar:music', { anchor })) {
            return;
        }

        console.warn('[CenterBar] centerbar:music not handled; applying DOM fallback to dispatch event');
        // Fallback: if no listener handled it, try to dispatch via DOM CustomEvent
        try {
            const ev = new CustomEvent('centerbar:music', { detail: { anchor } });
            document.dispatchEvent?.(ev);
        } catch (_) {}

        // As a last resort, avoid toggling playback automatically; UI ownership lives in MusicPlayer.
    }

    /**
     * Premium microinteraction: Zen Burst around a button
     * Creates a subtle ring ripple and a few soft particles that fade upward.
     * Respects reduced motion by doing nothing if the user prefers reduced motion.
     * @param {HTMLElement} btn 
     * @param {{tint?: string}} options 
     */
    createZenBurst(btn, options = {}) {
        try {
            // respect reduced motion
            const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) return;

            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2 + window.scrollX;
            const cy = rect.top + rect.height / 2 + window.scrollY;

            // Create a container for easy cleanup
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '0';
            container.style.top = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '1000';

            // Insert into body
            document.body.appendChild(container);

            // Ripple ring
            const ring = document.createElement('div');
            ring.style.position = 'absolute';
            ring.style.left = `${cx}px`;
            ring.style.top = `${cy}px`;
            ring.style.width = '0';
            ring.style.height = '0';
            ring.style.transform = 'translate(-50%, -50%)';
            ring.style.borderRadius = '9999px';
            ring.style.boxShadow = `0 0 0 0 ${options.tint || 'rgba(99,102,241,0.65)'}`;
            ring.style.opacity = '0.75';
            ring.style.animation = 'cabZenRipple 650ms ease-out forwards';
            container.appendChild(ring);

            // Soft particles (5–7)
            const count = 6;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.style.position = 'absolute';
                p.style.left = `${cx}px`;
                p.style.top = `${cy}px`;
                p.style.width = `${3 + Math.random() * 3}px`;
                p.style.height = p.style.width;
                p.style.borderRadius = '9999px';
                // muted premium palette
                const palette = [
                    'rgba(99,102,241,0.85)',  // indigo
                    'rgba(139,92,246,0.85)',  // violet
                    'rgba(16,185,129,0.85)',  // emerald
                    'rgba(56,189,248,0.85)',  // sky
                    'rgba(236,72,153,0.85)'   // pink
                ];
                p.style.background = palette[Math.floor(Math.random() * palette.length)];
                p.style.boxShadow = '0 0 12px rgba(255,255,255,0.20)';
                p.style.transform = 'translate(-50%, -50%)';
                const dx = (Math.random() - 0.5) * 36;
                const dy = - (14 + Math.random() * 26);
                const dur = 550 + Math.random() * 250;
                p.style.transition = `transform ${dur}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${dur}ms ease-out, filter ${dur}ms ease-out`;
                p.style.opacity = '0.95';
                container.appendChild(p);
                // async position update
                requestAnimationFrame(() => {
                    p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${0.85 + Math.random() * 0.25})`;
                    p.style.opacity = '0';
                    p.style.filter = 'blur(0.2px)';
                });
            }

            // Cleanup after animation
            setTimeout(() => {
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }, 800);
        } catch (_) {}
    }

    handleTest() {
        console.log('[CenterBar] Handling test action');

        // microinteraction: brief sparkle ring
        try {
            const btn = document.getElementById('cabTest');
            if (btn) {
                btn.classList.remove('sparkle-hit');
                void btn.offsetWidth;
                btn.classList.add('sparkle-hit');
                setTimeout(() => btn && btn.classList.remove('sparkle-hit'), 600);
            }
        } catch (_) {}

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

        // microinteraction: broom micro-sweep
        try {
            const btn = document.getElementById('cabClear');
            if (btn) {
                btn.classList.remove('micro-sweep');
                void btn.offsetWidth;
                btn.classList.add('micro-sweep');
                setTimeout(() => btn && btn.classList.remove('micro-sweep'), 600);
            }
        } catch (_) {}

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

        // microinteraction: danger shake
        try {
            const btn = document.getElementById('cabDelete');
            if (btn) {
                btn.classList.remove('danger-shake');
                void btn.offsetWidth;
                btn.classList.add('danger-shake');
                setTimeout(() => btn && btn.classList.remove('danger-shake'), 500);
            }
        } catch (_) {}

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

        // Prevent accidental restart of music button animation by avoiding any class churn
        // on #cabMusic when other actions are clicked.
        // We only ever toggle .is-playing/.is-paused for #cabMusic from music bus events,
        // NOT on arbitrary clicks here.
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
        // IMPORTANT: avoid rehydrating inside #cabMusic while playing to prevent animation reset.
        try {
            if (window.lucide && typeof lucide.createIcons === 'function') {
                const cab = document.getElementById('centerActionBar');
                const cabMusicBtn = document.getElementById('cabMusic') || document.getElementById('musicBtn');
                if (cab) {
                    // Temporarily detach the music icon from hydration if playing
                    let skipped = null;
                    if (cabMusicBtn && cabMusicBtn.classList.contains('is-playing')) {
                        // store and remove icon subtree to avoid replacement
                        skipped = cabMusicBtn.querySelector('.lucide-icon')?.parentNode ? cabMusicBtn.querySelector('.lucide-icon') : null;
                        if (skipped && skipped.parentNode) {
                            skipped.__cabDetached = true;
                            skipped.__cabNext = skipped.nextSibling;
                            skipped.parentNode.removeChild(skipped);
                        }
                    }
                    // run hydration on the bar
                    lucide.createIcons({ attrs: {} });
                    // restore the skipped node exactly where it was
                    if (skipped) {
                        const target = cabMusicBtn;
                        if (skipped.__cabNext) target.insertBefore(skipped, skipped.__cabNext);
                        else target.appendChild(skipped);
                        delete skipped.__cabDetached;
                        delete skipped.__cabNext;
                    }
                } else {
                    lucide.createIcons({ attrs: {} });
                }
            }
        } catch (_) {}

                // Initialize sound button state
        this.updateSoundButtonState();

        // Disable animation churn on #cabMusic by locking class toggling exclusively to music bus events.
        // Also protect against re-adding the same classes (which would restart CSS animations).
        const safeToggle = (el, cls, on) => {
            if (!el) return;
            // Only add/remove when state actually changes
            const has = el.classList.contains(cls);
            if (on && !has) el.classList.add(cls);
            if (!on && has) el.classList.remove(cls);
        };

        // Reflect music state on CAB from bus to drive CSS hooks (is-playing/buffering/is-paused/hint)
        try {
            if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
                const cabMusicBtn = document.getElementById('cabMusic') || document.getElementById('musicBtn');

                // Guard Lucide hydration globally to avoid replacing the music icon DOM while playing
                try {
                    if (window.lucide && typeof lucide.createIcons === 'function' && !lucide.__cabPatched) {
                        const originalCreate = lucide.createIcons.bind(lucide);
                        lucide.createIcons = function(...args) {
                            try {
                                const btn = document.getElementById('cabMusic') || document.getElementById('musicBtn');
                                if (btn && btn.classList.contains('is-playing')) {
                                    // If a root selector is passed, clone and strip #cabMusic
                                    // Many calls use no args; in that case, we run normal and then restore.
                                    const icon = btn.querySelector('.lucide-icon');
                                    if (icon && icon.parentNode) {
                                        icon.__cabPatched = true;
                                        icon.__cabNext = icon.nextSibling;
                                        icon.parentNode.removeChild(icon);
                                        const res = originalCreate(...args);
                                        // restore without losing animation timeline
                                        if (icon.__cabNext) btn.insertBefore(icon, icon.__cabNext);
                                        else btn.appendChild(icon);
                                        delete icon.__cabNext;
                                        delete icon.__cabPatched;
                                        return res;
                                    }
                                }
                            } catch (_) {}
                            return originalCreate(...args);
                        };
                        lucide.__cabPatched = true;
                    }
                } catch (_) {}

                const syncMusicClasses = (playing) => {
                    if (!cabMusicBtn) return;
                    // Use safeToggle to avoid re-adding classes and restarting animations
                    safeToggle(cabMusicBtn, 'is-playing', !!playing);
                    safeToggle(cabMusicBtn, 'is-paused', !playing);
                };

                bus.addEventListener('music:started', () => syncMusicClasses(true));
                bus.addEventListener('music:playing', () => syncMusicClasses(true));
                bus.addEventListener('music:paused', () => syncMusicClasses(false));
                bus.addEventListener('music:silenceStart', () => syncMusicClasses(false));
                bus.addEventListener('music:buffering', (e) => {
                    if (!cabMusicBtn) return;
                    safeToggle(cabMusicBtn, 'buffering', !!(e.detail && e.detail.buffering));
                });
                bus.addEventListener('music:hintStart', () => {
                    if (!cabMusicBtn) return;
                    // Only apply hint if not already present to avoid reflow/animation restart
                    if (!cabMusicBtn.classList.contains('hint')) {
                        cabMusicBtn.classList.add('hint');
                        setTimeout(() => cabMusicBtn && cabMusicBtn.classList.remove('hint'), 3000);
                    }
                });
            }
        } catch (_) {}

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
