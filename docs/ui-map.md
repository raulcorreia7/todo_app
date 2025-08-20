# UI Map (High Level)

- Header: app title, daily quote (clickable to cycle).
- Add Task: title input, optional description textarea, live char counters, add button.
- Stats: three compact cards — Total, Done, Karma.
- Filters: All | Active | Completed.
- Task List: cards with checkbox/complete, edit (inline), save/cancel, delete; empty state when none.
- Center Action Bar: floating toolbar
  - Group 1: Settings, Music, Sound (global mute)
  - Group 2: Test (dev), Clear Completed, Delete All
- Modal: overlay + dialog with title, description, Cancel/Confirm.
- Settings Panel (floating): sections for Font, Sound (toggle + volume), Utilities (Reset), Theme selector grid, Achievements grid.
- Music Player (popover): Play/Pause, Prev/Next, Volume, optional Pin, metadata (track name/index/duration), subtle visualizer, buffering indicator.
- Footer: credits with heart emoji and dynamic version string.

States to cover
- Empty vs. populated list; editing mode; validation messages.
- Settings open/closed; theme and font changes live.
- Music playing/paused/buffering; pinned/unpinned popover.
- Achievements: locked/unlocked/complete; subtle unlock cue.
