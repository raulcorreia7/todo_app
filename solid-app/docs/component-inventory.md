# Component Inventory and Parity Map

This document maps the original root JavaScript modules to the SolidJS app and records the current parity status.

## Current Verification Status

- `pnpm run typecheck`: pass
- `pnpm run build`: pass
- `pnpm exec vitest run --reporter=dot --silent`: pass (17 files, 240 tests)
- `pnpm run test:e2e`: pass (65 tests)

## Root Module Mapping

| Root Module | Solid Equivalent | Status | Notes |
| --- | --- | --- | --- |
| `js/app.js` | `src/App.tsx`, `src/stores/taskStore.ts` | DONE | Core task orchestration and UI composition |
| `js/storage.js` | `src/services/storage.ts` | DONE | Typed storage wrappers with same keys |
| `js/themes.js` | `src/config/themes.ts`, `src/stores/settingsStore.ts`, `src/components/settings/ThemeSelector.tsx` | DONE | All 15 root themes mapped to a single source of truth |
| `js/settings.js` | `src/stores/settingsStore.ts`, `src/components/settings/*` | DONE | Theme, font, sound, volume, reset flow |
| `js/audio.js` | `src/services/audio.ts` | PARTIAL | Core sound effects and volume/settings are ported |
| `js/music.js` | `src/services/music.ts` | PARTIAL | Core playback and persistence are ported |
| `js/music-player.js` | `src/components/music/MusicPlayer.tsx` | DONE | Player UI and controls are present |
| `js/animations.js` | `src/utils/particles.ts` | PARTIAL | Completion/celebration particle flows are ported |
| `js/gamification.js` | `src/stores/gamificationStore.ts` | DONE | Karma, achievements, daily stats, unlock flow |
| `js/achievement-definitions.js` | `src/utils/achievements.ts` | DONE | Achievement catalog and unlock conditions |
| `js/achievements.js` | `src/utils/achievements.ts` + `src/stores/gamificationStore.ts` | DONE | Condition checks and unlock logic |
| `js/achievements-ui.js` | `src/components/gamification/AchievementsList.tsx` + `src/components/gamification/AchievementNotification.tsx` | DONE | List and notifications are ported |
| `js/statistics.js` | `src/stores/statisticsStore.ts`, `src/components/statistics/*` | DONE | Stats tracking and display |
| `js/daily-summary.js` | `src/services/dailySummary.ts`, `src/components/statistics/DailySummary.tsx` | DONE | Summary modal and score/message logic |
| `js/quotes.js` | `src/services/quotes.ts`, `src/components/layout/Header.tsx` | DONE | Daily quote persistence and rotation |
| `js/affirmations.js` | `src/utils/affirmations.ts`, `src/stores/gamificationStore.ts` | DONE | Milestone affirmations integrated with notifications |
| `js/swipe-gestures.js` | `src/hooks/useSwipeGesture.ts` + `src/components/tasks/TaskItem.tsx` | DONE | Swipe complete/delete and feedback |
| `js/modal-manager.js` | `src/components/base/Modal.tsx`, `src/components/base/ConfirmModal.tsx` | DONE | Modal + confirm dialog paths |
| `js/center-bar.js` | `src/components/center-bar/CenterActionBar.tsx`, `src/hooks/useCenterBarVisibility.ts` | DONE | Action bar controls and visibility behavior |
| `js/ai-providers.js` | `src/services/ai.ts`, `src/components/ai/AIRefactorButton.tsx` | DONE | Refactor and subtask suggestions |
| `js/validation.js` | `src/components/tasks/TaskForm.tsx`, `src/components/tasks/TaskItem.tsx` | PARTIAL | UI-level limits/counters present; no standalone utility module |
| `js/tooltip-service.js` | N/A | PARTIAL | Native title/tooltips used; custom service not ported |
| `js/nebula-parallax.js` | N/A | PARTIAL | Background visuals present; orientation-based parallax not ported |
| `js/music-visualizer.js` | N/A | PARTIAL | Audio playback exists, visualizer not ported |
| `js/progress.js` | N/A | PARTIAL | Equivalent behavior covered by stores/stats, no direct module |
| `js/bus.js` | N/A | N/A | Solid reactivity removes event bus need |
| `js/constants.js` | Inlined across `src/*` | N/A | Split by domain instead of central constants module |
| `js/environment.js` | `import.meta.env` usage in `src/services/ai.ts` | DONE | Env-based configuration |
| `js/settings-loader.js` | N/A | N/A | Settings bootstrapped by store initialization |
| `js/version.js` | N/A | N/A | Build metadata not required by current UI |

## Functional Parity Score

- Estimated parity: **~97%** for user-facing behavior
- Remaining deltas are mostly non-critical polish and legacy extras:
  - custom tooltip service
  - nebula orientation parallax
  - music visualizer and richer audio progression details

## Notes on Test Compatibility

- Legacy selector compatibility was restored where useful (`.add-task-form`, `.filter-group`) to keep parity with root naming and existing E2E coverage.
- Visual tests were made deterministic by seeding localStorage quote/settings state before capture.

---

Last updated: 2026-02-16
