# Architecture

## Overview
- Static web app served at `index.html`.
- Modules in `js/` communicate via a global EventBus (`js/bus.js`).
- Persistence via `storageManager` (`js/storage.js`) using localStorage.
- Event and storage keys centralized in `js/constants.js` (`window.App`).

## Load Order (index.html)
1) `js/environment.js` — feature flags/config
2) `js/constants.js` — event and key names
3) Core: `js/bus.js`, `js/storage.js`, `js/themes.js`
4) Audio/Music: `js/audio.js`, `js/music.js`, `js/music-player.js`
5) Utilities: `js/animations.js`, `js/statistics.js`, `js/gamification.js`
6) Modals/Settings: `js/modal-manager.js`, `js/settings.js`, `js/settings-loader.js`
7) Content: `js/quotes.js`, `js/affirmations.js`, `js/daily-summary.js`
8) UI helpers: `js/swipe-gestures.js`, `js/nebula-parallax.js`
9) App controller: `js/app.js`

## Key Modules
- App (`js/app.js`): bootstraps UI, wires actions, renders task list, dispatches `app:ready`.
- Settings (`js/settings.js`): theme, font, sound toggle, volume; dispatches `settingsChanged`.
- Themes (`js/themes.js`): applies CSS variables and theme classes.
- Audio (`js/audio.js`) & Music (`js/music.js` + `js/music-player.js`): SFX and ambient music with transport and fades.
- Storage (`js/storage.js`): tasks, settings, stats, achievements, with defaults and versioning.
- Modal (`js/modal-manager.js`): confirm flows for destructive actions.

## Events
- Centralized in `App.EVENTS`; see `docs/events.md` for details and payloads.

## Styles
- Entry: `styles/main.css` imports tokens and layers.
- Tokens: `styles/theme-system.css` defines color/space/typography.
- Large aggregates: `styles/components.css`, `modals.css`, `interactions.css`, etc.
- Guidance for cleanup and scoping lives in `docs/ui-css.md`.
