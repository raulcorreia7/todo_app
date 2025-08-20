# Luxury Todo — Reverse‑Engineered Product Spec

## Ethos
- Premium, calm, and delightful. Glass‑morphism visuals with soft glow accents, nebula background, and subtle grain.
- Interactions feel snappy and intentional; motion is understated and performance‑friendly.
- Accessible by default; works great on mobile and desktop.

## Top‑Level Experience
- Single‑page app with a focused tasks flow and ambient enhancements (themes, sounds, music, quotes).
- Offline‑friendly via local persistence; no server required.
- Settings panel is the single place to adjust theme, font, and audio.

## Sensible Defaults & Additions
- Task ordering: natural (newest on top or last added) with simple, predictable behavior; manual reorder is optional and can remain out of scope.
- Quick search: lightweight filter-as-you-type for task titles/descriptions (optional but recommended).
- Import/Export: simple JSON export/import for tasks and preferences to allow manual backup/restore.
- Privacy: local‑only by default — no tracking, no data leaves the device; any future integrations must be explicit and opt‑in.
- PWA (optional): installable experience with offline cache for core assets; respects the same local‑only data policy.
- Haptics (optional): subtle, device‑appropriate haptic taps for key confirmations where supported and enabled.
- Onboarding hints: gentle first‑run affordances (e.g., highlight settings/music availability) that disappear quickly.
- Extensibility: event‑bus friendly; future features can hook into well‑named events without reshaping core flows.
  - Modules can listen for a global “app ready” signal to coordinate deferred work.

## Functional Requirements
- Tasks
  - Create task with title (required) and optional description.
  - Inline edit with Save/Cancel; character counters for title/description (max ~500 chars each).
  - Toggle complete, delete task, clear completed, delete all (with confirmation modal).
  - Filters: All, Active, Completed.
  - Empty state with friendly message when no tasks.
  - Edit with AI: optional refinement of title/description with preview; preserves meaning, removes noise, and lets the user accept/cancel changes.
- Insights & Motivation
  - Header shows “Luxury Todo” and a daily quote that can change on click.
  - Stats cards near top: Total, Done, Karma (simple score reflecting activity).
  - Achievements and daily summary; unobtrusive, celebratory effects on key milestones.
- Audio & Music
  - UI sound effects (subtle, premium, optional) governed by a global sound toggle.
  - Ambient music player: play/pause, prev/next, volume slider; buffering indicator; gentle fades; occasional short “silence gaps” between tracks for breathing.
  - Global sound toggle mutes all audio without pausing music playback.
- Settings
  - Single floating panel with sections: Font (Inter, Playfair, SF), Sound (toggle + volume slider), Utilities (Reset to defaults), Theme selector (grid of curated themes).
  - Applies immediately and persists; respects reduced‑motion preferences.
- Modals
  - App modal (glass, glow) for destructive confirmations; keyboard and screen‑reader friendly.

## Information Architecture & Layout
- Header: App title + daily quote.
- Add Task: Title input (placeholder), optional description textarea, live character counter.
- Stats: Three compact cards (Total, Done, Karma) with simple iconography.
 - Optional Progress view: a lightweight readout/panel summarizing daily/overall momentum without clutter.
- Filters: All | Active | Completed.
- Task List: Scrollable list of cards with hover affordances, checkbox/complete, edit, save/cancel, delete.
- Empty State: Centered icon and message when no tasks.
- Center Action Bar (floating toolbar): two sub‑groups
  - System: Settings, Music, Sound (toggle with on/off icon)
  - Utilities: Test (dev helper), Clear Completed, Delete All
- Modal: Overlay + dialog container with title, description, Cancel/Confirm.
- Footer: Credits line with heart emoji and dynamic version string.

## Data & Privacy
- Persistence via on‑device storage; no background sync by default.
- Export/import as human‑readable JSON; user‑initiated only.
- Clear “Reset to defaults” path that wipes local data and restores sensible defaults.
- Any external content (e.g., streaming tracks) should be declarative/configurable and not store personal data.

## Achievements & Gamification (Behavioral Spec)
- Spirit: celebrate mindful progress with subtle, zen‑toned rewards; avoid distraction.
- Signals tracked (illustrative): karma points; daily completed and edited counts; “all created today completed”; first task created/edited/deleted; AI edit count; AI words refined.
- Examples (non‑exhaustive): Mindful Beginning (1 karma), Gentle Progress (5/day), Mindful Refinement (3/day), Peaceful Presence (25 karma), Daily Harmony (all created today complete), First Creation/Refinement/Release, AI Editor Bronze/Silver/Gold (1/5/20), Luminous Expression (≥50 words refined).
- Display: achievements appear in Settings as cards with progress bars and subtle unlocked/complete badges; desktop hover shows condition and last‑unlocked.
- Feedback: unlocking provides a brief visual cue and a premium, gentle audio hint; progress updates animate subtly.
- Integration: updates respond to task actions and accepted AI edits; daily summary reflects completions.

## Theming & Visual Language
- Tokens: Color, spacing, typography via CSS variables.
- Themes: Curated set of 10–15 elegant themes (e.g., Midnight, Emerald, Graphite, Aurora, Amethyst, Burgundy, Ivory, Champagne, Sakura, Pearl, Mint, Coral, Frost, Lavender, Arctic Sky). Names and exact palettes are flexible as long as contrast and mood align with “premium, calm, inspiring”.
- Effects: Soft glow accents, subtle shadows, glass translucency, optional nebula parallax; grain overlay for texture.
- Typography: Provide at least one refined sans‑serif and one refined serif option (e.g., Inter, SF Pro; Playfair). The concrete font list is open‑ended; favor legible, premium faces.

## Interaction Patterns
- Micro‑interactions: subtle, premium, and “zen” — each action should feel rewarding without being loud. Think gentle shimmer, light tactile cues, and tasteful celebratory moments.
- Keyboard: convenient shortcuts for common actions (new task, filter changes, confirm/cancel edits) while avoiding conflicts with text entry.
- Touch: comfortable targets and forgiving gestures that feel natural on mobile.
 - Optional swipe gestures on mobile for convenience (e.g., reveal actions); provide accessible alternatives.
- Motion: restrained and calming; animations should enhance clarity and never distract. Respect reduced‑motion preferences.

## Design & Behavior Directives (consolidated)
- Visual language
  - Glass‑morphism surfaces (translucent layers, soft borders) with restrained glow accents informed by the active theme.
  - Gentle depth (diffused shadows), generous negative space, and harmonious palettes.
- Typography
  - Clear hierarchy and comfortable reading rhythm. Font changes should feel smooth and non‑jarring.
- Iconography
  - Consistent, minimal, and meaningful; use one icon set across toolbar/cards for cohesion.
- Micro‑interactions
  - Interactions should feel rewarding and “dopamine‑positive” yet understated — a brief moment of delight, then out of the way.
  - Task actions (add, edit, complete, delete) are first‑class and receive a higher‑grade feedback package (visual + audio + optional haptic) compared to secondary actions.
  - Focus states are unmistakable but elegant; selection confirms subtly.
- Animation
  - Calming, supportive motion only. The goal is clarity and polish, not spectacle.
- Audio design
  - Subtle cues that complement visuals (e.g., gentle chime or soft click); never intrusive and always optional.
  - One global sound control; respects user sensitivity (e.g., reduced motion/audio contexts).
- Component notes
  - Settings Panel: premium, focused, easy to dismiss; changes apply immediately.
  - Task List: luxurious checkbox feel, inline edits with clear Save/Cancel, visible character guidance.
  - Modals: theme‑aware glow for destructive actions; accessible structure and behavior.
  - Achievements: Settings > Achievements displays elegant cards with title, description, progress %, and unlocked/complete state; desktop hover shows a minimal popover with condition and last‑unlocked time.
  - Tooltips (desktop): minimal, non‑blocking hints where helpful (e.g., achievements), disabled on touch contexts.
- Responsiveness & a11y
  - Mobile‑first fluidity, generous touch targets, and adaptable spacing.
  - Keyboard navigation throughout; semantic roles/labels; sufficient contrast.
- Quality bar
  - Feels instant, smooth, and dependable across modern devices and browsers.

## Behavior & Persistence
- Persist across reloads: tasks, settings (theme, font, sound enabled, volume), simple stats/karma, achievements state, last music track/volume where applicable.
- Immediate feedback on settings changes; no full reload required.
- Music hint: if playback requires user gesture, surface a gentle visual nudge on the music button.

## Audio & Music — Behavioral Spec (high level)
- Global semantics
  - One global sound toggle governs all SFX and music output; muting does not pause music playback.
  - Volume changes feel smooth and subtle across the whole app.
- Sound categories (illustrative; exact palette open‑ended)
  - Task cues: add, complete, edit, delete — brief but premium; primary actions are layered slightly richer than secondary cues.
  - UX cues: settings tap/open, theme change, progress open, font change, volume adjust, sound toggle.
  - Celebrations: soft victory/reward moments on meaningful milestones.
- Anti‑fatigue tonal design
  - Task cues vary pitch within a pleasant, consonant family (e.g., pentatonic‑like) to keep repetition fresh.
  - Each task category progresses through a short sequence of variations; after a small run, a lightweight “reward” flourish may play, then the sequence resets.
  - Non‑task cues apply mild randomization around a base tone to avoid monotony without attracting attention.
- Experience goals
  - Cues are dopamine‑positive but understated; they complement visual polish and are fully optional.
  - Brief envelopes and gentle fades; never compete with interaction speed.
  - Respect user sensitivity and system preferences.

## Music Player & Visualizer — Behavioral Spec
- Purpose and feel
  - A minimal, premium player that complements the app — subtle, calm, and rewarding to use.
  - Micro‑rewards on interactions (e.g., a brief visual lift on play/pause or next/prev) while staying understated.
- Player controls & UI
  - Play/Pause, Previous, Next, Volume slider; optional Pin to keep the popover open.
  - Clear state: playing, paused, buffering. Controls remain responsive during buffering.
  - Small visual feedback on control taps; no flashy transitions.
  - Anchors to the center action bar; positions sensibly on mobile and desktop.
- Streaming & sources
  - Accepts external track URLs (e.g., CDN/cloud); streams progressively.
  - Gracefully handles network conditions and errors; never blocks the UI.
  - Track list is configurable and can be extended without code changes to the app’s core.
- Metadata & display
  - Shows current track name (friendly title), index/total, and duration/current time when metadata is available.
  - If duration isn’t known, the UI degrades gracefully (e.g., omits or shows an unobtrusive placeholder).
- Playback behavior
  - Gentle fades on start/stop/track switches; brief, occasional silence gaps between tracks for breathing room.
  - No hard cuts or pops; state transitions feel smooth and premium.
  - Respects the global sound toggle (mute silences player output but does not pause playback).
- Visualizer
  - Minimal “luxury” visualizer that reacts to music in a tasteful, non‑distracting way (e.g., simple bars or subtle glow).
  - Designed to work well even at low amplitudes and with ambient tracks.
- Persistence
  - Remembers last track index and volume across sessions.
  - Does not auto‑start without a user gesture where required; may hint gently that music is available.
  - Accessibility & performance
  - Keyboard reachable; clear labels; no reliance on color alone for state.
  - Lightweight visuals and animations; remains fluid on common mobile hardware.

## Accessibility
- Clear focus indicators and keyboard reachability for all interactive elements.
- ARIA‑labeled modal dialog with focus trap; ESC closes (unless unsafe).
- Color contrast meets AA; theme palettes chosen for legibility.

## Resilience & Error Handling
- UI remains responsive under poor network conditions; streaming and quote fetches fail gracefully with neutral states.
- Recoverable actions (e.g., delete all) always confirm through the app modal.
- Missing metadata (e.g., track duration) degrades gracefully.

## Performance
- Interactions should feel instant and smooth, with no jank or stalls.
- Visual effects remain tasteful and light so the experience stays fluid on common mobile hardware.

## Energy & Background Behavior
- Animations should be appealing yet frugal; favor approaches that keep devices cool and battery usage low.
- When the app is not visible (e.g., tabbed out or in the background), suspend non‑essential dynamic effects (parallax, heavy visualizers, continuous animations) and resume gracefully on return.
- Keep essential state updates intact while visuals are paused; the UI should pick up seamlessly when the app regains focus.

## Non‑Goals (For Now)
- Accounts, sync, or multi‑device state.
- Complex analytics; keep insights lightweight and local.

## Acceptance Criteria
- Core flows (add/edit/complete/delete, filters) work flawlessly on mobile and desktop.
- Settings apply instantly and persist; audio toggle affects all sounds; volume adjusts both SFX and music.
- Theming and typography changes are immediate and consistent across UI.
- Modals replace native confirms for destructive actions and are accessible.
- No uncaught errors in steady state; graceful behavior without network access.

## Prompting Guidance (for regeneration)
- Build a premium, single‑page todo app matching the IA and behaviors above.
- Use a theme‑token system (CSS variables) with the curated palette; implement glass‑morphism and soft glows tastefully.
- Implement a floating center action bar with grouped controls (Settings, Music, Sound; Test, Clear, Delete).
- Provide a settings panel that controls theme, font, sound toggle, volume, and reset; all persistent.
- Add ambient music controls with gentle fades and occasional short silence gaps; global sound toggle mutes all audio.
- Include daily quote, stats, achievements, and subtle celebratory effects; keep them optional and non‑intrusive.
- Ensure accessibility, mobile ergonomics, and performance budgets are respected.

## Open‑Ended Parameters
- Fonts: Provide a small, high‑quality set of at least two families (one serif, one sans‑serif). Exact families are flexible as long as they feel premium and legible.
- Themes: Provide a curated set of 10–15 themes. Exact names and palettes are flexible; ensure strong contrast, harmonious accents, and a calm/luxury mood.

## Prompt‑Ready Spec

- Ethos: Premium, luxurious, subtle, zen. Rewarding micro‑interactions that feel “dopamine‑positive” but never loud or flashy.
- Scope: Single‑page, offline‑friendly todo app. No server. Fast and accessible on mobile/desktop.

- Tasks: Add/edit/complete/delete with optional description. Inline edit with Save/Cancel and character counters. Filters: All/Active/Completed. Clear completed and Delete all with confirm. Friendly empty state.
- Insights: Daily quote in header; compact stat cards (Total, Done, simple “Karma”). Lightweight achievements and celebratory moments — optional and unobtrusive.
- Settings: Single floating panel to change theme, font, sound toggle, and volume; Utilities include Reset to defaults. Changes apply instantly and persist.
- Theming & Fonts: Token‑based (CSS variables). Provide a curated set of elegant themes (10–15) and at least one serif and one sans‑serif font. Names/palettes/families are flexible; ensure high contrast and premium mood.
- Center Action Bar: Floating toolbar with two groups: Settings, Music, Sound (global mute); Test, Clear Completed, Delete All.
- Modal: Glass, theme‑aware glow; accessible (dialog semantics, ESC, focus management).

- Audio SFX: Subtle, optional cues. Task actions (add/complete/edit/delete) vary within a pleasant, consonant family to avoid fatigue; short progression may end with a light “reward” flourish. Non‑task cues (settings, theme, font, volume, toggle, progress) use mild variation around base tones. One global sound control mutes all audio (does not pause music).

- Music Player: Minimal, premium UI with Play/Pause, Prev/Next, Volume, optional Pin. Streams external track URLs; handles buffering/errors gracefully. Displays current track name, index/total, and duration/current time when available. Gentle fades on start/stop/switch; occasional brief silence gaps. Subtle, non‑distracting visualizer. Remembers last track and volume. No auto‑start; may hint gently after user gesture.

- Accessibility & Performance: Keyboard reachable, clear labels, AA contrast, honors reduced motion. Interactions feel instant and smooth; visuals stay tasteful and light.
## Task Action Rewards (Godly‑Feeling, High‑Priority Feedback)
- Philosophy
  - All task actions are main actions and should feel special: premium, luxurious, subtle — a brief sense of “godly” satisfaction without breaking the zen tone.
- Add Task
  - Elevated feedback bundle combining a refined visual accent (e.g., soft aura/shine), a premium cue sound, and optional light haptic where available.
  - Immediate list update with a smooth entrance for the new task; stats and achievements reflect the change promptly.
- Edit (including “Edit with AI”)
  - AI refinement presents a clear preview; acceptance provides a slightly richer feedback moment than a standard edit to honor the successful assist.
  - Changes integrate seamlessly into the list; counters and karma update as appropriate.
- Complete/Delete
  - Completion delivers a satisfying, composed confirmation; delete conveys closure without harshness.
  - Bulk actions (clear completed, delete all) are confirmed via modal and retain a calm, respectful tone.
