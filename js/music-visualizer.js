/**
 * Music Visualizer (minimal delegator)
 * Purpose: Do not create its own popover or transport; let MusicPlayer own UI.
 * Keeps a minimal container synced with music state, with no heavy bars.
 * Reuses theme/timing via CSS classes on #musicPopover + .music-visualizer.
 */
(function () {
  const DEFAULT_BARS = 0; // no bars in minimal mode

  class MusicVisualizer {
    constructor() {
      this.container = null;
      this.isRendering = false;
      this.rafId = null;
    }

    init(containerSelector = '#musicPopover .music-visualizer') {
      if (this.container) return; // idempotent
      // Prefer MusicPlayer's visualizer container; fallback to #musicFrequencyBars if present.
      this.container =
        document.querySelector('#musicPopover .music-visualizer') ||
        document.querySelector('#musicFrequencyBars') ||
        null;

      // If nothing exists yet, do nothing — MusicPlayer will create its UI on demand.
      if (!this.container) return;

      // Minimal: ensure empty content; CSS handles subtle animation states
      this.container.innerHTML = '';

      // Subscribe to music events for state classes
      if (typeof bus !== 'undefined' && typeof bus.addEventListener === 'function') {
        bus.addEventListener('music:started', () => this.setPlaying(true));
        bus.addEventListener('music:playing', () => this.setPlaying(true));
        bus.addEventListener('music:paused', () => this.setPlaying(false));
        bus.addEventListener('music:buffering', (e) => {
          const isBuf = !!(e.detail && e.detail.buffering);
          this.setBuffering(isBuf);
        });
        bus.addEventListener('music:silenceStart', () => this.setSilent(true));
        bus.addEventListener('music:silenceEnd', () => this.setSilent(false));
      }
    }

    setPlaying(playing) {
      if (!this.container) return;
      this.container.classList.toggle('is-playing', !!playing);
      this.container.classList.toggle('is-paused', !playing);
    }

    setBuffering(isBuffering) {
      const pop = document.getElementById('musicPopover');
      if (pop) pop.classList.toggle('is-buffering', !!isBuffering);
    }

    setSilent(isSilent) {
      const pop = document.getElementById('musicPopover');
      if (pop) pop.classList.toggle('is-silent', !!isSilent);
    }
  }

  const visualizerManager = new MusicVisualizer();
  if (window.DEV) window.visualizerManager = visualizerManager;

  document.addEventListener('DOMContentLoaded', () => {
    // Defer to allow MusicPlayer.ensurePopover() to run first
    setTimeout(() => {
      try {
        visualizerManager.init();
      } catch (e) {
        console.warn('[MusicVisualizer] init failed', e);
      }
    }, 0);
  });
})();
