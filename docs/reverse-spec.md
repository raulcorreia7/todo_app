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
- Micro‑interactions: gentle hover shimmer, subtle press scale, checkbox bounce, celebratory bursts on notable events.
- Keyboard: Cmd/Ctrl+N focuses new task; Cmd/Ctrl+A sets “All” filter; Enter/Escape confirm/cancel editing in appropriate contexts.
- Touch: 48px targets; passive listeners for scrolling/gestures; mobile‑friendly popovers.
- Motion: Prefer transform/opacity; honor prefers‑reduced‑motion.

## Design & Behavior Directives (consolidated)
- Visual language
  - Glass‑morphism surfaces (translucent backgrounds, backdrop‑blur, soft borders).
  - Glowing accents tied to the active theme; restrained, tasteful intensity.
  - Subtle, diffused shadows; generous negative space; harmonious palettes.
- Typography
  - Clear hierarchy (size/weight/spacing); smooth font transitions where used.
- Iconography
  - Consistent set (e.g., Lucide); simple, meaningful metaphors.
- Micro‑interactions (typical ranges; adapt per component)
  - Hover: scale(1.02–1.05), glow lift, or gentle color shift.
  - Active: press scale(0.95–0.98) with quick rebound.
  - Focus: visible outline/glow on keyboard navigation.
  - Selection: subtle pulse to confirm state change.
- Animation principles
  - Easing: natural curves (e.g., cubic‑bezier(0.4, 0, 0.2, 1)).
  - Performance: animate transform/opacity; avoid expensive paints.
  - Purposeful: motion guides attention; avoid decorative noise.
- Audio design
  - Subtle, “dopamine‑positive” feedback; never blocks interaction.
  - Examples: theme change chime; font change whoosh; soft button blip; task complete “golden” chime; delete “velvet swipe”; gentle volume tick.
  - Technical: Web Audio or tiny assets; single global mute; respects reduced motion preference.
- Component notes
  - Settings Panel: glass window with sticky header, clear close affordance; immediate apply; scrollable content.
  - Task List: premium checkbox feedback, inline edit with Save/Cancel, character counters, hover affordances.
  - General UI: consistent glass buttons, subtle hover shimmer, accessible focus.
  - Modals: theme‑adaptive glow; danger states use theme‑appropriate “danger” accents (no hardcoded red); ARIA complete.
- Responsiveness & a11y
  - Mobile‑first, fluid layout; touch targets ≥48px; adaptive spacing.
  - Keyboard navigation everywhere; ARIA labels/roles; WCAG AA contrast.
  - Respect prefers‑reduced‑motion.
- Performance & quality
  - Fast load, responsive interactions (<100ms perceived), 60fps animations on modern devices; cross‑browser.

## Behavior & Persistence
- Persist across reloads: tasks, settings (theme, font, sound enabled, volume), simple stats/karma, achievements state, last music track/volume where applicable.
- Immediate feedback on settings changes; no full reload required.
- Music hint: if playback requires user gesture, surface a gentle visual nudge on the music button.

## Accessibility
- Clear focus indicators and keyboard reachability for all interactive elements.
- ARIA‑labeled modal dialog with focus trap; ESC closes (unless unsafe).
- Color contrast meets AA; theme palettes chosen for legibility.

## Performance
- Target instant interactions (<100ms perceived), 60fps animations on modern mobile.
- Avoid heavy paints; limit blur and large shadows; use GPU‑friendly properties.

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
