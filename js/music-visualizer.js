/**
 * Music Visualizer - Frequency-driven bars (lows/mids/highs) with luxury/zen polish
 * Integrates with MusicManager (js/music.js) via the global bus.
 * - Does NOT produce audio; it only analyzes the current HTMLAudioElement output.
 * - Starts/stops rendering based on music events to keep transport in sync.
 */
(function () {
  const DEFAULT_BARS = 8;

  class MusicVisualizer {
    constructor() {
      this.ctx = null;
      this.analyser = null;
      this.source = null;
      this.freqData = null;
      this.rafId = null;
      this.isRendering = false;
      this.container = null;
      this.bars = [];
      this.barsCount = DEFAULT_BARS;

      this.sampleRate = 44100; // will be replaced after AudioContext creation
      this.fftSize = 2048;
      this.smoothing = 0.7;

      // Band splits (Hz)
      this.lowHz = [20, 250];
      this.midHz = [250, 4000];
      this.highHz = [4000, 16000];

      // Precomputed bin ranges per bar (filled after connect)
      this.barRanges = [];

      // 8-range mapping across L/M/H (luxury, balanced)
      // Lows:   20–250 Hz -> 3 bars
      // Mids:   250–4000 Hz -> 3 bars
      // Highs:  4000–16000 Hz -> 2 bars
      this.partitionConfig = [
        { range: 'low',  parts: 3, hz: [20, 250] },
        { range: 'mid',  parts: 3, hz: [250, 4000] },
        { range: 'high', parts: 2, hz: [4000, 16000] },
      ];
    }

    init(containerSelector = '#musicFrequencyBars', barsCount = DEFAULT_BARS) {
      if (this.container) return; // idempotent
      this.barsCount = Math.max(6, Math.min(64, barsCount));

      this.container = document.querySelector(containerSelector);
      if (!this.container) {
        // Create a minimal fallback container if missing
        const popHeader = document.querySelector('#musicPopover .music-popover-header');
        const div = document.createElement('div');
        div.id = containerSelector.replace('#', '');
        div.className = 'music-visualizer';
        if (popHeader) popHeader.insertBefore(div, popHeader.firstChild);
        this.container = div;
      }

      // Minimalist: no bars; keep container for layout and pin button
      this.container.innerHTML = '';
      this.bars = [];

      // Subscribe to bus events
      if (typeof bus !== 'undefined') {
        bus.addEventListener('music:started', () => this.start());
        bus.addEventListener('music:playing', () => this.container && this.container.classList.add('is-playing'));
        bus.addEventListener('music:paused', () => this.stop());
        bus.addEventListener('music:silenceStart', () => this.stop(true)); // decay quietly
        bus.addEventListener('music:silenceEnd', () => this.start());
        bus.addEventListener('music:buffering', (ev) => {
          if (!this.container) return;
          const b = !!(ev.detail && ev.detail.buffering);
          this.container.classList.toggle('is-buffering', b);
        });
        // Track switches are reflected via music:playing after next/prev; reconnect then
        bus.addEventListener('music:playing', () => this.reconnect());
      }

      // Initial sync if already playing
      if (window.musicManager && musicManager.isPlaying && !musicManager.isInSilence) {
        this.start();
      }
    }

    ensureAudioContext() {
      if (this.ctx) return;
      const ACtx = window.AudioContext || window.webkitAudioContext;
      if (!ACtx) {
        console.warn('MusicVisualizer: Web Audio API not supported.');
        return;
      }
      this.ctx = new ACtx();
      this.sampleRate = this.ctx.sampleRate;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothing;

      const bufferSize = this.analyser.frequencyBinCount; // fftSize / 2
      this.freqData = new Uint8Array(bufferSize);
    }

    async resumeContextIfNeeded() {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch (e) {
          // likely needs user gesture; rendering will be attempted again on next event
        }
      }
    }

    getCurrentAudioEl() {
      if (!window.musicManager || !Array.isArray(musicManager.audioEls)) return null;
      return musicManager.audioEls[musicManager.currentIndex] || null;
    }

    reconnect() {
      // Reconnect source to the currently active audio element
      if (!this.ctx || !this.analyser) return;
      const el = this.getCurrentAudioEl();
      if (!el) return;

      try {
        // Disconnect prior source
        if (this.source) {
          try { this.source.disconnect(); } catch (e) {}
          this.source = null;
        }

        // Create or reuse source node
        this.source = this.ctx.createMediaElementSource(el);
        // Connect to analyser only (avoid connecting to destination to prevent double audio)
        this.source.connect(this.analyser);

        // (Optional) Connect analyser to destination if you want to monitor signal post-analysis.
        // Not required here; the <audio> element already routes audio to the output.

        // Precompute bar bin ranges after we know sampleRate
        this.computeBarRanges();
      } catch (e) {
        // If element already attached to another AudioContext, this will throw.
        // In that case, we can fall back to not reconnecting (visualizer disabled).
        console.warn('MusicVisualizer: failed to connect media element source', e);
      }
    }

    computeBarRanges() {
      // Log-ish distribution across lows/mids/highs bands
      const binCount = this.analyser.frequencyBinCount; // fftSize/2
      const hzPerBin = this.sampleRate / this.fftSize;

      // Create EXACT 8 ranges: 3 lows, 3 mids, 2 highs
      const ranges = [];
      const pushRanges = (hzA, hzB, parts) => {
        const startBin = Math.max(0, Math.floor(hzA / hzPerBin));
        const endBin = Math.min(binCount - 1, Math.floor(hzB / hzPerBin));
        const span = Math.max(1, endBin - startBin + 1);

        // Use exponential spacing to bias toward lower frequencies within each band
        for (let i = 0; i < parts; i++) {
          const t0 = i / parts;
          const t1 = (i + 1) / parts;
          const b0 = Math.floor(startBin + span * Math.pow(t0, 0.8));
          const b1 = Math.floor(startBin + span * Math.pow(t1, 0.8));
          ranges.push([Math.min(b0, b1), Math.max(b0, b1)]);
        }
      };

      // Apply partition config
      this.partitionConfig.forEach(p => pushRanges(p.hz[0], p.hz[1], p.parts));

      // Ensure length == barsCount (8), trim or pad if needed
      this.barRanges = ranges.slice(0, this.barsCount);
      while (this.barRanges.length < this.barsCount) {
        const last = this.barRanges[this.barRanges.length - 1] || [0, 0];
        this.barRanges.push([last[1], last[1]]);
      }
    }

    start() {
      if (this.isRendering) return;
      this.ensureAudioContext();
      if (!this.ctx || !this.analyser) return;

      this.resumeContextIfNeeded().then(() => {
        this.reconnect();
        this.isRendering = true;
        if (this.container) this.container.classList.add('is-playing');
        this.loop();
      });
    }

    stop(decay = false) {
      if (!this.isRendering) {
        // Still decay to zero smoothly if requested
        if (decay && this.bars.length) {
          this.bars.forEach((bar) => (bar.style.height = '16%'));
        }
        return;
      }
      this.isRendering = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.container) this.container.classList.remove('is-playing');

      // Minimalist: no bar decay visuals
    }

    loop() {
      if (!this.isRendering) return;
      this.analyser.getByteFrequencyData(this.freqData);

      // Minimalist: do not render bars; we still sample to keep analyzer active if needed
      // Could update a CSS var for subtle glow if ever desired, but keep pure minimal for now.

      this.rafId = requestAnimationFrame(() => this.loop());
    }
  }

  // Singleton
  const visualizerManager = new MusicVisualizer();
  // Expose for debugging if needed
  if (window.DEV) window.visualizerManager = visualizerManager;

  // Auto-init when DOM ready (if container exists)
  document.addEventListener('DOMContentLoaded', () => {
    visualizerManager.init('#musicFrequencyBars', DEFAULT_BARS);
  });
})();
