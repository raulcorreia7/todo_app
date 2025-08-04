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

        // Pitch variation properties for gamified audio
        this.currentStep = 0;
        this.maxSteps = 10; // Increased to 10 steps for more gradual progression
        this.pitchVariationRange = 5.0; // Increased for more dramatic climb
        this.rewardSoundEnabled = true;

        // Octave progression for dopamine hit (C1 to C5)
        this.startOctave = 1; // C1 (32.70 Hz)
        this.endOctave = 5;   // C5 (523.25 Hz) - Extended range for more dramatic progression

        // Harmonic evolution properties
        this.harmonicLayers = 2; // Number of harmonic layers to add
        this.waveformMorphFactor = 0; // 0 = sine, 1 = triangle (will be updated based on step)

        // Pentatonic scale intervals (relative to base frequency) - expanded for wider range
        this.pentatonicIntervals = [1, 1.125, 1.25, 1.5, 1.667, 1.875, 2.0, 2.25, 2.5, 2.75];

        // Individual step tracking for each sound
        this.soundSteps = {
            'addTask': 0,
            'completeTask': 0,
            'victorySwell': 0,
            'editSave': 0,
            'deleteTask': 0,
            'unlockPalette': 0,
            'openProgress': 0,
            'paletteHover': 0
        };

        // Base frequencies for each sound type
        this.baseFrequencies = {
            'addTask': 350,
            'completeTask': 220,
            'victorySwell': 220,
            'editSave': 250,
            'deleteTask': 150,
            'unlockPalette': 180,
            'openProgress': 120,
            'paletteHover': 2000
        };
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

            // Try to initialize audio context immediately
            if (this.audioContext.state === 'suspended') {
                // Add a user gesture listener to resume the audio context
                const resumeAudio = () => {
                    this.audioContext.resume().then(() => {
                        this.enabled = true;
                        console.log('Sound manager initialized successfully');
                        // Remove the event listener after first use
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('touchstart', resumeAudio);
                    }).catch(error => {
                        console.warn('Failed to initialize audio context:', error);
                    });
                };

                // Listen for user gesture
                document.addEventListener('click', resumeAudio, { once: true });
                document.addEventListener('touchstart', resumeAudio, { once: true });
            } else {
                this.enabled = true;
                console.log('Sound manager initialized successfully');
            }

        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    /**
     * Initialize audio context on user interaction
     * This is required by modern browsers to prevent autoplay restrictions
     */
    async initializeAudio() {
        if (!this.audioContext || this.audioInitialized) {
            return true;
        }

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.audioInitialized = true;
            console.log('Audio context initialized successfully');
            return true;
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
            return false;
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
     * Get pentatonic frequency variation based on step
     * @param {number} baseFrequency - The base frequency of the sound
     * @param {number} step - The current step for this sound
     * @returns {number} The varied frequency based on pentatonic scale
     */
    getPentatonicVariation(baseFrequency, step) {
        if (step === 0) {
            return baseFrequency;
        }

        // Select interval based on step (cycling through pentatonic intervals)
        const intervalIndex = (step - 1) % this.pentatonicIntervals.length;
        const interval = this.pentatonicIntervals[intervalIndex];

        // Calculate progression factor (0 to 1)
        const progressionFactor = step / this.maxSteps;

        // Apply interval with progression
        const frequencyMultiplier = 1 + ((interval - 1) * progressionFactor);

        return baseFrequency * frequencyMultiplier;
    }

    /**
     * Increment the step counter and reset if needed
     */
    incrementStep() {
        this.currentStep++;

        // Reset to step 0 if we've reached maxSteps
        if (this.currentStep >= this.maxSteps) {
            this.currentStep = 0;
        }

        // Update waveform morph factor (0 = sine, 1 = triangle)
        // This creates a gradual transition from sine to triangle as steps progress
        this.waveformMorphFactor = Math.min(1, this.currentStep / (this.maxSteps / 2));
    }

    /**
     * Create crystal drop sound (glass droplet + micro-chord) with pentatonic variation
     */
    createCrystalDrop() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['addTask'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['addTask'] || 350;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        // High frequency droplet with varied frequency
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();

        // Morph between sine and triangle based on step progression
        osc1.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        osc1.frequency.setValueAtTime(variedFrequency, now);
        osc1.frequency.exponentialRampToValueAtTime(variedFrequency * 0.67, now + 0.1);

        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain1);
        gain1.connect(this.masterGain);

        // Micro chord with varied frequency
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();

        // Morph between sine and triangle based on step progression
        osc2.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        osc2.frequency.setValueAtTime(variedFrequency * 1.5, now); // Perfect fifth
        osc2.frequency.setValueAtTime(variedFrequency * 1.88, now + 0.05); // Major sixth

        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc2.connect(gain2);
        gain2.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);

        // Increment the step for this specific sound
        this.soundSteps['addTask'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create golden chime sound with pentatonic variation
     */
    createGoldenChime() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['completeTask'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['completeTask'] || 220;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        // Main chime with varied frequency
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Morph between sine and triangle based on step progression
        osc.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(variedFrequency, now); // Base frequency
        osc.frequency.setValueAtTime(variedFrequency * 1.26, now + 0.1); // Perfect fifth

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

        // Increment the step for this specific sound
        this.soundSteps['completeTask'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create victory swell sound with pentatonic variation
     */
    createVictorySwell() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['victorySwell'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['victorySwell'] || 220;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        // Layered chords with varied frequency
        const frequencies = [
            variedFrequency,
            variedFrequency * 1.25, // Perfect fifth
            variedFrequency * 1.5   // Perfect octave
        ];

        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Morph between sine and triangle based on step progression
            osc.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
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

        // Increment the step for this specific sound
        this.soundSteps['victorySwell'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create soft lock-in sound with pentatonic variation
     */
    createSoftLockIn() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['editSave'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['editSave'] || 250;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        // Metallic click with varied frequency
        const click = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();

        click.type = 'square';
        click.frequency.setValueAtTime(variedFrequency * 2, now);

        clickGain.gain.setValueAtTime(0, now);
        clickGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        click.connect(clickGain);
        clickGain.connect(this.masterGain);

        // Whoosh with varied frequency
        const whoosh = this.audioContext.createOscillator();
        const whooshGain = this.audioContext.createGain();
        const whooshFilter = this.audioContext.createBiquadFilter();

        whoosh.type = 'sawtooth';
        whoosh.frequency.setValueAtTime(variedFrequency * 0.5, now);
        whoosh.frequency.exponentialRampToValueAtTime(variedFrequency * 0.125, now + 0.25);

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

        // Increment the step for this specific sound
        this.soundSteps['editSave'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create velvet swipe sound with pentatonic variation
     */
    createVelvetSwipe() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['deleteTask'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['deleteTask'] || 150;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(variedFrequency, now);
        osc.frequency.exponentialRampToValueAtTime(variedFrequency * 0.25, now + 0.35);

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

        // Increment the step for this specific sound
        this.soundSteps['deleteTask'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create royal reveal sound with pentatonic variation
     */
    createRoyalReveal() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['unlockPalette'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['unlockPalette'] || 180;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        // Harp glissando with varied frequency
        const frequencies = [
            variedFrequency,
            variedFrequency * 1.125,
            variedFrequency * 1.25,
            variedFrequency * 1.5,
            variedFrequency * 1.667,
            variedFrequency * 1.875,
            variedFrequency * 2.0,
            variedFrequency * 2.25
        ];

        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Morph between sine and triangle based on step progression
            osc.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
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

        // Increment the step for this specific sound
        this.soundSteps['unlockPalette'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create silk unfold sound with pentatonic variation
     */
    createSilkUnfold() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['openProgress'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['openProgress'] || 120;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        // Airy pad with varied frequency
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Morph between sine and triangle based on step progression
        osc1.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        osc1.frequency.setValueAtTime(variedFrequency, now);

        osc2.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        osc2.frequency.setValueAtTime(variedFrequency * 1.26, now); // Perfect fifth

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

        // Increment the step for this specific sound
        this.soundSteps['openProgress'] = (soundStep + 1) % this.maxSteps;
    }

    /**
     * Create micro glint sound with pentatonic variation
     */
    createMicroGlint() {
        const now = this.audioContext.currentTime;

        // Get the current step for this specific sound
        const soundStep = this.soundSteps['paletteHover'] || 0;

        // Calculate the varied frequency using pentatonic scale
        const baseFrequency = this.baseFrequencies['paletteHover'] || 2000;
        const variedFrequency = this.getPentatonicVariation(baseFrequency, soundStep);

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
            this.playRewardSound();
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Morph between sine and triangle based on step progression
        osc.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(variedFrequency, now);
        osc.frequency.exponentialRampToValueAtTime(variedFrequency * 2, now + 0.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.1);

        // Increment the step for this specific sound
        this.soundSteps['paletteHover'] = (soundStep + 1) % this.maxSteps;
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

    /**
     * Play reward sound when reaching maximum step
     */
    playRewardSound() {
        const now = this.audioContext.currentTime;

        // Create a triumphant sound with multiple oscillators
        // Using C4 to C6 range for a more satisfying but quicker dopamine hit
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Morph between sine and triangle based on step progression
            oscillator.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
            oscillator.frequency.setValueAtTime(freq, now + index * 0.1);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.Q.setValueAtTime(5, now);

            gainNode.gain.setValueAtTime(0, now + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(0.2, now + index * 0.1 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.8);

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start(now + index * 0.1);
            oscillator.stop(now + index * 0.1 + 0.8);
        });

        // Add a subtle "shimmer" effect with morphing
        const shimmerOsc = this.audioContext.createOscillator();
        const shimmerGain = this.audioContext.createGain();

        shimmerOsc.type = this.waveformMorphFactor > 0.5 ? 'triangle' : 'sine';
        shimmerOsc.frequency.setValueAtTime(2000, now);
        shimmerOsc.frequency.exponentialRampToValueAtTime(4000, now + 0.5);

        shimmerGain.gain.setValueAtTime(0, now);
        shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(this.masterGain);

        shimmerOsc.start(now);
        shimmerOsc.stop(now + 0.5);
    }

    /**
     * Adjust the step for a specific sound
     * @param {string} soundName - Name of the sound
     * @param {number} adjustment - Number of steps to adjust (positive or negative)
     */
    adjustSoundStep(soundName, adjustment) {
        if (this.soundSteps.hasOwnProperty(soundName)) {
            this.soundSteps[soundName] = Math.max(0, Math.min(this.maxSteps - 1,
                this.soundSteps[soundName] + adjustment));
        }
    }

    /**
     * Reset the step for a specific sound to 0
     * @param {string} soundName - Name of the sound
     */
    resetSoundStep(soundName) {
        if (this.soundSteps.hasOwnProperty(soundName)) {
            this.soundSteps[soundName] = 0;
        }
    }

    /**
     * Set all sound steps to a specific value
     * @param {number} step - Step value to set for all sounds
     */
    setAllSoundSteps(step) {
        for (const soundName in this.soundSteps) {
            this.soundSteps[soundName] = Math.max(0, Math.min(this.maxSteps - 1, step));
        }
        this.currentStep = step;
    }

    /**
     * Randomize all sound steps
     */
    randomizeAllSoundSteps() {
        for (const soundName in this.soundSteps) {
            this.soundSteps[soundName] = Math.floor(Math.random() * this.maxSteps);
        }
        this.currentStep = Math.floor(Math.random() * this.maxSteps);
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
