/**
 * MusicPlayer - unified transport UI + visualizer + bus integration
 * Replaces ad-hoc transport wiring in app.js and supersedes music-visualizer.js
 *
 * Responsibilities:
 * - Create and manage a popover with transport controls (prev/play/pause/next)
 * - Manage a minimal visualizer state (non-audio-producing; hooks exist to integrate analyser)
 * - Integrate with existing musicManager (js/music.js) via the global bus
 * - Expose a simple API: toggleUI(), open(), close(), isOpen()
 * - Provide robust, idempotent initialization and comprehensive debug logs
 *
 * Events listened (via bus):
 * - music:playing({ buffering? }): reflect playing UI state
 * - music:paused: reflect paused UI
 * - music:buffering({ buffering }): reflect buffering state
 * - music:hintStart: hint user to press play (resume gesture)
 * - music:silenceStart / music:silenceEnd: dim visualizer if desired
 *
 * Events emitted (via bus):
 * - music:prev, music:next, music:toggle
 *
 * Usage:
 *   window.musicPlayer.init();          // usually on DOMContentLoaded
 *   window.musicPlayer.toggleUI(anchorButtonEl); // called from CenterBar action
 */
(function (global) {
  const LOG_PREFIX = "[MusicPlayer]";
  function log(...args) {
    console.debug(LOG_PREFIX, ...args);
  }
  function warn(...args) {
    console.warn(LOG_PREFIX, ...args);
  }
  function err(...args) {
    console.error(LOG_PREFIX, ...args);
  }

  class MusicPlayer {
    constructor() {
      this.initialized = false;
      this.pop = null; // popover root
      this.header = null; // header row (optional)
      this.transport = null; // transport row container
      this.volume = null; // volume row container
      this.vizContainer = null; // visualizer container (minimal)
      this.isOpenState = false;
      this.pinned = false;

      // controls
      this.btnPrev = null;
      this.btnPlayPause = null;
      this.btnNext = null;

      // volume controls (optional UI)
      this.slider = null;
      this.fill = null;
      this.handle = null;

      // state
      this.buffering = false;
      this.playing = false;
    }

    busDispatch(name, detail) {
      try {
        if (
          typeof global.bus !== "undefined" &&
          typeof bus.dispatchEvent === "function"
        ) {
          bus.dispatchEvent(new CustomEvent(name, { detail }));
          return true;
        }
      } catch (e) {
        warn("busDispatch failed", name, e);
      }
      return false;
    }

    init() {
      if (this.initialized) return;
      this.ensurePopover();
      this.wireControls();
      this.subscribeBus();
      this.initialized = true;
      log("initialized");
    }

    ensurePopover() {
      // Create if missing
      let pop = document.getElementById("musicPopover");
      if (!pop) {
        pop = document.createElement("div");
        pop.id = "musicPopover";
        pop.className = "music-popover";
        document.body.appendChild(pop);
      }
      this.pop = pop;

      // structure
      this.pop.innerHTML = "";
      this.pop.style.opacity = "0";
      this.pop.style.transform = "scale(0.98)";
      this.pop.classList.remove("open");

      // Header (optional, includes a pin)
      const header = document.createElement("div");
      header.className = "music-popover-header";
      header.innerHTML = `
        <button class="btn music-pin small" aria-label="Pin">📌</button>
        <div class="music-label">Music</div>
        <button class="btn btn--icon music-close" aria-label="Close">✕</button>
      `;
      this.header = header;

      // Transport row
      const transport = document.createElement("div");
      transport.className = "music-transport";
      transport.innerHTML = `
        <button class="btn btn--action" id="musicPrev" aria-label="Previous">⏮</button>
        <button class="btn btn--action" id="musicPlayPause" aria-label="Play/Pause">
          <span id="musicPlayIcon">▶</span>
          <span id="musicPauseIcon" style="display:none;">⏸</span>
        </button>
        <button class="btn btn--action" id="musicNext" aria-label="Next">⏭</button>
      `;
      this.transport = transport;

      // Volume row (optional, non-invasive)
      const volume = document.createElement("div");
      volume.className = "music-volume";
      volume.innerHTML = `
        <span class="music-label">Vol</span>
        <div class="music-slider-container">
          <div id="musicSlider" class="music-slider">
            <div id="musicFill" class="music-fill" style="width:50%"></div>
            <div id="musicHandle" class="music-handle" style="left:50%"></div>
          </div>
        </div>
      `;
      this.volume = volume;

      // Minimal visualizer container (no audio context; CSS-animated baseline)
      const viz = document.createElement("div");
      viz.id = "musicFrequencyBars";
      viz.className = "music-visualizer";
      // Add 8 placeholder bars for CSS micro-animation
      for (let i = 0; i < 8; i++) {
        const bar = document.createElement("div");
        bar.className = "bar";
        viz.appendChild(bar);
      }
      this.vizContainer = viz;

      // Assemble
      this.pop.appendChild(header);
      this.pop.appendChild(transport);
      this.pop.appendChild(volume);
      this.pop.appendChild(viz);
    }

    wireControls() {
      this.btnPrev = this.pop.querySelector("#musicPrev");
      this.btnPlayPause = this.pop.querySelector("#musicPlayPause");
      this.btnNext = this.pop.querySelector("#musicNext");

      const btnClose = this.pop.querySelector(".music-close");
      const btnPin = this.pop.querySelector(".music-pin.small");

      // volume bits
      this.slider = this.pop.querySelector("#musicSlider");
      this.fill = this.pop.querySelector("#musicFill");
      this.handle = this.pop.querySelector("#musicHandle");

      // events
      this.btnPrev?.addEventListener("click", (e) => {
        e.preventDefault();
        log("prev clicked");
        this.busDispatch("music:prev");
      });

      this.btnPlayPause?.addEventListener("click", (e) => {
        e.preventDefault();
        log("toggle clicked");
        this.busDispatch("music:toggle");
      });

      this.btnNext?.addEventListener("click", (e) => {
        e.preventDefault();
        log("next clicked");
        this.busDispatch("music:next");
      });

      btnClose?.addEventListener("click", (e) => {
        e.preventDefault();
        this.close();
      });

      btnPin?.addEventListener("click", (e) => {
        e.preventDefault();
        this.pinned = !this.pinned;
        btnPin.classList.toggle("pinned", this.pinned);
        if (this.pinned) {
          this.pop.classList.add("sticky");
        } else {
          this.pop.classList.remove("sticky");
        }
      });

      // volume drag (simple)
      if (this.slider && this.fill && this.handle) {
        const onAt = (clientX) => {
          const rect = this.slider.getBoundingClientRect();
          const t = Math.max(
            0,
            Math.min(1, (clientX - rect.left) / rect.width)
          );
          const pct = Math.round(t * 100);
          this.fill.style.width = pct + "%";
          this.handle.style.left = pct + "%";
          // inform music system
          this.busDispatch("music:setVolume", { volume: t });
          log("volume", t.toFixed(2));
        };

        const start = (e) => {
          e.preventDefault();
          const move = (ev) => {
            const x = ev.touches?.[0]?.clientX ?? ev.clientX;
            onAt(x);
          };
          const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", up);
          };
          window.addEventListener("mousemove", move);
          window.addEventListener("mouseup", up);
          window.addEventListener("touchmove", move, { passive: true });
          window.addEventListener("touchend", up);
        };

        this.slider.addEventListener("mousedown", start);
        this.slider.addEventListener("touchstart", start, { passive: true });
      }
    }

    subscribeBus() {
      if (
        typeof global.bus === "undefined" ||
        typeof bus.addEventListener !== "function"
      ) {
        warn("bus not available; UI will still open/close");
        return;
      }

      bus.addEventListener("music:playing", (e) => {
        const isBuf = !!(e.detail && e.detail.buffering);
        this.buffering = isBuf;
        this.setPlaying(true);
        if (isBuf) this.pop.classList.add("is-buffering");
        else this.pop.classList.remove("is-buffering");
        log("music:playing", { buffering: isBuf });
      });

      bus.addEventListener("music:paused", () => {
        this.setPlaying(false);
        log("music:paused");
      });

      bus.addEventListener("music:buffering", (e) => {
        const isBuf = !!(e.detail && e.detail.buffering);
        this.buffering = isBuf;
        this.pop.classList.toggle("is-buffering", isBuf);
        log("music:buffering", { buffering: isBuf });
      });

      bus.addEventListener("music:silenceStart", () => {
        this.pop.classList.add("is-silent");
        log("music:silenceStart");
      });

      bus.addEventListener("music:silenceEnd", () => {
        this.pop.classList.remove("is-silent");
        log("music:silenceEnd");
      });

      // Optional hint to resume audio context on user gesture
      bus.addEventListener("music:hintStart", () => {
        log("music:hintStart");
      });

      // Listen for centerbar:music event from center bar
      bus.addEventListener("centerbar:music", (e) => {
        log("Received centerbar:music event");
        const anchor = e.detail?.anchor || document.getElementById('cabMusic') || document.getElementById('musicBtn') || null;
        this.toggleUI(anchor);
      });
      
      // Also listen for music:started and music:paused events to update UI
      bus.addEventListener("music:started", (e) => {
        log("Received music:started event");
        this.setPlaying(true);
      });
      
      bus.addEventListener("music:paused", (e) => {
        log("Received music:paused event");
        this.setPlaying(false);
      });
    }

    setPlaying(playing) {
      this.playing = !!playing;
      const playIcon = this.pop.querySelector("#musicPlayIcon");
      const pauseIcon = this.pop.querySelector("#musicPauseIcon");
      if (playIcon && pauseIcon) {
        playIcon.style.display = this.playing ? "none" : "";
        pauseIcon.style.display = this.playing ? "" : "none";
      }
      // reflect on button (for micro-eq CSS)
      const btn = document.getElementById("musicBtn");
      if (btn) {
        btn.classList.toggle("is-playing", this.playing);
        btn.classList.toggle("is-paused", !this.playing);
        btn.classList.toggle("buffering", !!this.buffering);
      }
      // reflect on viz container
      if (this.vizContainer) {
        this.vizContainer.classList.toggle("is-playing", this.playing);
      }
    }

    isOpen() {
      return this.isOpenState;
    }

    open(anchorEl) {
      this.init();
      // position near anchor if available; default center top-of-footer
      try {
        if (anchorEl) {
          const btnRect = anchorEl.getBoundingClientRect();
          const popRect = this.pop.getBoundingClientRect();
          const centerX = btnRect.left + btnRect.width / 2;
          const left = Math.max(
            8,
            Math.min(
              window.innerWidth - popRect.width - 8,
              centerX - popRect.width / 2
            )
          );
          const bottom = Math.max(8, window.innerHeight - btnRect.top + 10);
          this.pop.style.left = left + popRect.width / 2 + "px"; // translateX(-50%) center correction if used
          this.pop.style.bottom = bottom + "px";
        }
      } catch (_) {
        /* ignore positioning errors */
      }

      this.pop.classList.add("open");
      this.pop.style.opacity = "1";
      this.pop.style.transform = "scale(1)";
      this.isOpenState = true;
      log("open");
    }

    close() {
      if (!this.pop) return;
      if (this.pinned) {
        // do not close when pinned
        log("close requested but pinned");
        return;
      }
      this.pop.classList.remove("open");
      this.pop.style.opacity = "0";
      this.pop.style.transform = "scale(0.98)";
      this.isOpenState = false;
      log("close");
    }

    toggleUI(anchorEl) {
      if (!this.isOpen()) this.open(anchorEl);
      else this.close();
    }
  }

  // Singleton
  const musicPlayer = new MusicPlayer();
  global.musicPlayer = musicPlayer;

  // Auto-init on DOM ready to ensure container exists
  document.addEventListener("DOMContentLoaded", () => {
    try {
      musicPlayer.init();
    } catch (e) {
      err("auto init failed", e);
    }
  });
})(window);
