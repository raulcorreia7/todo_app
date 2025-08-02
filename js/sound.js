/**
 * Premium sound system for Luxury Todo
 * Handles dopamine audio feedback with Web Audio API
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.volume = 0.5;
        this.enabled = false;
        this.sounds = new Map();
        this.init();
    }

    /**
     * Initialize Web Audio API
     */
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // Create all sound presets
            this.createSoundPresets();
            
            // Resume context on first user interaction
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    /**
     * Create sound presets using Web Audio API
     */
    createSoundPresets() {
        // Crystal drop - for adding tasks
        this.sounds.set('addTask', () => this.createCrystalDrop());
        
        // Golden chime - for completing tasks
        this.sounds.set('completeTask', () => this.createGoldenChime());
        
        // Victory swell - for final task completion
        this.sounds.set('victorySwell', () => this.createVictorySwell());
        
        // Soft lock-in - for editing/saving
        this.sounds.set('editSave', () => this.createSoftLockIn());
        
        // Velvet swipe - for deleting
        this.sounds.set('deleteTask', () => this.createVelvetSwipe());
        
        // Royal reveal - for unlocking palette
        this.sounds.set('unlockPalette', () => this.createRoyalReveal());
        
        // Silk unfold - for opening progress
        this.sounds.set('openProgress', () => this.createSilkUnfold());
        
        // Micro glint - for palette hover
        this.sounds.set('paletteHover', () => this.createMicroGlint());
    }

    /**
     * Create crystal drop sound (glass droplet + micro-chord)
     */
    createCrystalDrop() {
        const now = this.audioContext.currentTime;
        
        // High frequency droplet
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        
        // Micro chord
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
        
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }

    /**
     * Create golden chime sound
     */
    createGoldenChime() {
        const now = this.audioContext.currentTime;
        
        // Main chime
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.setValueAtTime(1108.73, now + 0.1); // C#6
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(10, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.6);
    }

    /**
     * Create victory swell sound
     */
    createVictorySwell() {
        const now = this.audioContext.currentTime;
        
        // Layered chords
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.5);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(500, now + 1.5);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2 / (index + 1), now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + 1.5);
        });
    }

    /**
     * Create soft lock-in sound
     */
    createSoftLockIn() {
        const now = this.audioContext.currentTime;
        
        // Metallic click
        const click = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();
        
        click.type = 'square';
        click.frequency.setValueAtTime(2000, now);
        
        clickGain.gain.setValueAtTime(0, now);
        clickGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        click.connect(clickGain);
        clickGain.connect(this.masterGain);
        
        // Whoosh
        const whoosh = this.audioContext.createOscillator();
        const whooshGain = this.audioContext.createGain();
        const whooshFilter = this.audioContext.createBiquadFilter();
        
        whoosh.type = 'sawtooth';
        whoosh.frequency.setValueAtTime(200, now);
        whoosh.frequency.exponentialRampToValueAtTime(50, now + 0.25);
        
        whooshFilter.type = 'lowpass';
        whooshFilter.frequency.setValueAtTime(1000, now);
        whooshFilter.frequency.exponentialRampToValueAtTime(100, now + 0.25);
        
        whooshGain.gain.setValueAtTime(0, now);
        whooshGain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        whoosh.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(this.masterGain);
        
        click.start(now);
        whoosh.start(now);
        click.stop(now + 0.05);
        whoosh.stop(now + 0.25);
    }

    /**
     * Create velvet swipe sound
     */
    createVelvetSwipe() {
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.35);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.35);
    }

    /**
     * Create royal reveal sound
     */
    createRoyalReveal() {
        const now = this.audioContext.currentTime;
        
        // Harp glissando
        const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
        
        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.1);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.Q.setValueAtTime(5, now);
            
            gain.gain.setValueAtTime(0, now + index * 0.1);
            gain.gain.linearRampToValueAtTime(0.1, now + index * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + index * 0.1);
            osc.stop(now + index * 0.1 + 0.3);
        });
    }

    /**
     * Create silk unfold sound
     */
    createSilkUnfold() {
        const now = this.audioContext.currentTime;
        
        // Airy pad
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(554.37, now);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1);
        osc2.stop(now + 1);
    }

    /**
     * Create micro glint sound
     */
    createMicroGlint() {
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(4000, now + 0.1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * Play a sound by name
     * @param {string} soundName - Name of the sound to play
     */
    play(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) {
            return;
        }

        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        try {
            this.sounds.get(soundName)();
        } catch (error) {
            console.warn('Failed to play sound:', error);
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    /**
     * Enable/disable sound system
     * @param {boolean} enabled - Whether to enable sounds
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Get current volume
     * @returns {number} - Current volume level
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Check if sound system is enabled
     * @returns {boolean} - Whether sounds are enabled
     */
    isEnabled() {
        return this.enabled;
    }
}

// Create global sound manager
const soundManager = new SoundManager();

// Listen for settings changes
bus.addEventListener('settingsChanged', (e) => {
    if (e.detail.volume !== undefined) {
        soundManager.setVolume(e.detail.volume);
    }
    if (e.detail.soundEnabled !== undefined) {
        soundManager.setEnabled(e.detail.soundEnabled);
    }
});

// Listen for task events
bus.addEventListener('taskAdded', () => soundManager.play('addTask'));
bus.addEventListener('taskCompleted', () => {
    const completed = app.tasks.filter(t => t.completed).length;
    const total = app.tasks.length;
    
    if (completed === total && total > 0) {
        soundManager.play('victorySwell');
    } else {
        soundManager.play('completeTask');
    }
});
bus.addEventListener('taskEdited', () => soundManager.play('editSave'));
bus.addEventListener('taskDeleted', () => soundManager.play('deleteTask'));

// Export for debugging
if (window.DEV) {
    window.soundManager = soundManager;
}
