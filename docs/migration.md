# Migration (React + TypeScript)

A phased plan to evolve this vanilla JS app to a modern, maintainable stack using Vite, React, and TypeScript.

## Stack
- Vite + TypeScript, React 18, Zustand, Vitest + Testing Library, vite-plugin-pwa.

## Phases
- Foundation: scaffold app, strict TS, aliases.
- Services: port storage, bus (typed events), audio, themes, ai.
- UI: App + CenterBar + TaskList + Modal + SettingsPanel.
- CSS: move tokens; split large bundles into per-component styles.
- Parity: port helpers (quotes, affirmations, daily-summary, gestures, parallax).
- Testing: cover core flows; optional e2e.
- Deploy: build and ship `dist/` via Pages.

## Guards
- Document event contracts; use `App.EVENTS`.
- Keep behavior parity; minimize drift.
- Respect accessibility and performance budgets.
