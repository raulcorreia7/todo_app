# Luxury Todo

Premium, offline-first todo app with elegant interactions, theming, and subtle audio. Runs as a static site with a lightweight local server for development.

## Quick Start
- Install: `npm install`
- Develop: `npm run dev` (serves at `http://localhost:8080`)
- Version bump: `npm run version` (syncs package, manifest, and commit-count)

## Features
- Theming via CSS variables, curated palettes, and typography options.
- Fast, accessible UI with micro-interactions and optional ambient music.
- Local persistence for tasks, settings, stats, and achievements.

## Documentation
- Start here: `docs/README.md` (documentation map)
- Reverse spec: `docs/reverse-spec.md` (authoritative high-level spec)
- Prompt: `docs/prompt.md` (copy/paste to regenerate)
- Contributor guide: `AGENTS.md`

## Project Notes
- Minimal static hosting (GitHub Pages). No server required.
- Global event bus coordinates modules; event and storage keys in `js/constants.js`.

## Documentation
- Architecture & Migration: see `docs/architecture-modernization.md` for current architecture, proposed React+TS stack, CSS strategy, and phased plan.
- Events Catalog: see `docs/events.md` for bus/DOM events and payloads.
- Contributor Guide: see `AGENTS.md` for project structure, commands, and conventions.
