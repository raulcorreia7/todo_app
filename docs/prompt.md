# Prompt‑Ready Spec

- Ethos: Premium, luxurious, subtle, zen. Rewarding micro‑interactions that feel “dopamine‑positive” but never loud or flashy.
- Scope: Single‑page, offline‑friendly todo app. No server. Fast and accessible on mobile/desktop.

- Tasks: Add/edit/complete/delete with optional description. Inline edit with Save/Cancel and character counters. Filters: All/Active/Completed. Clear completed and Delete all with confirm. Friendly empty state. “Edit with AI” offers a preview and accept/cancel, preserving meaning while removing noise.
- Insights: Daily quote in header; compact stat cards (Total, Done, simple “Karma”). Achievements and celebratory moments — optional and unobtrusive.
- Settings: One floating panel for theme, font, sound toggle, volume; Utilities include Reset to defaults. Changes apply instantly and persist.
- Theming & Fonts: Token‑based (CSS variables). Provide a curated set of elegant themes (10–15) and at least one serif and one sans‑serif font. Names/palettes/families are flexible; ensure high contrast and premium mood.
- Center Action Bar: Floating toolbar with two groups: Settings, Music, Sound (global mute); Test, Clear Completed, Delete All.
- Modal: Glass, theme‑aware glow; accessible (dialog semantics, ESC, focus management).

- Audio SFX: Subtle, optional cues. Task actions (add/complete/edit/delete) vary within a pleasant, consonant family to avoid fatigue; short progression may end with a light “reward”. Non‑task cues (settings, theme, font, volume, toggle, progress) use mild variation around base tones. One global sound control mutes all audio (does not pause music).

- Music Player: Minimal, premium UI with Play/Pause, Prev/Next, Volume, optional Pin. Streams external track URLs; handles buffering/errors gracefully. Shows track name, index/total, duration/current time when available. Gentle fades; occasional brief silence gaps. Subtle visualizer. Remembers last track and volume. No auto‑start; may hint gently after user gesture.

- Accessibility & Performance: Keyboard reachable, clear labels, AA contrast, honors reduced motion. Interactions feel instant and smooth; visuals stay tasteful and light. Suspend non‑essential animations when the tab is hidden; resume gracefully.
