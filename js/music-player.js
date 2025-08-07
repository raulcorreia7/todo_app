/**
 * MusicPlayer - Transport UI controller (class-based, bus-first)
 * Follows app architecture similar to CenterBar/Settings/Storage:
 * - Class instance assigned to const musicPlayer
 * - Immediate init() with DOM ready checks
 * - Uses EventBus (bus) for communication; DOM fallbacks only as last resort
 *
 * Responsibilities:
 * - Create and manage a popover with transport controls (prev/play/pause/next)
 * - Minimal visualizer container (CSS-based)
 * - Reflect state from MusicManager bus events
 * - Emit transport events via bus (music:prev, music:toggle, music:next, music:setVolume)
 */

class MusicPlayer {
  constructor() {
    this.isInitialized = false;

    // DOM refs
    this.pop = null;
    this.header = null;
    this.transport = null;
    this.volume = null;
    this.vizContainer = null;

    // state
    this.isOpenState = false;
    this.pinned = false;
    this.buffering = false;
    this.playing = false;

    // controls
    this.btnPrev = null;
    this.btnPlayPause = null;
    this.btnNext = null;

    // volume controls
    this.slider = null;
    this.fill = null;
    this.handle = null;

    // internal handlers
    this._onDocPointerDown = null;
    this._onKeyDown = null;
    this.lastAnchorEl = null;

    this.init();
  }


  isReady() {
    return this.isInitialized;
  }

  // Safe bus dispatch helper
  busDispatch(name, detail) {
    try {
      if (typeof bus !== 'undefined' && typeof bus.dispatchEvent === 'function') {
        bus.dispatchEvent(new CustomEvent(name, { detail }));
        return true;
      }
    } catch (e) {
      this.warn('busDispatch failed', name, e);
    }
    return false;
  }

  init() {
    const onReady = () => {
      try {
        this.ensurePopover();
        this.wireControls();
        this.subscribeBus();
        this.isInitialized = true;

        // Mark ready on bus (optional)
        try {
          if (typeof bus !== 'undefined' && typeof bus.markReady === 'function') {
            bus.markReady('musicplayer');
          }
        } catch (_) {}
      } catch (e) {
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  ensurePopover() {
    // Create if missing
    let pop = document.getElementById('musicPopover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'musicPopover';
      pop.className = 'music-popover';
      document.body.appendChild(pop);
    }
    this.pop = pop;

    // structure
    this.pop.innerHTML = '';
    this.pop.style.opacity = '0';
    this.pop.style.transform = 'scale(0.98)';
    this.pop.classList.remove('open');

    // Header (optional, includes a pin)
    const header = document.createElement('div');
    header.className = 'music-popover-header';
    header.innerHTML = `
      <button class="btn music-pin small" aria-label="Pin">📌</button>
      <div class="music-label">Music</div>
      <button class="btn btn--icon music-close" aria-label="Close">✕</button>
    `;
    this.header = header;

    // Transport row
    const transport = document.createElement('div');
    transport.className = 'music-transport';
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
    const volume = document.createElement('div');
    volume.className = 'music-volume';
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
    const viz = document.createElement('div');
    viz.id = 'musicFrequencyBars';
    viz.className = 'music-visualizer';
    for (let i = 0; i < 8; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
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
    this.btnPrev = this.pop.querySelector('#musicPrev');
    this.btnPlayPause = this.pop.querySelector('#musicPlayPause');
    this.btnNext = this.pop.querySelector('#musicNext');

    const btnClose = this.pop.querySelector('.music-close');
    const btnPin = this.pop.querySelector('.music-pin.small');

    // Track last anchor to exempt it from outside-click close
    this.lastAnchorEl = null;

    // volume bits
    this.slider = this.pop.querySelector('#musicSlider');
    this.fill = this.pop.querySelector('#musicFill');
    this.handle = this.pop.querySelector('#musicHandle');

    // Transport events (bus-first, with safe fallbacks)
    this.btnPrev?.addEventListener('click', (e) => {
      e.preventDefault();
      this.busDispatch('music:prev');
      // optional direct fallback
      try { if (typeof window.musicManager?.prev === 'function') window.musicManager.prev(); } catch (_) {}
    });

    this.btnPlayPause?.addEventListener('click', (e) => {
      e.preventDefault();
      this.busDispatch('music:toggle');
      // optional direct fallback
      try { if (typeof window.musicManager?.togglePlay === 'function') window.musicManager.togglePlay(); } catch (_) {}
    });

    this.btnNext?.addEventListener('click', (e) => {
      e.preventDefault();
      this.busDispatch('music:next');
      // optional direct fallback
      try { if (typeof window.musicManager?.next === 'function') window.musicManager.next(); } catch (_) {}
    });

    btnClose?.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
    });

    btnPin?.addEventListener('click', (e) => {
      e.preventDefault();
      this.pinned = !this.pinned;
      btnPin.classList.toggle('pinned', this.pinned);
      if (this.pinned) this.pop.classList.add('sticky');
      else this.pop.classList.remove('sticky');
    });

    // volume drag (simple)
    if (this.slider && this.fill && this.handle) {
      const onAt = (clientX) => {
        const rect = this.slider.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const pct = Math.round(t * 100);
        this.fill.style.width = pct + '%';
        this.handle.style.left = pct + '%';
        // inform music system
        this.busDispatch('music:setVolume', { volume: t });
      };

      const start = (e) => {
        e.preventDefault();
        const move = (ev) => {
          const x = ev.touches?.[0]?.clientX ?? ev.clientX;
          onAt(x);
        };
        const up = () => {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
          window.removeEventListener('touchmove', move);
          window.removeEventListener('touchend', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move, { passive: true });
        window.addEventListener('touchend', up);
      };

      this.slider.addEventListener('mousedown', start);
      this.slider.addEventListener('touchstart', start, { passive: true });
    }
  }

  subscribeBus() {
    if (typeof bus === 'undefined' || typeof bus.addEventListener !== 'function') {
      this.warn('bus not available; UI will still open/close');
      return;
    }

    bus.addEventListener('music:playing', (e) => {
      const isBuf = !!(e.detail && e.detail.buffering);
      this.buffering = isBuf;
      this.setPlaying(true);
      this.pop.classList.toggle('is-buffering', isBuf);
    });

    bus.addEventListener('music:paused', () => {
      this.setPlaying(false);
    });

    bus.addEventListener('music:buffering', (e) => {
      const isBuf = !!(e.detail && e.detail.buffering);
      this.buffering = isBuf;
      this.pop.classList.toggle('is-buffering', isBuf);
    });

    bus.addEventListener('music:silenceStart', () => {
      this.pop.classList.add('is-silent');
    });

    bus.addEventListener('music:silenceEnd', () => {
      this.pop.classList.remove('is-silent');
    });

    bus.addEventListener('music:hintStart', () => {
    });

    // Open/close from center bar action
    bus.addEventListener('centerbar:music', (e) => {
      const anchor = e.detail?.anchor || document.getElementById('cabMusic') || document.getElementById('musicBtn') || null;
      this.lastAnchorEl = anchor;
      this.toggleUI(anchor);
    });

    // Reflect explicit started
    bus.addEventListener('music:started', () => {
      this.setPlaying(true);
    });
  }

  setPlaying(playing) {
    this.playing = !!playing;
    const playIcon = this.pop.querySelector('#musicPlayIcon');
    const pauseIcon = this.pop.querySelector('#musicPauseIcon');
    if (playIcon && pauseIcon) {
      playIcon.style.display = this.playing ? 'none' : '';
      pauseIcon.style.display = this.playing ? '' : 'none';
    }
    // reflect on CAB button
    const btn = document.getElementById('cabMusic') || document.getElementById('musicBtn');
    if (btn) {
      btn.classList.toggle('is-playing', this.playing);
      btn.classList.toggle('is-paused', !this.playing);
      btn.classList.toggle('buffering', !!this.buffering);
    }
    // reflect on viz container
    if (this.vizContainer) {
      this.vizContainer.classList.toggle('is-playing', this.playing);
    }
  }

  isOpen() {
    return this.isOpenState;
  }

  open(anchorEl) {
    // Remember anchor for outside-click closing logic
    this.lastAnchorEl = anchorEl || this.lastAnchorEl || document.getElementById('cabMusic') || document.getElementById('musicBtn') || null;

    // position near anchor with desktop/mobile specific rules
    try {
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      const popRect = this.pop.getBoundingClientRect();

      if (!isMobile) {
        if (anchorEl) {
          const btnRect = anchorEl.getBoundingClientRect();
          const centerX = btnRect.left + btnRect.width / 2;
          const left = Math.max(8, Math.min(window.innerWidth - popRect.width - 8, centerX - popRect.width / 2));
          const bottom = Math.max(8, window.innerHeight - btnRect.top + 10);
          this.pop.style.left = left + popRect.width / 2 + 'px'; // translateX(-50%) correction
          this.pop.style.bottom = bottom + 'px';
        }
      } else {
        const cab = document.getElementById('centerActionBar');
        const cabRect = cab ? cab.getBoundingClientRect() : null;
        const anchorCenterX = cabRect ? (cabRect.left + cabRect.width / 2) : (window.innerWidth / 2);
        const left = Math.max(8, Math.min(window.innerWidth - popRect.width - 8, Math.round(anchorCenterX - popRect.width / 2)));
        const belowCabTop = cabRect ? Math.ceil(cabRect.bottom + 8) : Math.round(window.innerHeight * 0.3);
        const safeTop = Math.max(8, belowCabTop);

        this.pop.style.bottom = 'auto';
        this.pop.style.top = `${safeTop}px`;
        this.pop.style.left = `${left}px`;
      }
    } catch (_) {}

    this.pop.classList.add('open');
    this.pop.style.opacity = '1';
    this.pop.style.transform = 'scale(1)';
    // Accessibility + hit-testing: make interactive when open
    try {
      this.pop.removeAttribute('inert');
      this.pop.setAttribute('aria-hidden', 'false');
      this.pop.style.pointerEvents = 'auto';
      this.pop.style.visibility = 'visible';
    } catch (_) {}
    this.isOpenState = true;

    // Setup outside-click and ESC-to-close when opened
    try {
      this._onDocPointerDown = (ev) => {
        if (this.pinned) return;
        const target = ev.target;
        const isInsidePopover = this.pop && (this.pop === target || this.pop.contains(target));
        const isOnAnchor = this.lastAnchorEl && (this.lastAnchorEl === target || this.lastAnchorEl.contains?.(target));
        if (!isInsidePopover && !isOnAnchor) this.close();
      };
      this._onKeyDown = (ev) => {
        if (ev.key === 'Escape') this.close();
      };
      document.addEventListener('pointerdown', this._onDocPointerDown, true);
      document.addEventListener('keydown', this._onKeyDown, true);
    } catch (_) {}

  }

  close() {
    if (!this.pop) return;
    if (this.pinned) {
      return;
    }
    this.pop.classList.remove('open');
    this.pop.style.opacity = '0';
    this.pop.style.transform = 'scale(0.98)';
    // Accessibility + hit-testing: ensure completely non-interactive when closed
    try {
      this.pop.setAttribute('inert', '');
      this.pop.setAttribute('aria-hidden', 'true');
      this.pop.style.pointerEvents = 'none';
      this.pop.style.visibility = 'hidden';
    } catch (_) {}
    this.isOpenState = false;

    try {
      if (this._onDocPointerDown) {
        document.removeEventListener('pointerdown', this._onDocPointerDown, true);
        this._onDocPointerDown = null;
      }
      if (this._onKeyDown) {
        document.removeEventListener('keydown', this._onKeyDown, true);
        this._onKeyDown = null;
      }
    } catch (_) {}

  }

  toggleUI(anchorEl) {
    if (!this.isOpen()) this.open(anchorEl);
    else this.close();
  }
}

// Create global music player instance (class-based like other components)
const musicPlayer = new MusicPlayer();

// Export for debugging
if (window.DEV) {
  window.musicPlayer = musicPlayer;
}
