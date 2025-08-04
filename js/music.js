/**
 * Music Manager - Ambient background music with progressive streaming, fades, transport, and silence gaps
 * Separate from SFX AudioManager (js/audio.js). Pointer/touch only interactions.
 *
 * Defaults (confirmed):
 * - volume: 0.45
 * - muted: false
 * - gaps: enabled, 15–90s random silence between tracks
 * - Autoplay probe: attempt immediate play at volume=0 on load; if allowed and not muted, fade-in to 0.45.
 *   If blocked, show subtle glow hint on music button until first tap.
 *
 * Tracks served from /sounds:
 * - song_chill_0.mp3
 * - song_chill_1.mp3
 */
class MusicManager {
  constructor() {
    // Config
    this.TRACKS = [
      'sounds/song_chill_0.mp3',
      'sounds/song_chill_1.mp3',
    ];
    this.DEFAULT_VOLUME = 0.45;
    this.DEFAULT_MUTED = false;
    this.GAP_ENABLED_DEFAULT = true;
    this.GAP_MIN_DEFAULT = 15; // seconds
    this.GAP_MAX_DEFAULT = 90; // seconds

    // Fade timings (ms)
    this.FADE_IN_START = 300;
    this.FADE_OUT_PAUSE = 180;
    this.FADE_OUT_MUTE = 150;
    this.FADE_IN_UNMUTE = 220;
    this.FADE_OUT_SWITCH = 200;
    this.FADE_IN_SWITCH = 220;
    this.SLIDER_SMOOTH = 100;

    // Internal state
    this.audioEls = [null, null];
    this.currentIndex = 0;
    this.isInitialized = false;
    this.isLoading = false;
    this.isReady = false;
    this.isPlaying = false;
    this.isMuted = false;
    this.isInSilence = false;
    this.isBuffering = false;
    this.pendingPlay = false;
    this.targetVolume = this.DEFAULT_VOLUME;
    this.currentVolume = 0;
    this.fadeRaf = null;
    this.fadeStart = 0;
    this.fadeDuration = 0;
    this.fadeFrom = 0;
    this.fadeTo = 0;
    this.silenceTimeoutId = null;
    this.gapEnabled = this.GAP_ENABLED_DEFAULT;
    this.gapMinSeconds = this.GAP_MIN_DEFAULT;
    this.gapMaxSeconds = this.GAP_MAX_DEFAULT;

    // UI hook selectors (will be optional)
    this.ui = {
      button: null,
      popover: null,
      playBtn: null,
      pauseBtn: null,
      prevBtn: null,
      nextBtn: null,
      volumeSlider: null,
      spinnerBadge: null,
    };

    // Read persisted settings
    this.readSettings();

    // First-start is session-only; music does NOT auto-start (user must press Play)
    this.firstStartDone = false;

    // Ensure audio elements exist early (but do not play)
    this.ensureInitialized();

    // App ready only ensures initialization and UI enablement; no auto-play
    const attachAppReadyListener = () => {
      if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
        const onAppReady = () => {
          // Do nothing but keep initialized; allow UI to be enabled.
          if (typeof bus.removeEventListener === 'function') {
            bus.removeEventListener('app:ready', onAppReady);
          }
        };
        bus.addEventListener('app:ready', onAppReady);
      } else {
        setTimeout(attachAppReadyListener, 100);
      }
    };
    attachAppReadyListener();
  }

  // === Persistence ===
  readSettings() {
    try {
      if (typeof storageManager !== 'undefined' && storageManager.getSettings) {
        // Music settings may live within general settings or via dedicated keys; use localStorage fallbacks
        const vol = parseFloat(localStorage.getItem('music.volume'));
        const muted = localStorage.getItem('music.muted');
        const gapEnabled = localStorage.getItem('music.gapEnabled');
        const gapMin = parseInt(localStorage.getItem('music.gapMinSeconds'), 10);
        const gapMax = parseInt(localStorage.getItem('music.gapMaxSeconds'), 10);

        this.targetVolume = isFinite(vol) ? Math.max(0, Math.min(1, vol)) : this.DEFAULT_VOLUME;
        this.isMuted = muted === 'true' ? true : (muted === 'false' ? false : this.DEFAULT_MUTED);
        this.gapEnabled = gapEnabled === 'false' ? false : this.GAP_ENABLED_DEFAULT;
        this.gapMinSeconds = isFinite(gapMin) ? Math.max(0, gapMin) : this.GAP_MIN_DEFAULT;
        this.gapMaxSeconds = isFinite(gapMax) ? Math.max(this.gapMinSeconds, gapMax) : this.GAP_MAX_DEFAULT;
      } else {
        this.targetVolume = this.DEFAULT_VOLUME;
        this.isMuted = this.DEFAULT_MUTED;
        this.gapEnabled = this.GAP_ENABLED_DEFAULT;
        this.gapMinSeconds = this.GAP_MIN_DEFAULT;
        this.gapMaxSeconds = this.GAP_MAX_DEFAULT;
      }
    } catch (e) {
      console.warn('MusicManager: failed to read settings, using defaults', e);
      this.targetVolume = this.DEFAULT_VOLUME;
      this.isMuted = this.DEFAULT_MUTED;
      this.gapEnabled = this.GAP_ENABLED_DEFAULT;
      this.gapMinSeconds = this.GAP_MIN_DEFAULT;
      this.gapMaxSeconds = this.GAP_MAX_DEFAULT;
    }
  }

  persistSettings() {
    try {
      localStorage.setItem('music.volume', String(this.targetVolume));
      localStorage.setItem('music.muted', String(this.isMuted));
      localStorage.setItem('music.gapEnabled', String(this.gapEnabled));
      localStorage.setItem('music.gapMinSeconds', String(this.gapMinSeconds));
      localStorage.setItem('music.gapMaxSeconds', String(this.gapMaxSeconds));
    } catch (e) {
      console.warn('MusicManager: failed to persist settings', e);
    }
  }

  // === Initialization & Autoplay Probe ===
  createAudio(index) {
    const el = new Audio();
    el.preload = 'none'; // progressive streaming intent; will set src then play
    el.src = this.TRACKS[index];
    el.loop = false;
    el.crossOrigin = 'anonymous';
    el.volume = 0; // effective volume controlled by fades
    // Events for buffering and readiness
    el.addEventListener('canplay', () => {
      this.isReady = true;
      this.isLoading = false;
      this.updateBuffering(false);
      this.dispatch('music:ready', { index });
      // If pending play, start now (respect mute state and fades)
      if (this.pendingPlay) {
        this.pendingPlay = false;
        this._playWithFadeIn(el, this.FADE_IN_START);
      }
    });
    el.addEventListener('playing', () => {
      this.updateBuffering(false);
      this.dispatch('music:playing', { index });
    });
    el.addEventListener('waiting', () => {
      this.updateBuffering(true);
    });
    el.addEventListener('ended', () => {
      // Natural end -> silence gap or switch immediately depending on settings
      this.onTrackEnded();
    });
    return el;
  }

  ensureInitialized() {
    if (this.isInitialized) return;

    // Restore last track index if available (optional enhancement)
    try {
      const savedIdx = parseInt(localStorage.getItem('music.lastTrackIndex'), 10);
      if (isFinite(savedIdx) && (savedIdx === 0 || savedIdx === 1)) {
        this.currentIndex = savedIdx;
      }
    } catch (e) {
      // no-op
    }

    this.audioEls[0] = this.createAudio(0);
    this.audioEls[1] = this.createAudio(1);
    this.isInitialized = true;
    this.dispatch('music:initialized', {});
  }

  // Removed immediate autoplayProbe in favor of app:ready delayed start
  async autoplayProbe() {
    // No-op (kept for compatibility if referenced elsewhere)
    return;
  }

  // Deprecated auto-start path removed: first start is triggered only by explicit user play.

  // === Public API ===
  init(userEvent) {
    // Explicit init from UI gesture - guarantees play allowed
    this.ensureInitialized();
    // No-op here; actual play happens on UI actions
  }

  async play() {
    this.ensureInitialized();
    const el = this.audioEls[this.currentIndex];

    // If currently in silence, skip it
    if (this.isInSilence) {
      this.cancelSilence();
    }

    try {
      // start play
      const p = el.play();
      if (p && typeof p.then === 'function') await p;

      // If first start hasn't completed yet, use a 3s fade once
      if (!this.firstStartDone) {
        if (el.readyState >= 3) {
          if (this.isMuted) {
            // Stay at 0 but mark playing
            el.volume = 0;
            this.currentVolume = 0;
            this.isPlaying = true;
            this.isLoading = false;
            this.updateBuffering(false);
            this.firstStartDone = true;
            this.dispatch('music:playing', { index: this.currentIndex });
          } else {
            // First manual start path: 3s first-start fade
            await this._fadeTo(el, this.targetVolume, 3000);
            this.isPlaying = true;
            this.isLoading = false;
            this.updateBuffering(false);
            this.firstStartDone = true;
            // Fire explicit "started" event for transport/analytics
            this.dispatch('music:started', { index: this.currentIndex, firstStart: true });
            this.dispatch('music:playing', { index: this.currentIndex });
          }
        } else {
          // Wait for canplay, then do the 5s fade once
          const once = async () => {
            el.removeEventListener('canplay', once);
            if (this.isMuted) {
              el.volume = 0;
              this.currentVolume = 0;
              this.isPlaying = true;
              this.isLoading = false;
              this.updateBuffering(false);
              this.firstStartDone = true;
              this.dispatch('music:playing', { index: this.currentIndex });
            } else {
              // First-start signature 3s fade after canplay
              await this._fadeTo(el, this.targetVolume, 3000);
              this.isPlaying = true;
              this.isLoading = false;
              this.updateBuffering(false);
              this.firstStartDone = true;
              // Fire explicit "started" event for transport/analytics
              this.dispatch('music:started', { index: this.currentIndex, firstStart: true });
              this.dispatch('music:playing', { index: this.currentIndex });
            }
          };
          el.addEventListener('canplay', once);
          this.pendingPlay = true;
          this.isLoading = true;
          this.dispatch('music:loading', {});
        }
        return;
      }

      // Normal path (post-first start): use the standard short fade-in
      if (el.readyState >= 3) {
        this._playWithFadeIn(el, this.FADE_IN_START);
        // Emit "started" for subsequent resumes as well
        this.dispatch('music:started', { index: this.currentIndex, firstStart: false });
      } else {
        this.pendingPlay = true;
        this.isLoading = true;
        this.dispatch('music:loading', {});
        // When canplay resolves via _playWithFadeIn, music:playing will be sent; started will be emitted on actual start.
      }
    } catch (e) {
      console.warn('MusicManager.play: failed, likely policy. Waiting for user gesture.', e);
      this.hintStartNeeded();
    }
  }

  async pause() {
    this.ensureInitialized();
    const el = this.audioEls[this.currentIndex];
    await this._fadeTo(el, 0, this.FADE_OUT_PAUSE);
    el.pause();
    this.isPlaying = false;
    this.dispatch('music:paused', {});
  }

  async togglePlay() {
    if (this.isPlaying) return this.pause();
    return this.play();
  }

  async next() {
    // Persist last track index (optional continuity)
    try {
      localStorage.setItem('music.lastTrackIndex', String(this.currentIndex === 0 ? 1 : 0));
    } catch (e) {
      // no-op
    }
    this.ensureInitialized();
    // Skip silence if any
    if (this.isInSilence) {
      this.cancelSilence();
    }
    const currentEl = this.audioEls[this.currentIndex];
    const nextIndex = this.currentIndex === 0 ? 1 : 0;
    const nextEl = this.audioEls[nextIndex];

    await this._fadeTo(currentEl, 0, this.FADE_OUT_SWITCH);
    currentEl.pause();
    currentEl.currentTime = 0;

    this.currentIndex = nextIndex;

    try {
      const p = nextEl.play();
      if (p && typeof p.then === 'function') await p;
      if (nextEl.readyState >= 3) {
        this._playWithFadeIn(nextEl, this.FADE_IN_SWITCH);
      } else {
        this.pendingPlay = true;
        this.isLoading = true;
        this.dispatch('music:loading', {});
      }
    } catch (e) {
      console.warn('MusicManager.next: play blocked', e);
      this.hintStartNeeded();
    }
  }

  async prev() {
    // For two tracks, prev behaves like next
    return this.next();
  }

  async toggleMute() {
    this.ensureInitialized();
    if (this.isMuted) {
      this.isMuted = false;
      this.persistSettings();
      // If not playing, start now
      if (!this.isPlaying) {
        await this.play();
        return;
      }
      // If playing, fade back in
      await this._fadeTo(this.audioEls[this.currentIndex], this.targetVolume, this.FADE_IN_UNMUTE);
    } else {
      this.isMuted = true;
      this.persistSettings();
      // Fade out but keep playing (inaudible) to preserve stream, or pause? We'll keep playing muted.
      await this._fadeTo(this.audioEls[this.currentIndex], 0, this.FADE_OUT_MUTE);
    }
    this.dispatch('music:muted', { muted: this.isMuted });
  }

  setVolume(vol, opts = { smooth: true }) {
    this.ensureInitialized();
    this.targetVolume = Math.max(0, Math.min(1, vol));
    this.persistSettings();

    const el = this.audioEls[this.currentIndex];
    if (!el) return;

    if (opts && opts.smooth) {
      // Smooth ramp to new target
      this._fadeTo(el, this.isMuted ? 0 : this.targetVolume, this.SLIDER_SMOOTH);
    } else {
      el.volume = this.isMuted ? 0 : this.targetVolume;
      this.currentVolume = el.volume;
    }
    this.dispatch('music:volumeChanged', { volume: this.targetVolume });
  }

  setGapEnabled(enabled) {
    this.gapEnabled = !!enabled;
    this.persistSettings();
  }

  setGapRange(minSec, maxSec) {
    if (typeof minSec === 'number' && typeof maxSec === 'number' && maxSec >= minSec) {
      this.gapMinSeconds = Math.max(0, Math.floor(minSec));
      this.gapMaxSeconds = Math.max(this.gapMinSeconds, Math.floor(maxSec));
      this.persistSettings();
    }
  }

  getCurrentTrackIndex() {
    return this.currentIndex;
  }

  getTrackList() {
    return [...this.TRACKS];
  }

  // === Internal helpers ===
  _playWithFadeIn(el, durationMs) {
    // If muted, remain at 0 but mark playing
    if (this.isMuted) {
      el.volume = 0;
      this.currentVolume = 0;
      this.isPlaying = true;
      this.isLoading = false;
      this.updateBuffering(false);
      this.dispatch('music:playing', { index: this.currentIndex });
      return;
    }
    this._fadeTo(el, this.targetVolume, durationMs);
    this.isPlaying = true;
    this.isLoading = false;
    this.updateBuffering(false);
    this.dispatch('music:playing', { index: this.currentIndex });
  }

  async onTrackEnded() {
    if (!this.gapEnabled) {
      // Immediate switch to next with fades
      await this.next();
      return;
    }
    // Enter silence
    const el = this.audioEls[this.currentIndex];
    await this._fadeTo(el, 0, this.FADE_OUT_SWITCH);
    el.pause();
    el.currentTime = 0;

    this.isPlaying = false;
    this.isInSilence = true;
    this.dispatch('music:silenceStart', {});

    // Random delay
    const delay = this.randomInt(this.gapMinSeconds, this.gapMaxSeconds) * 1000;
    this.silenceTimeoutId = setTimeout(async () => {
      if (!this.isInSilence) return;
      // Prepare next track
      await this.next(); // next() already handles fade-in and buffering; also cancels silence
    }, delay);
  }

  cancelSilence() {
    if (this.silenceTimeoutId) {
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }
    if (this.isInSilence) {
      this.isInSilence = false;
      this.dispatch('music:silenceEnd', {});
    }
  }

  updateBuffering(isBuffering) {
    if (this.isBuffering === isBuffering) return;
    this.isBuffering = isBuffering;
    this.dispatch('music:buffering', { buffering: isBuffering });
  }

  hintStartNeeded() {
    // Fire event for UI to show a subtle glow on the music button
    this.dispatch('music:hintStart', {});
  }

  dispatch(type, detail) {
    try {
      if (typeof bus !== 'undefined' && typeof bus.dispatchEvent === 'function') {
        bus.dispatchEvent(new CustomEvent(type, { detail }));
      }
    } catch (e) {
      // safe no-op
    }
  }

  // Volume fading tween
  _fadeTo(el, to, durationMs) {
    return new Promise((resolve) => {
      // Cancel prior fade
      if (this.fadeRaf) {
        cancelAnimationFrame(this.fadeRaf);
        this.fadeRaf = null;
      }
      this.fadeStart = performance.now();
      this.fadeDuration = Math.max(0, durationMs || 0);
      this.fadeFrom = isFinite(this.currentVolume) ? this.currentVolume : (el ? el.volume : 0);
      this.fadeTo = Math.max(0, Math.min(1, to));

      const step = (now) => {
        const t = Math.min(1, (now - this.fadeStart) / (this.fadeDuration || 1));
        const eased = this.easeInOut(t);
        const val = this.fadeFrom + (this.fadeTo - this.fadeFrom) * eased;
        if (el) el.volume = val;
        this.currentVolume = val;
        if (t < 1) {
          this.fadeRaf = requestAnimationFrame(step);
        } else {
          if (el) el.volume = this.fadeTo;
          this.currentVolume = this.fadeTo;
          this.fadeRaf = null;
          resolve();
        }
      };

      if (this.fadeDuration === 0) {
        if (el) el.volume = this.fadeTo;
        this.currentVolume = this.fadeTo;
        resolve();
      } else {
        this.fadeRaf = requestAnimationFrame(step);
      }
    });
  }

  easeInOut(t) {
    // easeInOutQuad
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  randomInt(min, max) {
    const mn = Math.floor(min);
    const mx = Math.floor(max);
    return Math.floor(Math.random() * (mx - mn + 1)) + mn;
  }
}

// Create global music manager
const musicManager = new MusicManager();

// Basic UI wiring (button + popover) will be added in index.html wiring script.
// Expose for debugging
if (window.DEV) {
  window.musicManager = musicManager;
}
