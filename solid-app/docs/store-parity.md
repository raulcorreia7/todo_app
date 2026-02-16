# Store and Service Parity

This file tracks behavioral parity between the root JavaScript implementation and the SolidJS stores/services.

## Verification Snapshot

- Typecheck: pass
- Build: pass
- Unit tests: pass (240)
- E2E tests: pass (65)

## Store Parity

### `taskStore`

Status: **High parity**

- Ported behavior:
  - add, edit, delete, complete/uncomplete
  - all/active/completed filtering
  - clear completed and clear all
  - persisted task list (`luxury-todos-v2`)
  - new/completion animation flags used by UI
- Differences:
  - root haptic feedback utility is not ported as a dedicated module

### `settingsStore`

Status: **High parity**

- Ported behavior:
  - theme/font/sound/volume/animations state
  - settings persistence (`luxury-todo-settings-v2`)
  - reset to defaults
  - runtime theme CSS variable application
  - theme tone metadata (`data-theme-tone`)
- Fixes applied in this cycle:
  - reset to defaults now reliably restores theme/sound/volume/font
  - default settings are cloned on load to avoid mutation side effects

### `gamificationStore`

Status: **High parity**

- Ported behavior:
  - karma points
  - achievement unlocks and persistence
  - daily stats and daily reset handling
  - task create/edit/delete/completion tracking
  - AI edit tracking
  - affirmation milestone integration
- Differences:
  - legacy queueing and some celebration effects are simplified

### `statisticsStore`

Status: **High parity**

- Ported behavior:
  - total/completed task counts
  - streak and completion metrics
  - persistence and reset flows

### `uiStore`

Status: **Complete for current UI architecture**

- Handles open/close state for settings, achievements, music, and daily summary panels.

## Service Parity

### `storage`

Status: **High parity**

- Typed wrappers for tasks/settings/gamification/statistics keys.
- Matches root storage keys used by migration and persistence tests.

### `audio`

Status: **Partial parity**

- Ported: core sounds, enable/disable, volume wiring.
- Not fully ported: richer pitch progression and legacy advanced sound variants.

### `music`

Status: **Partial parity**

- Ported: core transport controls and persisted player state.
- Not fully ported: visualizer and some advanced gap/mute orchestration features.

### `ai`

Status: **High parity**

- Ported: refactor endpoint flow, JSON parsing, and subtask suggestions.

### `quotes`

Status: **Complete**

- Daily quote persistence and rotation are ported and wired into header UI.

### `dailySummary`

Status: **Complete**

- Daily summary trigger logic and modal display are ported.

## Overall Assessment

- Functional parity for user-facing behavior is **~97%**.
- Remaining differences are mostly polish/advanced effects, not core task flows.

---

Last updated: 2026-02-16
