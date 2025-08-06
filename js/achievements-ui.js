/**
 * Achievement Display System
 * Shows achievements and progress in settings modal
 */

class AchievementsUI {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    this.createAchievementsSection();
    this.isInitialized = true;
  }

  /**
   * Create achievements section in settings
   */
  createAchievementsSection() {
    const settingsContent = document.querySelector('.settings-content');
    if (!settingsContent) return;

    // Avoid duplicate insertion if re-initialized
    if (settingsContent.querySelector('.achievements-section')) return;

    // Create achievements section
    const achievementsSection = document.createElement('div');
    achievementsSection.className = 'settings-section achievements-section';
    achievementsSection.innerHTML = `
      <h4 id="achievementsHeading">Achievements</h4>
      <div class="achievements-grid" id="achievementsGrid" role="list" aria-labelledby="achievementsHeading" aria-live="polite">
        ${this.renderAchievements()}
      </div>
      <div id="achvHoverPopover" class="achv-hover-popover" role="tooltip" aria-hidden="true"></div>
    `;

    // Prefer inserting after a known anchor; fall back gracefully
    const soundSection = settingsContent.querySelector('.settings-section[data-section="sound"], .settings-section.sound, .settings-section:nth-child(4)');
    if (soundSection) {
      soundSection.insertAdjacentElement('afterend', achievementsSection);
    } else {
      settingsContent.appendChild(achievementsSection);
    }
  }

  /**
   * Render achievements
   */
  renderAchievements() {
    const allAchievements = AchievementDefinitions.getAllAchievements();
    const stats = gamificationManager.getStats();
    
    return allAchievements.map(achievement => {
      const isUnlocked = gamificationManager.hasAchievement(achievement.id);
      const progressPercent = this.calculateProgress(achievement, stats);
      const isComplete = progressPercent >= 100;
      
      return this.renderAchievement({
        ...achievement,
        progress: progressPercent,
        unlocked: isUnlocked,
        complete: isComplete
      });
    }).join('');
  }

  /**
   * Calculate progress for an achievement
   */
  calculateProgress(achievement, stats) {
    // For achievements with simple numeric conditions
    if (achievement.id === 'mindful_beginning' || achievement.id === 'peaceful_presence') {
      const target = achievement.id === 'mindful_beginning' ? 1 : 25;
      return Math.min((stats.karmaPoints / target) * 100, 100);
    }
    
    if (achievement.id === 'gentle_progress') {
      return Math.min((stats.dailyStats.completed / 5) * 100, 100);
    }
    
    if (achievement.id === 'mindful_refinement') {
      return Math.min((stats.dailyStats.edited / 3) * 100, 100);
    }
    
    // For boolean achievements
    if (achievement.id === 'first_task_created' || 
        achievement.id === 'first_task_deleted' || 
        achievement.id === 'first_task_edited' ||
        achievement.id === 'daily_harmony') {
      return stats[achievement.id.replace('first_task_', '').replace('daily_', '')] ? 100 : 0;
    }
    
    return 0;
  }

  /**
   * Render individual achievement
   */
  renderAchievement(achievement) {
    const progressPercent = Math.min(achievement.progress, 100);
    const isUnlocked = achievement.unlocked;
    const isComplete = achievement.progress >= 100;

    // Add roles/ids for better semantics
    const titleId = `achv-title-${achievement.id}`;
    const descId = `achv-desc-${achievement.id}`;

    // Last unlocked time if available from gamification
    let lastUnlocked = '';
    try {
      const unlockedEntry = (gamificationManager.achievements || []).find(a => a.id === achievement.id);
      if (unlockedEntry && unlockedEntry.unlockedAt) {
        const d = new Date(unlockedEntry.unlockedAt);
        lastUnlocked = d.toLocaleString();
      }
    } catch (_) {}

    // Hover metadata for popover
    const hoverData = {
      id: achievement.id,
      name: achievement.name,
      condition: achievement.conditionText || 'Keep making mindful progress.',
      lastUnlocked
    };
    const hoverAttr = `data-hover='${this.escapeHtml(JSON.stringify(hoverData))}'`;

    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isComplete ? 'complete' : ''}" data-achievement="${achievement.id}" ${hoverAttr} role="listitem" aria-labelledby="${titleId}" aria-describedby="${descId}">
        <div class="achievement-icon">${this.renderAchievementIcon(achievement.icon)}</div>
        <div class="achievement-info">
          <h5 id="${titleId}">${achievement.name}</h5>
          <p id="${descId}">${achievement.description}</p>
          <div class="achievement-progress" aria-label="Progress ${Math.floor(progressPercent)} percent">
            <div class="progress-bar">
              <div class="progress-fill ${isComplete ? 'complete' : ''}" style="width: ${progressPercent}%"></div>
            </div>
            <span class="progress-text">${Math.floor(progressPercent)}%</span>
          </div>
        </div>
        ${isUnlocked ? '<div class="achievement-badge" aria-hidden="true">✓</div>' : ''}
      </div>
    `;
  }

  /**
   * Render achievement icon
   */
  renderAchievementIcon(iconName) {
    if (typeof lucide === 'undefined') {
      // Check if the icon is already an emoji
      const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}-\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}-\u{2667}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}-\u{26F6}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2767}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}-\u{3299}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{2660}-\u{2667}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}-\u{26F6}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2767}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]+$/gu;
      if (emojiRegex.test(iconName)) {
        return iconName;
      }
      
      // Fallback to emoji if Lucide not loaded
      const emojiFallbacks = {
        'sprout': '🌱',
        'trending-up': '📈',
        'pencil': '✏️',
        'leaf': '🍃',
        'check-circle': '✅',
        'plus-circle': '➕',
        'trash-2': '🗑️',
        'edit': '✏️',
        // Add emojis from affirmations.js
        '🌱': '🌱',
        '🍃': '🍃',
        '🕊️': '🕊️',
        '✨': '✨',
        '🧘': '🧘',
        '🌸': '🌸',
        '🌿': '🌿'
      };
      return emojiFallbacks[iconName] || '🏆';
    }
    
    const iconElement = document.createElement('span');
    iconElement.className = 'zen-achievement-icon';
    iconElement.innerHTML = lucide.createIcon(iconName, {
      'class': 'zen-achievement-icon-svg',
      'stroke': 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    });
    
    return iconElement.outerHTML;
  }

  /**
   * Update achievements display
   */
  updateAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    // Attempt a minimal diff update when possible:
    // If counts and order of achievements are the same, only update progress widths and classes.
    try {
      const allAchievements = AchievementDefinitions.getAllAchievements();
      const stats = gamificationManager.getStats();
      const next = allAchievements.map(a => {
        const unlocked = gamificationManager.hasAchievement(a.id);
        const progress = this.calculateProgress(a, stats);
        const complete = progress >= 100;
        return { id: a.id, unlocked, progress: Math.min(progress, 100), complete };
      });

      const cards = Array.from(grid.querySelectorAll('.achievement-card'));
      const idsMatch = cards.length === next.length && cards.every((c, i) => c.getAttribute('data-achievement') === next[i].id);

      if (idsMatch) {
        // Progress-only update path
        cards.forEach((card, i) => {
          const target = next[i];
          // toggle unlocked/locked classes
          card.classList.toggle('unlocked', !!target.unlocked);
          card.classList.toggle('locked', !target.unlocked);
          card.classList.toggle('complete', !!target.complete);

          const fill = card.querySelector('.progress-fill');
          const text = card.querySelector('.progress-text');
          if (fill) {
            // Only update if changed to avoid layout work
            const width = `${target.progress}%`;
            if (fill.style.width !== width) fill.style.width = width;
            fill.classList.toggle('complete', !!target.complete);
          }
          if (text) {
            const pct = `${Math.floor(target.progress)}%`;
            if (text.textContent !== pct) text.textContent = pct;
          }

          // Ensure a gentle micro-breath on update without heavy motion
          card.style.willChange = 'opacity, transform';
          card.style.transition = 'opacity 160ms var(--ease-smooth, ease), transform 160ms var(--ease-smooth, ease)';
        });
        return; // Done with fast path
      }
    } catch (_) {
      // Fallback to full replace below
    }

    // Fallback: full replace
    const html = this.renderAchievements();
    window.requestAnimationFrame(() => {
      grid.innerHTML = html;

      // Wire hover popovers
      this.bindHoverPopovers();

      // Subtle entrance effect with micro-scale breath
      grid.querySelectorAll('.achievement-card').forEach((card, idx) => {
        card.style.willChange = 'opacity, transform';
        card.style.opacity = '0';
        card.style.transform = 'translateY(4px) scale(0.985)';
        setTimeout(() => {
          card.style.transition = 'opacity 180ms ease-out, transform 180ms ease-out';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        }, 10 + Math.min(idx, 6) * 20);
      });
    });
  }

  /**
   * Show achievement unlock notification
   */
  showAchievementUnlock(achievementName, icon) {
    // Use zen-style notification instead of epic celebration
    if (typeof gamificationManager !== 'undefined') {
      // Let gamification manager handle zen notifications
      // Also add a brief 'active' pulse to the matching card if present
      const grid = document.getElementById('achievementsGrid');
      if (grid) {
        const selector = `.achievement-card.unlocked[data-achievement="${achievementName}"]`;
        const card = grid.querySelector(selector) || Array.from(grid.querySelectorAll('.achievement-card.unlocked')).find(c => {
          const title = c.querySelector('h5');
          return title && title.textContent && title.textContent.trim() === achievementName;
        });
        if (card) {
          card.classList.add('active');
          setTimeout(() => card.classList.remove('active'), 900);
        }
      }
      return;
    }
  }

  /**
   * Hover popover bindings (desktop only cues)
   */
  bindHoverPopovers() {
    try {
      const pop = document.getElementById('achvHoverPopover');
      if (!pop) return;

      const show = (card) => {
        const dataAttr = card.getAttribute('data-hover');
        if (!dataAttr) return;
        let data = null;
        try { data = JSON.parse(dataAttr); } catch { return; }

        // Build content
        const lines = [];
        if (data.name) lines.push(`<div class="achv-popover-title">${this.escapeHtml(data.name)}</div>`);
        if (data.condition) lines.push(`<div class="achv-popover-cond">${this.escapeHtml(data.condition)}</div>`);
        if (data.lastUnlocked) lines.push(`<div class="achv-popover-meta">Unlocked: ${this.escapeHtml(data.lastUnlocked)}</div>`);
        pop.innerHTML = lines.join('');
        pop.setAttribute('aria-hidden', 'false');

        // Position near card (top-right corner)
        const rect = card.getBoundingClientRect();
        const x = rect.right + 8 + window.scrollX;
        const y = rect.top + 8 + window.scrollY;
        pop.style.position = 'absolute';
        pop.style.left = `${x}px`;
        pop.style.top = `${y}px`;
        pop.style.opacity = '1';
        pop.style.transform = 'translateY(0)';
      };

      const hide = () => {
        pop.setAttribute('aria-hidden', 'true');
        pop.style.opacity = '0';
        pop.style.transform = 'translateY(-2px)';
      };

      // Delegate on container
      const grid = document.getElementById('achievementsGrid');
      if (!grid) return;

      // Clean previous
      grid.removeEventListener('mouseover', this._achvHoverOver);
      grid.removeEventListener('mouseout', this._achvHoverOut);

      this._achvHoverOver = (e) => {
        const card = e.target.closest('.achievement-card');
        if (!card) return;
        show(card);
      };
      this._achvHoverOut = (e) => {
        const rel = e.relatedTarget;
        if (rel && (rel === pop || pop.contains(rel))) return;
        hide();
      };

      grid.addEventListener('mouseover', this._achvHoverOver, { passive: true });
      grid.addEventListener('mouseout', this._achvHoverOut, { passive: true });

      // Hide on scroll/resize
      window.addEventListener('scroll', hide, { passive: true });
      window.addEventListener('resize', hide);

      // Initial hidden state styles
      pop.style.opacity = '0';
      pop.style.transform = 'translateY(-2px)';
      pop.style.transition = 'opacity 160ms ease, transform 160ms ease';
      pop.style.pointerEvents = 'none';
      pop.style.background = 'var(--color-glass)';
      pop.style.border = '1px solid var(--color-border)';
      pop.style.backdropFilter = 'blur(12px)';
      pop.style.padding = '10px 12px';
      pop.style.borderRadius = '10px';
      pop.style.boxShadow = '0 8px 24px var(--shadow-color)';
      pop.style.zIndex = '10060';
      pop.style.minWidth = '180px';
    } catch (_) { /* no-op */ }
  }
}

// Create global achievements UI
const achievementsUI = new AchievementsUI();

// Export for debugging
if (window.DEV) {
  window.achievementsUI = achievementsUI;
}
