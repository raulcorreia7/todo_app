# Luxury Todo — Reverse‑Engineered Product Spec

## Ethos
- Premium, calm, and delightful. Glass‑morphism visuals with soft glow accents, nebula background, and subtle grain.
- Interactions feel snappy and intentional; motion is understated and performance‑friendly.
- Accessible by default; works great on mobile and desktop.

## Top‑Level Experience
- Single‑page app with a focused tasks flow and ambient enhancements (themes, sounds, music, quotes).
- Offline‑friendly via local persistence; no server required.
- Settings panel is the single place to adjust theme, font, and audio.

## Functional Requirements
- Tasks
  - Create task with title (required) and optional description.
  - Inline edit with Save/Cancel; character counters for title/description (max ~500 chars each).
  - Toggle complete, delete task, clear completed, delete all (with confirmation modal).
  - Filters: All, Active, Completed.
  - Empty state with friendly message when no tasks.
- Insights & Motivation
  - Header shows “Luxury Todo” and a daily quote that can change on click.
  - Stats cards near top: Total, Done, Karma (simple score reflecting activity).
  - Lightweight achievements and daily summary; unobtrusive, celebratory effects on key milestones.
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
- Filters: All | Active | Completed.
- Task List: Scrollable list of cards with hover affordances, checkbox/complete, edit, save/cancel, delete.
- Empty State: Centered icon and message when no tasks.
- Center Action Bar (floating toolbar): two sub‑groups
  - System: Settings, Music, Sound (toggle with on/off icon)
  - Utilities: Test (dev helper), Clear Completed, Delete All
- Modal: Overlay + dialog container with title, description, Cancel/Confirm.
- Footer: Credits line with heart emoji and dynamic version string.

## Theming & Visual Language
- Tokens: Color, spacing, typography via CSS variables.
- Themes: Curated set of 10–15 elegant themes (e.g., Midnight, Emerald, Graphite, Aurora, Amethyst, Burgundy, Ivory, Champagne, Sakura, Pearl, Mint, Coral, Frost, Lavender, Arctic Sky). Names and exact palettes are flexible as long as contrast and mood align with “premium, calm, inspiring”.
- Effects: Soft glow accents, subtle shadows, glass translucency, optional nebula parallax; grain overlay for texture.
- Typography: Provide at least one refined sans‑serif and one refined serif option (e.g., Inter, SF Pro; Playfair). The concrete font list is open‑ended; favor legible, premium faces.

## Interaction Patterns
- Micro‑interactions: subtle, premium, and “zen” — each action should feel rewarding without being loud. Think gentle shimmer, light tactile cues, and tasteful celebratory moments.
- Keyboard: convenient shortcuts for common actions (new task, filter changes, confirm/cancel edits) while avoiding conflicts with text entry.
- Touch: comfortable targets and forgiving gestures that feel natural on mobile.
- Motion: restrained and calming; animations should enhance clarity and never distract. Respect reduced‑motion preferences.

## Design & Behavior Directives (consolidated)
- Visual language
  - Glass‑morphism surfaces (translucent layers, soft borders) with restrained glow accents informed by the active theme.
  - Gentle depth (diffused shadows), generous negative space, and harmonious palettes.
- Typography
  - Clear hierarchy and comfortable reading rhythm. Font changes should feel smooth and non‑jarring.
- Iconography
  - Consistent, minimal, and meaningful.
- Micro‑interactions
  - Interactions should feel rewarding and “dopamine‑positive” yet understated — a brief moment of delight, then out of the way.
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
  - Task cues: add, complete, edit, delete (brief, premium notifications).
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

## Accessibility
- Clear focus indicators and keyboard reachability for all interactive elements.
- ARIA‑labeled modal dialog with focus trap; ESC closes (unless unsafe).
- Color contrast meets AA; theme palettes chosen for legibility.

## Performance
- Interactions should feel instant and smooth, with no jank or stalls.
- Visual effects remain tasteful and light so the experience stays fluid on common mobile hardware.

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
