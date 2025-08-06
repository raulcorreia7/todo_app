# Todo App Development Plan (Revised)

## Phase 1: Foundational Polish (ID: LUX-REFINE-001) [Completed]
- [x] LUX-REFINE-001-01: Update design-system.css with spatial ratios and animation curves
- [x] LUX-REFINE-001-02: Create zen-interactions.css for micro-animations
- [x] LUX-REFINE-001-03: Implement haptic feedback in app.js
- [x] LUX-REFINE-001-04: Refine sound design in audio.js

## Phase 2: Core Mobile UI Architecture (ID: MOBILE-ARCH-002) [Completed]
- [x] MOBILE-ARCH-002-01: Implement dual-layer floating UI system
  - Created top floating-settings toolbar and retained bottom floating-actions (centered bar) for mobile; preserved legacy .floating-controls for desktop, hidden on mobile
  - Implemented smooth hide/show for floating-actions on scroll (down hides, up shows)
  - Ensured layering to keep floating-settings behind achievements and below modals/popovers
  - Files: `index.html`, `styles/zen-interactions.css`, `styles/luxury-responsive.css`

- [x] MOBILE-ARCH-002-02: Create top floating-settings panel
  - Positioned at top-right; subtle glass, hover lift, 36–42px sizing via tokens; safe-area aware
  - Buttons: Settings (wired to settingsManager.toggleSettings), Music (toggleMusic or fallback to click #musicBtn), Sound (toggleSound or fallback to click #volumeBtn)
  - Files: `index.html`, `styles/luxury-responsive.css`, `styles/zen-interactions.css`

- [x] MOBILE-ARCH-002-03: Design bottom floating-actions panel
  - Kept existing centered floating action bar; added scroll hide/show logic with rAF and passive listeners
  - Breathing animation utility added (not forced on, available via `.btn--breathing`)
  - Files: `index.html`, `styles/zen-interactions.css`

- [x] MOBILE-ARCH-002-04: Establish layered z-index system
  - Defined explicit z-index aliases in design-system and applied to key components
    - Tokens: `--z-floating-actions`, `--z-floating-settings`, `--z-achievements`, `--z-popover`, `--z-panel`, `--z-modal`
    - Applied in `index.html` (floating-actions, floating-settings, music-popover)
    - Applied in `styles/zen-achievements.css` (.zen-achievement-notification)
  - Ensured popovers/panels take precedence; achievements remain above settings
  - Files: `styles/design-system.css`, `index.html`, `styles/zen-achievements.css`

- [x] MOBILE-ARCH-002-05: Settings panel - Full-width bottom alignment
  - On mobile, settings panel becomes full-width, bottom-aligned with rounded top corners; respects safe area
  - Files: `styles/luxury-responsive.css`

- [x] MOBILE-ARCH-002-06: Settings panel - Adaptive height management
  - Constrained to max-height: 90vh with overflow auto and -webkit-overflow-scrolling: touch
  - Files: `styles/luxury-responsive.css`

## Phase 3: UI Refinements & Interactions (ID: UI-REFINE-003)
- [x] UI-REFINE-003-01: Fix center action bar icon colors
  - Updated `styles/center-action-bar.css` to use `var(--color-text)` instead of hardcoded white
  - Ensures consistency with the "add task" button and proper theme integration
  - Files: `styles/center-action-bar.css`

- [ ] UI-REFINE-003-02: Task item grid redesign
  - Implement CSS grid layout (replace current flex in luxury-components.css)
    - Example:
      - `.task-item { display: grid; grid-template-areas: "checkbox title actions"; grid-template-columns: 50px 1fr 120px; align-items: center; gap: 12px; }`
      - Assign areas: `.task-checkbox{ grid-area: checkbox; } .task-text-content{ grid-area: title; } .task-actions{ grid-area: actions; }`
  - Mobile (<768px): reduce actions column to 100px; stack if width <480px
  - Ensure checkbox/titles/actions map to current DOM from app.js
  - Files: `styles/luxury-components.css`, `styles/luxury-responsive.css`, `index.html`, `js/app.js`

- [ ] UI-REFINE-003-02: Checkbox vertical alignment refinement
  - Use flexbox centering and remove stray margins
    - `.task-checkbox{ align-self:center; margin-top:0; display:flex; align-items:center; justify-content:center; }`
  - Maintain 40px container with 24px checkmark; ensure 44px touch target surrounding grid cell
  - Files: `styles/luxury-components.css`

- [ ] UI-REFINE-003-03: Title typography adjustment (0.9rem)
  - Reduce `.task-title` font-size to 0.9rem; line-height ~1.4; keep contrast via current theme tokens
  - On mobile: clamp to 0.875rem for very small screens
  - Files: `styles/luxury-components.css`, `styles/luxury-responsive.css`

- [ ] UI-REFINE-003-04: Action buttons visibility hierarchy
  - Increase individual action buttons (edit/delete/AI) to 44x44; add 10–12px gap
  - Keep icons 18–20px; add :hover lift and glow to improve affordance
  - Mobile: 38–40px for compact, preserving 44px effective target within cell
  - Files: `styles/luxury-components.css`, `styles/luxury-responsive.css`

- [ ] UI-REFINE-003-05: Secondary buttons size reduction (42px)
  - Apply to top-right floating-settings buttons (.settings-btn) and any btn--icon secondaries
  - Keep icon 18–20px; preserve safe-area and z-index layering
  - Files: `styles/zen-interactions.css`, `styles/luxury-responsive.css`, `index.html`

- [ ] UI-REFINE-003-06: Primary action button enhancement (64px)
  - Maintain 64px for primary floating action buttons; enhance halo/shadow using design tokens
  - Apply optional `.btn--breathing` animation utility for subtle emphasis
  - Files: `styles/zen-interactions.css`, `styles/luxury-components.css`

- [ ] UI-REFINE-003-07: Implement Zen breathing animation
  - Keyframes live in `styles/zen-interactions.css` as `zenBreath`; ensure utility `.btn--breathing` is available to opt-in
  - If we need global presence, keep off by default; apply only to the main CTA when appropriate
  - Files: `styles/zen-interactions.css`, `styles/animations.css`

- [ ] UI-REFINE-003-08: Floating settings styling (mobile/responsive) [Regression fix]
  - Restore and lock styling for top-right floating settings:
    - `.floating-settings { position: fixed; top: 20px; right: 20px; display:flex; gap:12px; z-index: var(--z-floating-settings); opacity:0.85; }`
    - `.floating-settings .settings-btn { width: 42px; height: 42px; display:grid; place-items:center; border-radius: var(--radius-md); background: var(--glass-primary); border:1px solid var(--color-border); -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur); }`
    - Hover: slight lift, border-color accent
  - Mobile: tighten to top:10px/right:10px; ensure safe-area insets; keep behind achievements and below modals/popovers per z-index tokens
  - Files: `index.html`, `styles/zen-interactions.css`, `styles/luxury-responsive.css`

- [ ] UI-REFINE-003-09: Add task “+” sign size (button in Add Task form)
  - Increase SVG icon to 32px within Add button in index.html (form submit button)
  - Ensure button minimum tap target (min-height 48px on mobile)
  - Files: `index.html`, `styles/luxury-components.css`, `styles/luxury-responsive.css`

- [ ] UI-REFINE-003-10: Floating settings rearchitecture (desktop/mobile)
  - Remove legacy floating-settings/floating-controls remnants and inline styles
  - Implement dual structures:
    - Desktop: top-right compact cluster (36px buttons): stats, settings, music, sound
    - Mobile: bottom action bar (48px buttons) with scroll hide/show
  - Unify events via data-action handlers; reuse existing toggle functions with graceful fallbacks
  - Files: `index.html`, `styles/luxury-components.css`, `styles/luxury-responsive.css`, `styles/zen-interactions.css`, `js/app.js`

- [ ] UI-REFINE-003-11: Organic interactions for floating controls
  - Desktop: refined hover (lift + subtle glow), consistent easing tokens
  - Mobile: natural tap animation (organicTap) with reduced-motion support
  - Align with app animation ethos and design tokens
  - Files: `styles/zen-interactions.css`

- [ ] UI-REFINE-003-12: Music visualizer alignment and responsiveness
  - Position visualizer relative to the music control (desktop: bottom-right of button; mobile: centered above action bar)
  - Ensure visibility and safe-area clamping; responsive sizing rules
  - Files: `index.html`, `styles/luxury-responsive.css`, `js/app.js`

## Phase 4: Premium Experience Enhancements (ID: PREMIUM-004)
- [ ] PREMIUM-004-01: Implement water ripple interactions
  - CSS-first ripple using ::after on interactive .btn/.btn--floating:
    - On pointerdown: position using click coords via CSS variables (--rx, --ry), animate scale/opacity
    - Respect `prefers-reduced-motion: reduce` to disable
  - JS hook: add/remove active classes; set CSS variables on target from event.clientX/Y
  - Files: `styles/zen-interactions.css`, `js/app.js`, `index.html`
  - Risks: mobile performance; test Safari iOS

- [ ] PREMIUM-004-02: Intelligent inactivity fade
  - Behavior: after 5s no input (mouse/touch/scroll/keys), fade non-essential chrome (floating-actions, floating-settings)
  - Restore instantly on next interaction
  - Persist user preference via settings (opt-out)
  - Files: `js/app.js`, `js/settings.js`, `styles/zen-interactions.css`, `index.html`

- [ ] PREMIUM-004-03: Theming system integration
  - Ensure design tokens apply across: floating-controls/actions, music-popover, settings panel, task items
  - Add theme-specific adjustments for glass intensity, borders, glows
  - Files: `styles/design-system.css`, `styles/luxury-components.css`, `styles/luxury-base.css`, `index.html`

- [ ] PREMIUM-004-04: Haptic feedback refinement
  - Map events: add-task (light), save (medium), delete (warning/error), achievements (success)
  - Use navigator.vibrate patterns with fallbacks; gated by settings
  - Files: `js/app.js`, `js/audio.js`

- [ ] PREMIUM-004-05: Sound design enhancements
  - Subtle UI cues on add/save/delete; adjust mixing vs. music playback
  - Respect mute/volume; debounce frequent events
  - Files: `js/audio.js`, `js/music.js`

- [ ] PREMIUM-004-06: Floating actions scroll behavior polish
  - Refine requestAnimationFrame scroll hide/show (already scaffolded in index.html inline script)
  - Migrate inline behavior into `js/app.js` for maintainability; keep CSS transitions in `styles/zen-interactions.css`
  - Files: `js/app.js`, `styles/zen-interactions.css`, `index.html`

- [ ] PREMIUM-004-07: Music popover positioning and responsiveness
  - Keep dynamic centering above music button; handle resize/orientationchange
  - Add min/max width and safe-area clamping
  - Files: `index.html`, `js/app.js`, `styles/luxury-components.css`

- [ ] PREMIUM-004-08: Centralized control event bus
  - Implement unified action handling (stats/settings/music/sound) using data-action
  - Sync visual active feedback across desktop/mobile controls
  - Files: `js/app.js`

- [ ] PREMIUM-004-09: Control sizing and motion tokens
  - Standardize tokens: --control-size-desktop:36px, --control-size-mobile:48px, timing/easing variables
  - Ensure theme integration and accessibility targets
  - Files: `styles/design-system.css`, `styles/zen-interactions.css`

## Phase 5: Validation & Optimization (ID: VALIDATION-005)
- [ ] VALIDATION-005-01: Cross-device testing (iOS/Android)
  - Devices: iPhone 13/15, Pixel 7/8; tablet iPad Pro
  - Portrait/Landscape validation of: floating-settings, floating-actions, music-popover, settings-panel scroll
  - Record device-specific quirks; screenshots before/after

- [ ] VALIDATION-005-02: Accessibility validation (WCAG 2.1 AA)
  - Tools: Lighthouse, Axe DevTools
  - Key criteria: 1.4.3 Contrast (Minimum), 2.1.1 Keyboard, 2.4.7 Focus Visible, 1.3.1 Info and Relationships
  - Screen readers: VoiceOver (iOS), TalkBack (Android)
  - Check aria-labels/roles on toolbar, buttons, modal

- [ ] VALIDATION-005-03: Cross-browser compatibility
  - Chrome, Safari, Firefox, Samsung Internet (latest stable)
  - Focus on CSS features: color-mix, backdrop-filter, -webkit-backdrop-filter, mask/-webkit-mask, conic-gradient
  - Provide graceful degradation where necessary

- [ ] VALIDATION-005-04: Performance optimization (Lighthouse >92)
  - Targets: CLS < 0.10, TBT < 100ms, FCP < 1.5s on mid device
  - Actions: minimize layout thrash, ensure animations use transform/opacity, lazy/non-critical scripts, dedupe CSS
  - Audit inline styles in index.html; move heavy blocks to CSS/JS bundles

- [ ] VALIDATION-005-05: Thumb-zone ergonomic testing
  - Validate one-handed reach for primary actions on ~6.1–6.7" screens
  - Adjust spacing/positions based on mapping

- [ ] VALIDATION-005-06: HTML structure and ARIA validation
  - Validate semantic structure and labels (toolbar, role="dialog", aria-* correctness)
  - Ensure tab order and focus traps for modal
  - Files: `index.html`

- [ ] VALIDATION-005-07: Animation performance profiling
  - Use DevTools Performance to verify animations run on compositor (transform/opacity)
  - Remove or scope heavy shadows/glass where needed on low-end devices
  - Files: `styles/animations.css`, `styles/zen-interactions.css`, `styles/luxury-components.css`

- [ ] VALIDATION-005-08: Floating settings ergonomics and parity
  - Desktop: verify top-right cluster ergonomics and parity with bottom controls
  - Mobile: thumb-zone reachability and scroll hide/show smoothness
  - Visualizer visibility across orientations and safe-area insets
  - Files: `index.html`, `styles/luxury-responsive.css`, `js/app.js`

### Implementation Sequence
1. MOBILE-ARCH-002 series (UI architecture foundation)
2. UI-REFINE-003 series (Core UI improvements)
3. PREMIUM-004 series (Enhanced interactions)
4. VALIDATION-005 series (Testing & optimization)

### Validation Plan
- **Test Devices**: iPhone 13/15, Pixel 7/8, iPad Pro
- **Browsers**: Safari, Chrome, Firefox, Samsung Internet
- **Accessibility**: WCAG 2.1 AA compliance with VoiceOver/TalkBack
- **Performance**: Lighthouse score >92, 60fps animation consistency
- **UX Validation**: Cognitive walkthroughs, thumb-zone testing
