# Build Instructions (Use with reverse-spec.md)

Implement the “Luxury Todo” app strictly according to reverse-spec.md. Favor clarity, fidelity, and performance over novelty. Do not include backends or build steps.

Constraints
- Static site only: generate `index.html`, `js/*.js`, `styles/*.css` (and minimal assets if needed). No bundlers or servers.
- Community libraries allowed via CDN (e.g., Lucide icons, Google Fonts, lightweight helpers). Avoid heavyweight frameworks unless essential.
- Token-based theming: define CSS variables in `styles/theme-system.css` and consume them across components.
- Events: use clear, named CustomEvents and keep event names centralized (e.g., expose under a single global `App.EVENTS`).

Deliverables
- `index.html`: page structure, CSS links, CDN libraries, ordered script tags.
- `styles/`: `theme-system.css` (tokens), `main.css` (imports or links), component layers (modals, components, interactions, responsive).
- `js/`: modules reflecting the app structure (bus, storage, themes, audio, music(+visualizer), settings(+loader), modal-manager, app controller, helpers).
- Optional `assets/` if strictly necessary (icons/covers), but prefer CDN.

Libraries (examples)
- Icons: Lucide via CDN.
- Fonts: Google Fonts (Inter, Playfair, SF‑like where licensing allows) via `<link>`.
- Small helpers permitted (e.g., micro‑animation, utility debounce) via CDN if they keep the footprint small.

Behavioral Requirements
- Treat reverse-spec.md as authoritative for ethos, IA, features, task action rewards, audio SFX, music player/visualizer, achievements, accessibility, and energy behavior.
- Music: support streaming external track URLs; display title/index/duration when available; handle buffering; gentle fades; subtle visualizer.
- Audio SFX: subtle anti‑fatigue cues; global sound toggle mutes all audio without pausing music.
- Accessibility: keyboard reachability, dialog semantics, AA contrast, honor reduced motion.
- Performance/Energy: GPU‑friendly effects; suspend non‑essential animations when the tab is hidden; resume gracefully.

Style & Structure
- Keep files small and readable; prefer plain classes/modules and the global event bus for decoupling.
- Avoid over‑engineering; match the premium/zen tone with subtle micro‑interactions.

Output
- Provide only the static site artifacts (HTML/CSS/JS). Assume all details, interactions, and copy from reverse-spec.md.
