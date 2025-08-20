# Product

## Vision
Premium, offline-friendly todo app with elegant interactions, fast performance, accessible design, and optional ambient audio.

## Core Use Cases
- Add/edit/complete tasks with optional descriptions.
- Filter: all, active, completed; clear completed; delete all with confirmation.
- Persist tasks and preferences locally; recover on reload.

## Experience
- Snappy (<100ms perceived latency); smooth micro-interactions; no jank on mobile.
- Fully functional offline; graceful degradation for optional network features.
- Accessible: keyboard reachability, ARIA, AA contrast, reduced motion support.

## Theming & Typography
- CSS variables as tokens; curated themes; immediate visual feedback.
- Fonts: Inter, Playfair, SF Pro; easy to extend.

## Audio & Music
- Subtle SFX gated by global mute.
- Optional music with play/pause/prev/next/volume and silence gaps; remember settings.

## Insights
- Lightweight achievements and stats update in near real time.

## Settings
- Single settings panel for theme, font, sound toggle + volume, utilities (reset).

## Constraints
- Static hosting (GitHub Pages). No server backend.
- LocalStorage via `storageManager`; events via `bus` and constants.

## Success Criteria
- Fast, intuitive flows; no console errors in steady state.
- State persists; destructive actions use the ModalManager.
