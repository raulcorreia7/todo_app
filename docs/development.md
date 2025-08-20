# Development

## Prerequisites
- Node.js 16+ (engines: >=14 works; 16+ recommended)

## Scripts
- `npm run dev`: start static server at `http://localhost:8080`
- `npm start`: same as `dev`
- `npm run version`: sync version across package.json, manifest.json, and `commit-count.txt`

## Conventions
- Event and storage keys: use `window.App.EVENTS` and `window.App.KEYS` from `js/constants.js`.
- Prefer bus events over direct DOM wiring for cross-module actions.
- Keep large file edits focused; avoid drive‑by refactors unrelated to the change.

## Manual QA
- Launch `npm run dev`, open the app, check console for errors.
- Exercise: add/edit/complete tasks; theme and font switch; toggle sound and adjust volume; open music popover.
- Verify state persists on reload (tasks, settings, music volume/mute).

## Notes
- App is a static site deployed via GitHub Pages.
- Optional external services (e.g., AI) should fail gracefully without blocking the UI.
