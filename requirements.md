requirements.md
────────────────────────────────────────
Luxury Todo – COMPLETE REQUIREMENTS  
(Updated 2025-08-01 - Includes all implemented features)

1. Core Task Management  
   • Add / toggle / edit / delete tasks
   • Auto-save / load via localStorage (keys: `luxury-todos-v1`, `luxury-todo-affirmations`, `luxury-todo-gamification`, `luxury-todo-settings`)
   • Task has a title and optional description (max 500 chars each)
   • Task should have a checkbox with a premium/luxurious/glowing like feel to mark it down
   • Inline editing with save/cancel buttons
   • Character count validation with user feedback
   • Clear completed tasks functionality
   • Delete all tasks functionality
   • We should be able to read tasks titles/descriptions

2. Enhanced Task Features
   • Task filtering (All, Active, Completed)
   • Empty state with motivational messaging
   • Task counter showing remaining tasks
   • Keyboard shortcuts (Ctrl/Cmd+N for new, Ctrl/Cmd+A for all filter, Enter/Escape for edit mode)
   • Hover effects on task items

3. Responsive Design  
   • Fluid grid 1440 → 768 → 320 px  
   • 48 px touch targets, safe-area margins, swipe gestures on mobile

4. Premium Aesthetics  
   • Glass-morphism cards with **ambient glow** matching active accent  
   • 60 fps motion curves, generous whitespace, 8-pt shadow system
   • Nebula background with optional parallax effect on device tilt
   • Grain texture overlay for premium feel
   • Use premium, professional layout
   • Use golden ratio layout

5. Theme & Palette  
   • **Settings modal** – OS-style glass window, sticky ✖ top-right, scrollable  
   • Palette strip inside Settings: Midnight, Ivory, Champagne, Graphite, Aurora, Sakura  
   • Accent glow & shadow update instantly on palette change
   • Font selection (Inter, Playfair Display, SF Pro Display)
   • Ensure the closing button has enough spacing to look professional
   • Ensure settings are stored the moment they are changed

6. Micro-interactions  
   • Micro-bounce on checkbox, save, delete  
   • Optional nebula parallax on device tilt (respects `prefers-reduced-motion`)
   • Whisper shimmer on hover  
   • Respects `prefers-reduced-motion`
   • There should be a dopamine and the user should have a good response when interacting with the application

7. Audio (premium dopamine luxurious gamified)  
   • **Default**: zero-byte Web-Audio synthesis  
   • **Fallback**: royalty-free stock links (< 20 kB each, user may swap)  
   • Volume slider inside Settings (default muted)  
   • Auto-mute when `prefers-reduced-motion`
   • When completed tasks, should have a victory sound
   • Settings, when clicking should have a very simple click and minor sound.
   • All sound should be subtle, premium, yet have some dopamine feel like. There should be a dopamine and the user should have a good response when interacting with the application

8. Gamified / Feel-Good  
   • Celebration sparkle burst on final daily completion  
   • Mood Bloom canvas particles for each finished task  
   • Affirmation card after 3 completions (6 different affirmations)
   • Karma Points (1 per task, 2 for edit) → unlock accent colors  
   • Achievement system with 5 achievements: First Steps, Task Master, Perfectionist, Zen Master, Daily Warrior
   • Daily quote in header (dynamic)
   • End-of-day glass stat card

9. Progress & Analytics
   • **Progress Panel**: Animated circular progress ring
   • Real-time statistics (total tasks, completed, karma points)
   • Daily progress tracking
   • Floating progress button with glass-morphism panel
   • Victory celebration when all daily tasks complete

10. Advanced Features
    • **Nebula Parallax**: Device tilt-based background movement
    • **PWA Support**: Installable web app with offline capability
    • **Enhanced Storage**: Multiple localStorage keys for different data types
    • **Font Switching**: 3 premium font options
    • **Task Descriptions**: Optional detailed task descriptions
    • **Validation**: Character limits and user feedback
    • **Accessibility**: Keyboard navigation and reduced motion support
11. Settings
    • The application should have a delayed 'task' or function ,that after completly loading, should load alls its settings from local storage and overwrite current settings, like theme, enable sound, etc...

────────────────────────────────────────
CODE & TOOLING

• Single repo folder `luxury-todo/`  
• External: Bulma@latest CDN, Lucide@latest CDN
• Google Fonts: Inter, Playfair Display, SF Pro Display
• Example Structure of a working POC
  ```
  luxury-todo/
  ├─ index.html
  ├─ manifest.json (PWA)
  ├─ css/
  │  ├─ design-system.css
  │  ├─ luxury-base.css
  │  ├─ luxury-components.css
  │  └─ luxury-responsive.css
  ├─ js/
  │  ├─ bus.js
  │  ├─ app.js (main controller)
  │  ├─ storage.js (enhanced storage)
  │  ├─ themes.js (themes + fonts)
  │  ├─ audio.js (audio management)
  │  ├─ animations.js (effects)
  │  ├─ gamification.js (karma + achievements)
  │  ├─ progress.js (analytics)
  │  ├─ settings.js (settings panel)
  │  ├─ quotes.js (daily quotes)
  │  ├─ affirmations.js (motivational cards)
  │  ├─ daily-summary.js
  │  ├─ swipe-gestures.js
  │  └─ nebula-parallax.js
  └─ sounds/ (fallback files)
  ```

• no es modules, classes allowed  
• Immutable state, event bus (`bus.js`)  
• Frozen `CONFIG` object (CSS classes, durations, palette hex)  
• All user text escaped via built-in escaping
• Safe localStorage wrapper (try/catch, versioned keys)
• Zero-install lint: inline ESLint comment block (`/* eslint-env browser */`)
• Iteration tracking via `iteration.md`

────────────────────────────────────────
ITERATION TRACKING FILE

File: `iteration.md` (root)  
Purpose: LLM changelog – each PR adds a new section:

```markdown
# Iteration Log

## 1. Skeleton (2025-08-02)
- Responsive glass layout, Bulma + Lucide icons
- index.html, main.css, config.js, bus.js

## 2. Core Todo (2025-08-03)
- Add, toggle, edit, delete, localStorage
- TodoStore.js, Renderer.js, index.js wiring

## 3. Settings Modal (2025-08-04)
- OS-style glass modal, sticky ✖
- Palette strip, volume slider
- SettingsModal.js, modal.css

## 4. Premium Audio (2025-08-05)
- Web-Audio synth default, stock fallback
- audio/synth.js, audio/fallback.js

## 5. Gamification System (2025-08-06)
- Karma points, achievements, celebration effects
- gamification.js, progress.js

## 6. Enhanced Features (2025-08-07)
- Progress panel with animated ring
- Affirmation cards after 3 completions
- Nebula parallax effect
- Font switching
- PWA manifest
- Keyboard shortcuts
- Enhanced storage system

## 7. Polish & QA (2025-08-08)
- Victory celebrations
- Task descriptions
- Validation
- Accessibility improvements
- zero lint warnings
```

Each commit/PR appends a concise bullet list under its iteration header.
────────────────────────────────────────

Software Engineering Approach

• Approach development and all directives with a 'Goldilocks solution' in mind
• Promote small modular, reusable components
• Promote small maintainable files that are friendly to read/edit with LLMs and by developers