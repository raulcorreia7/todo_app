# Repository Guidelines

## Project Structure & Module Organization
- Root: `index.html`, `manifest.json`, `README.md`.
- Code: `js/` (vanilla modules like `app.js`, `settings.js`), `styles/` (theme system, components, responsive), `styles/theme-system.css` defines CSS variables.
- Assets: `sounds/`, `resources/`, `video/`.
- Docs: `docs/` (architecture, technical notes), `specs/` (product/spec notes), `archive/` (old iterations).
- Scripts: `scripts/update-version.js` (bumps version and `commit-count.txt`).
- CI/CD: `.github/workflows/static.yml` deploys the repo to GitHub Pages.

## Build, Test, and Development Commands
- `npm install`: install local server dependency (`serve`).
- `npm run dev` (or `npm start`): start static server on `http://localhost:8080` serving the repo root.
- `npm run version`: update `package.json`, `manifest.json`, and `commit-count.txt` based on `git rev-list --count HEAD`.

## Coding Style & Naming Conventions
- Formatting: Prettier with 2 spaces, semicolons, double quotes, trailing commas where valid.
  - Run: `npx prettier . --write`.
- JavaScript: ES modules and plain classes (e.g., `class TodoApp`); files use kebab-case (`center-bar.js`).
- CSS: kebab-case class/filename style; prefer CSS variables from `theme-system.css` (e.g., `--color-text`).
- HTML: keep `index.html` lean; wire only required scripts/styles.

## Testing Guidelines
- No automated tests in this repo; validate via manual QA:
  - Launch with `npm run dev`, exercise core flows (add/edit/complete tasks), check console for errors.
  - Verify theme, audio, and animations; run a quick Lighthouse pass where helpful.
- Keep changes isolated and reversible; avoid regressions in `js/app.js` init and event wiring.

## Commit & Pull Request Guidelines
- Commits: concise, imperative, and typed when practical (e.g., `feature: add AI edit`, `fix: prevent null task title`).
- PRs: clear description of scope, steps to validate, and before/after notes or screenshots for UI changes.
  - Link related issues; avoid bundling unrelated changes.

## Security & Configuration Tips
- Do not commit secrets. AI integration lives in `js/ai-providers.js`; keep keys out of source and document how to inject locally.
- Preserve static hosting assumptions for GitHub Pages (paths relative to root; no server-side code).
