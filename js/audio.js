/**
 * Audio Manager - Premium sound generation for Luxury Todo
 * Generates high-quality audio effects using Web Audio API
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.volume = 42; // lowered ~15% for subtler baseline
    this.enabled = true;
    this.globalMuted = false; // global output mute (does not pause music)
    this._preMuteGain = null; // remember gain before global mute
    this.isInitialized = false;
    this.sounds = new Map();
    this.audioInitialized = false; // Flag to track if audio context is ready

    // Pitch variation properties for gamified audio
    this.currentStep = 0;
    this.maxSteps = 10; // keep progression length; harmonics/envelopes refined below
    this.rewardSoundEnabled = true;

    // Harmonic evolution properties
    this.harmonicLayers = 2; // Number of harmonic layers to add
    this.waveformMorphFactor = 0; // 0 = sine, 1 = triangle (will be updated based on step)

    // Pentatonic scale intervals (relative to base frequency) - expanded for wider range
    this.pentatonicIntervals = [
      1, 1.125, 1.25, 1.5, 1.667, 1.875, 2.0, 2.25, 2.5, 2.75,
    ];

    // Individual step tracking for each sound
    this.soundSteps = {
      add: 0,
      complete: 0,
      edit: 0,
      delete: 0,
      settings: 0,
      palette: 0,
      progress: 0,
      victory: 0,
      font: 0,
      volume: 0,
      toggle: 0,
    };

    // Base frequencies for each sound type
    this.baseFrequencies = {
      add: 350,
      complete: 220,
      edit: 250,
      delete: 150,
      settings: 180,
      palette: 180,
      progress: 180,
      victory: 220,
      font: 180,
      volume: 180,
      toggle: 180,
    };

    // Settings panel sound (subtle and consistent)
    this.settingsSound = {
      frequency: 180,
      type: "sine",
      duration: 0.12, // slightly shorter for crispness
      volume: 0.07, // slightly reduced for subtlety
    };

    // Random pitch variation parameters
    this.randomPitchRange = 0.1; // ±10% variation for non-task sounds
    this.randomPitchEnabled = true;

    this.init();
  }

  /**
   * Initialize audio system
   */
  init() {
    try {
      // Create audio context but don't resume it yet
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      // Subtlety polish: slightly lower perceived loudness by default
      this.masterGain.gain.value = (this.volume / 100) * 0.85;

      this.isInitialized = true;

      // Audio context will be initialized on first user interaction
      this.audioInitialized = false;

      // Listen for centerbar:sound event from center bar
      if (
        typeof bus !== "undefined" &&
        typeof bus.addEventListener === "function"
      ) {
        bus.addEventListener("centerbar:sound", (event) => {
          console.log(
            "[AudioManager] Received centerbar:sound event",
            event.detail
          );
          // Treat centerbar sound as GLOBAL mute toggle (preserve backwards compatibility)
          const nextMuted = !this.globalMuted;
          this.setGlobalMute(nextMuted);
          // Also mirror to legacy soundEnabled for UI compatibility
          this.setEnabled(!nextMuted);

          // Dispatch settingsChanged event to notify other components
          if (typeof bus !== "undefined") {
            bus.dispatchEvent(
              new CustomEvent("settingsChanged", {
                detail: {
                  soundEnabled: !nextMuted,
                  globalMute: nextMuted,
                  volume: this.volume,
                },
              })
            );
          }
        });
      }

      // Also listen for settingsChanged event to update UI when settings change
      if (
        typeof bus !== "undefined" &&
        typeof bus.addEventListener === "function"
      ) {
        bus.addEventListener("settingsChanged", (event) => {
          if (event.detail && event.detail.globalMute !== undefined) {
            this.setGlobalMute(!!event.detail.globalMute);
            // keep legacy enabled in sync
            this.setEnabled(!event.detail.globalMute);
          } else if (event.detail && event.detail.soundEnabled !== undefined) {
            // fallback for older emitters
            this.setEnabled(event.detail.soundEnabled);
            this.setGlobalMute(!event.detail.soundEnabled);
          }
          if (event.detail && event.detail.volume !== undefined) {
            this.setVolume(event.detail.volume);
          }
        });
      }
    } catch (error) {
      console.warn("Audio initialization failed:", error);
      this.enabled = false;
    }
  }

  /**
   * Initialize audio context on user interaction
   * This is required by modern browsers to prevent autoplay restrictions
   */
  async initializeAudio() {
    if (!this.isInitialized || this.audioInitialized) {
      return true;
    }

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.audioInitialized = true;
      return true;
    } catch (error) {
      console.warn("Failed to initialize audio context:", error);
      return false;
    }
  }

  /**
   * Check if audio manager is ready
   * @returns {boolean} Ready state
   */
  isReady() {
    return this.isInitialized && this.enabled && this.audioInitialized;
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.masterGain) {
      // If globally muted, keep audible output at 0 but remember pre-mute level
      const target = (this.volume / 100) * 0.85;
      if (!this.globalMuted) {
        this.masterGain.gain.value = target;
      } else {
        // remember target so we can restore on unmute
        this._preMuteGain = target;
      }
    }
  }

  /**
   * Enable/disable audio
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.audioContext) return;

    try {
      const now = this.audioContext.currentTime || 0;
      // Use short ramps to avoid pops when toggling context state
      const target = (this.volume / 100) * 0.85;
      if (!enabled) {
        // Ramp down then suspend
        this.masterGain?.gain.cancelScheduledValues?.(now);
        this.masterGain?.gain.setValueAtTime?.(this.masterGain.gain.value, now);
        this.masterGain?.gain.linearRampToValueAtTime?.(0, now + 0.04);
        setTimeout(() => {
          // Suspend after ramp completes
          this.audioContext.suspend().catch(() => {});
        }, 50);
      } else {
        // Ensure value at 0, resume, then ramp up to effective level unless globally muted
        this.masterGain?.gain.cancelScheduledValues?.(now);
        this.masterGain?.gain.setValueAtTime?.(0, now);
        this.audioContext
          .resume()
          .then(() => {
            const restore = this.globalMuted ? 0 : target;
            const t = this.audioContext.currentTime || 0;
            this.masterGain?.gain.setValueAtTime?.(0, t);
            this.masterGain?.gain.linearRampToValueAtTime?.(restore, t + 0.05);
          })
          .catch(() => {});
      }
    } catch {
      // Fallback to previous behavior on any API error
      if (!enabled) {
        this.audioContext.suspend();
      } else {
        this.audioContext.resume();
      }
    }
  }

  /**
   * Toggle sound enabled state
   */
  toggleSoundEnabled() {
    // Maintain backward-compat call path by mapping to global mute
    const nextMuted = this.enabled ? true : false;
    this.setGlobalMute(nextMuted);
    this.setEnabled(!nextMuted);

    // Dispatch settingsChanged event to notify other components
    if (typeof bus !== "undefined") {
      bus.dispatchEvent(
        new CustomEvent("settingsChanged", {
          detail: {
            soundEnabled: !nextMuted,
            globalMute: nextMuted,
            volume: this.volume,
          },
        })
      );
    }

    // Update UI if settings manager is available
    if (typeof settingsManager !== "undefined") {
      settingsManager.soundEnabled = !nextMuted;
      settingsManager.updateUI?.();
    }

    // Play toggle sound if enabled after toggle (i.e., unmuted)
    if (!nextMuted) {
      this.play("toggle");
    }

    // Update center bar sound button state
    if (
      typeof centerBar !== "undefined" &&
      typeof centerBar.updateSoundButtonState === "function"
    ) {
      centerBar.updateSoundButtonState();
    }
  }

  /**
   * Globally mute/unmute output without pausing playback
   * Sets master gain to 0 when muted; restores to previous or computed volume on unmute.
   * Emits no events itself (callers should emit settingsChanged if needed).
   * @param {boolean} muted
   */
  setGlobalMute(muted) {
    this.globalMuted = !!muted;
    if (!this.masterGain) return;
    if (this.globalMuted) {
      // Remember current gain to restore later
      const current = this.masterGain.gain.value;
      const target = (this.volume / 100) * 0.85;
      this._preMuteGain = Number.isFinite(current) ? current : target;
      try {
        const now = this.audioContext?.currentTime || 0;
        this.masterGain.gain.cancelScheduledValues?.(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.03);
      } catch {
        this.masterGain.gain.value = 0;
      }
    } else {
      const restore = Number.isFinite(this._preMuteGain)
        ? this._preMuteGain
        : (this.volume / 100) * 0.85;
      try {
        const now = this.audioContext?.currentTime || 0;
        this.masterGain.gain.cancelScheduledValues?.(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(restore, now + 0.03);
      } catch {
        this.masterGain.gain.value = restore;
      }
    }
  }

  getGlobalMute() {
    return !!this.globalMuted;
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
    const frequencyMultiplier = 1 + (interval - 1) * progressionFactor;

    return baseFrequency * frequencyMultiplier;
  }

  /**
   * Get random pitch variation for subtle sounds
   * @param {number} baseFrequency - The base frequency of the sound
   * @returns {number} The frequency with random variation
   */
  getRandomPitchVariation(baseFrequency) {
    if (!this.randomPitchEnabled) {
      return baseFrequency;
    }

    const randomFactor = 1 + (Math.random() - 0.5) * 2 * this.randomPitchRange;
    return baseFrequency * randomFactor;
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
    this.waveformMorphFactor = Math.min(
      1,
      this.currentStep / (this.maxSteps / 2)
    );
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   */
  async play(soundName) {
    // Don't play sounds for "test" button
    if (soundName === "test") return;

    // If globally muted, skip generating WebAudio nodes to save CPU
    if (this.globalMuted === true) {
      return;
    }

    // Initialize audio on first user interaction
    if (!this.audioInitialized) {
      await this.initializeAudio();
    }

    if (!this.isReady()) {
      console.warn("Audio not ready. Please initialize audio first.");
      return;
    }

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Task-related sounds get pentatonic variation with reward
      const taskSounds = ["add", "complete", "edit", "delete"];

      if (taskSounds.includes(soundName)) {
        // Get the base frequency for this sound type
        const baseFrequency =
          this.baseFrequencies[soundName] || this.baseFrequencies["font"];

        // Get the current step for this specific sound
        const soundStep = this.soundSteps[soundName] || 0;

        // Calculate the varied frequency using pentatonic scale
        const variedFrequency = this.getPentatonicVariation(
          baseFrequency,
          soundStep
        );

        // Check if we're at the maximum step and should play a reward sound
        if (this.rewardSoundEnabled && soundStep === this.maxSteps - 1) {
          this.playRewardSound();
        }

        // Play the regular sound with the varied frequency
        switch (soundName) {
          case "add":
            this.playAddTask(variedFrequency);
            break;
          case "complete":
            this.playCompleteTask(variedFrequency);
            break;
          case "edit":
            this.playEditTask(variedFrequency);
            break;
          case "delete":
            this.playDeleteTask(variedFrequency);
            break;
        }

        // Increment the step for this specific sound
        this.soundSteps[soundName] = (soundStep + 1) % this.maxSteps;
      } else {
        // All non-task sounds use the same subtle settings sound
        const variedFrequency = this.getRandomPitchVariation(
          this.settingsSound.frequency
        );
        this.playSettingsSound(variedFrequency);
      }
    } catch (error) {
      console.warn("Failed to play sound:", error);
    }
  }

  /**
   * Play add task sound (crystal drop) with varied frequency and harmonic evolution
   */
  playAddTask(frequency) {
    const now = this.audioContext.currentTime;

    // Main oscillator with waveform morphing
    const mainOsc = this.audioContext.createOscillator();
    const mainGain = this.audioContext.createGain();

    // Morph between sine and triangle based on step progression
    mainOsc.type = this.waveformMorphFactor > 0.5 ? "triangle" : "sine";
    mainOsc.frequency.setValueAtTime(frequency, now);
    mainOsc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.1);

    mainGain.gain.setValueAtTime(0, now);
    // Slightly faster, softer envelope for polish
    mainGain.gain.linearRampToValueAtTime(0.26, now + 0.04);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    mainOsc.connect(mainGain);
    mainGain.connect(this.masterGain);

    // Add harmonic layers for richness
    for (let i = 0; i < this.harmonicLayers; i++) {
      const harmonicOsc = this.audioContext.createOscillator();
      const harmonicGain = this.audioContext.createGain();

      // Higher harmonics with decreasing volume
      const harmonicFreq = frequency * (2 + i * 0.5);
      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(harmonicFreq, now);
      harmonicOsc.frequency.exponentialRampToValueAtTime(
        harmonicFreq * 1.2,
        now + 0.1
      );

      // Lower volume for harmonics
      const harmonicVolume = 0.085 / (i + 1);
      harmonicGain.gain.setValueAtTime(0, now);
      harmonicGain.gain.linearRampToValueAtTime(harmonicVolume, now + 0.04);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(this.masterGain);

      harmonicOsc.start(now);
      harmonicOsc.stop(now + 0.3);
    }

    mainOsc.start(now);
    mainOsc.stop(now + 0.26);
  }

  /**
   * Play complete task sound (golden chime) with varied frequency and harmonic evolution
   */
  playCompleteTask(frequency) {
    const now = this.audioContext.currentTime;

    // Main frequencies for the chime
    const frequencies = [
      frequency,
      frequency * 1.25, // Perfect fifth
      frequency * 1.5, // Perfect octave
    ];

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Morph between sine and triangle based on step progression
      oscillator.type = this.waveformMorphFactor > 0.5 ? "triangle" : "sine";
      oscillator.frequency.value = freq;

      const startTime = now + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      // Gentle chime—slightly reduced gain, smoother decay
      gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.6);
    });

    // Add harmonic layers for richness
    for (let i = 0; i < this.harmonicLayers; i++) {
      const harmonicOsc = this.audioContext.createOscillator();
      const harmonicGain = this.audioContext.createGain();

      // Higher harmonics with decreasing volume
      const harmonicFreq = frequency * (2 + i * 0.5);
      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(harmonicFreq, now);

      // Lower volume for harmonics
      const harmonicVolume = 0.045 / (i + 1);
      harmonicGain.gain.setValueAtTime(0, now);
      harmonicGain.gain.linearRampToValueAtTime(harmonicVolume, now + 0.08);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(this.masterGain);

      harmonicOsc.start(now);
      harmonicOsc.stop(now + 0.6);
    }
  }

  /**
   * Play edit task sound (soft lock-in) with varied frequency
   */
  playEditTask(frequency) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.frequency.linearRampToValueAtTime(
      frequency * 1.28,
      this.audioContext.currentTime + 0.08
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.18,
      this.audioContext.currentTime + 0.018
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.22
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.22);
  }

  /**
   * Play delete task sound (velvet swipe) with varied frequency
   */
  playDeleteTask(frequency) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.28,
      this.audioContext.currentTime + 0.3
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(
      frequency * 2.3,
      this.audioContext.currentTime
    );
    filter.frequency.exponentialRampToValueAtTime(
      frequency * 0.6,
      this.audioContext.currentTime + 0.3
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.18,
      this.audioContext.currentTime + 0.04
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.3
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play settings sound (subtle and consistent for all settings actions)
   */
  playSettingsSound(frequency) {
    const now = this.audioContext.currentTime;

    // Main oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = this.settingsSound.type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.08,
      now + this.settingsSound.duration
    );

    filter.type = "highpass";
    filter.frequency.setValueAtTime(frequency * 0.8, now);
    filter.Q.setValueAtTime(1, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(
      this.settingsSound.volume,
      now + 0.018
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + this.settingsSound.duration
    );

    oscillator.start(now);
    oscillator.stop(now + this.settingsSound.duration);
  }

  /**
   * Play palette change sound (royal reveal) - simple basic sound
   */
  playPaletteChange() {
    const now = this.audioContext.currentTime;

    // Main frequencies for the royal reveal
    const frequencies = [180, 225, 270, 360]; // Base frequency and harmonics

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      const startTime = now + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }

  /**
   * Play progress open sound - simple basic sound
   */
  playProgressOpen() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(90, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      150,
      this.audioContext.currentTime + 0.45
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.095,
      this.audioContext.currentTime + 0.09
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.45
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.45);
  }

  /**
   * Play victory sound with configurable volume and duration scaling
   * @param {number} volumeScale - Volume scaling factor (default: 1)
   * @param {number} durationScale - Duration scaling factor (default: 1)
   */
  playVictory(volumeScale = 1, durationScale = 1) {
    const now = this.audioContext.currentTime;

    // Main frequencies for the victory fanfare
    const frequencies = [220, 275, 330, 440]; // Base frequency and harmonics

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      const startTime = now + index * 0.2 * durationScale;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(
        0.18 * volumeScale,
        startTime + 0.09 * durationScale
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + 0.72 * durationScale
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.8 * durationScale);
    });
  }

  /**
   * Play font change sound (gentle page turn) - simple basic sound
   */
  playFontChange() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      180,
      this.audioContext.currentTime + 0.15
    );
    oscillator.frequency.linearRampToValueAtTime(
      140,
      this.audioContext.currentTime + 0.3
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(
      240,
      this.audioContext.currentTime + 0.3
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.08,
      this.audioContext.currentTime + 0.05
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.3
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play volume adjust sound (subtle blip) - simple basic sound
   */
  playVolumeAdjust() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      525,
      this.audioContext.currentTime + 0.045
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      350,
      this.audioContext.currentTime + 0.095
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.095,
      this.audioContext.currentTime + 0.018
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.095
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.095);
  }

  /**
   * Play sound toggle sound (gentle click) - simple basic sound
   */
  playSoundToggle() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(
      333,
      this.audioContext.currentTime + 0.05
    );
    oscillator.frequency.linearRampToValueAtTime(
      250,
      this.audioContext.currentTime + 0.1
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.14,
      this.audioContext.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.095
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.095);
  }

  /**
   * Play reward sound with configurable volume and duration scaling
   * @param {number} volumeScale - Volume scaling factor (default: 1)
   * @param {number} durationScale - Duration scaling factor (default: 1)
   */
  playRewardSound(volumeScale = 1, durationScale = 1) {
    const now = this.audioContext.currentTime;

    // Create a subtle but satisfying reward sound
    // Using a gentle ascending arpeggio
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      // Use sine wave for a pure, gentle sound
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        freq,
        now + index * 0.08 * durationScale
      );

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      gainNode.gain.setValueAtTime(0, now + index * 0.08 * durationScale);
      gainNode.gain.linearRampToValueAtTime(
        0.08 * volumeScale,
        now + index * 0.08 * durationScale + 0.03 * durationScale
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + index * 0.08 * durationScale + 0.4 * durationScale
      );

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(now + index * 0.08 * durationScale);
      oscillator.stop(now + index * 0.08 * durationScale + 0.4 * durationScale);
    });
  }

  /**
   * Adjust the step for a specific sound
   * @param {string} soundName - Name of the sound
   * @param {number} adjustment - Number of steps to adjust (positive or negative)
   */
  adjustSoundStep(soundName, adjustment) {
    if (this.soundSteps.hasOwnProperty(soundName)) {
      this.soundSteps[soundName] = Math.max(
        0,
        Math.min(this.maxSteps - 1, this.soundSteps[soundName] + adjustment)
      );
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
      this.soundSteps[soundName] = Math.max(
        0,
        Math.min(this.maxSteps - 1, step)
      );
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

  /**
   * Generate AI edit feedback using existing victory sound with reduced parameters
   * Uses the victory sound system for consistency but with subtle adjustments
   */
  async generateAIEditSound() {
    // If globally muted, skip generating WebAudio nodes to save CPU
    if (this.globalMuted === true) {
      return;
    }

    // Initialize audio on first user interaction
    if (!this.audioInitialized) {
      await this.initializeAudio();
    }

    if (!this.isReady()) {
      console.warn("Audio not ready. Please initialize audio first.");
      return;
    }

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Use existing victory sound with reduced volume/duration for subtlety
      this.playVictory(0.4, 1.3); // 4% volume, 15% duration
    } catch (error) {
      console.warn("Failed to play AI edit sound:", error);
    }
  }
}

// Create global audio manager
const audioManager = new AudioManager();

// Export for debugging and public use
window.audioManager = audioManager;
