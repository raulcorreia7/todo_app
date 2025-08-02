/**
 * Audio Manager - Premium sound generation for Luxury Todo
 * Generates high-quality audio effects using Web Audio API
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.volume = 50;
    this.enabled = true;
    this.isInitialized = false;
    this.sounds = new Map();
    
    this.init();
  }

  /**
   * Initialize audio system
   */
  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume / 100;
      
      this.isInitialized = true;
      console.log('Audio manager initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.enabled = false;
    }
  }

  /**
   * Check if audio manager is ready
   * @returns {boolean} Ready state
   */
  isReady() {
    return this.isInitialized && this.enabled;
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume / 100;
    }
  }

  /**
   * Enable/disable audio
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled && this.audioContext) {
      this.audioContext.suspend();
    } else if (enabled && this.audioContext) {
      this.audioContext.resume();
    }
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of the sound to play
   */
  async play(soundName) {
    if (!this.isReady()) return;
    
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      switch (soundName) {
        case 'add':
          this.playAddTask();
          break;
        case 'complete':
          this.playCompleteTask();
          break;
        case 'edit':
          this.playEditTask();
          break;
        case 'delete':
          this.playDeleteTask();
          break;
        case 'settings':
          this.playSettingsOpen();
          break;
        case 'palette':
          this.playPaletteChange();
          break;
        case 'progress':
          this.playProgressOpen();
          break;
        case 'victory':
          this.playVictory();
          break;
        default:
          console.warn('Unknown sound:', soundName);
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Play add task sound (crystal drop)
   */
  playAddTask() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play complete task sound (golden chime)
   */
  playCompleteTask() {
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      const startTime = this.audioContext.currentTime + (index * 0.1);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.6);
    });
  }

  /**
   * Play edit task sound (soft lock-in)
   */
  playEditTask() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.25);
  }

  /**
   * Play delete task sound (velvet swipe)
   */
  playDeleteTask() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.35);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.35);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.35);
  }

  /**
   * Play settings open sound (silk unfold)
   */
  playSettingsOpen() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 1);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 1);
  }

  /**
   * Play palette change sound (royal reveal)
   */
  playPaletteChange() {
    const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      const startTime = this.audioContext.currentTime + (index * 0.1);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }

  /**
   * Play progress open sound
   */
  playProgressOpen() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  /**
   * Play victory sound
   */
  playVictory() {
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      const startTime = this.audioContext.currentTime + (index * 0.2);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.8);
    });
  }
}

// Create global audio manager
const audioManager = new AudioManager();

// Export for debugging
if (window.DEV) {
  window.audioManager = audioManager;
}
