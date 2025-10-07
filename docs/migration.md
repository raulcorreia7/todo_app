# Migration (React + TypeScript)

A phased plan to evolve this vanilla JS app to a modern, maintainable stack using Vite, React, and TypeScript.

## Stack
- Vite + TypeScript, React 18, Zustand, Vitest + Testing Library, vite-plugin-pwa.

## Branch Strategy
- Create a long-lived `migration` branch to host the modernization effort.
- Gate each milestone behind reviewable feature branches (e.g., `migration/foundation`).
- Maintain GitHub Actions previews for rapid QA before merging back to `main`.

## Documentation-First Principle
- Treat documentation updates as the first task in every milestone. Capture findings, decisions, and pending questions in `/docs` before writing code.
- Run a quick sweep of `docs/architecture.md`, `docs/development.md`, `docs/ui-css.md`, and phase-specific notes to keep contributors aligned.
- Require PRs targeting `migration` to note which docs were updated (or why none changed) so the knowledge base stays current.

## Launching Codex Subagent Tasks

Use this file as the control center for spinning up Codex subagent work. Before you open a new task:

1. **Confirm documentation freshness.** Check `docs/change-log.md` to ensure D0 has signed off or note any gaps you discover.
2. **Copy the matching launch template.** Each subagent section includes a ready-to-send payload with task title, steps, and deliverables.
3. **Create the task in Codex.** Paste the template into the new task request, adding repo-specific context or links where needed.
4. **Record the dispatch.** Append your entry to `docs/change-log.md` with the date, subagent name, and docs you touched when launching the work.

## Subagent Execution Plan

Each phase below is mapped to a dedicated Codex subagent. Subagents may not begin work until their listed prerequisites and documentation updates are complete. Every deliverable must reference refreshed docs and note which knowledge sources were updated. Use the embedded launch template when opening a new task.

### Subagent D0 – Documentation Vanguard (Phase 0)
- **Prerequisites:** None; this agent unblocks all others.
- **Documentation-first actions:** Sweep the entire `/docs` index, logging outdated sections and recording decisions in `docs/change-log.md`.
- **Tasks:** Catalogue current behavior, data expectations, accessibility standards, and open issues; translate findings into parity acceptance criteria and regression test inventories.
- **Deliverables:** Updated docs, an issue log for remaining gaps, and sign-off that the knowledge base is current.

#### Launch Template
```
Task Title: Migration D0 – Documentation Vanguard
Context: Refresh every documentation source before migration work proceeds. Record gaps in docs/change-log.md and capture parity requirements for downstream agents.
Steps:
1. Review the entire docs/ directory and compare against the current app behavior.
2. Update any stale sections and log outstanding questions or blockers.
3. Summarize parity acceptance criteria and regression checklists for later phases.
Deliverables:
- Updated documentation with tracked edits in docs/change-log.md.
- Gap/issue log for remaining documentation work.
- Approval note confirming docs are ready for migration tasks.
```

### Subagent P1 – Planning & Tooling (Phase 1)
- **Prerequisites:** D0 sign-off + parity acceptance criteria.
- **Documentation-first actions:** Update `docs/architecture.md` and `docs/development.md` with the target stack blueprint before coding.
- **Tasks:** Introduce ESLint + Prettier (TypeScript), Stylelint, lint-staged + husky, and dependency automation (Renovate/Dependabot). Define branch workflows and CI preview strategy.
- **Deliverables:** Tooling PR plan, updated setup docs, and checklist for repository automation.

#### Launch Template
```
Task Title: Migration P1 – Planning & Tooling
Context: Establish modernization tooling once documentation has been refreshed and parity criteria are defined.
Steps:
1. Re-read docs/architecture.md and docs/development.md to confirm the recorded target stack.
2. Draft implementation notes for linting, formatting, and automation upgrades.
3. Outline the branch workflow, CI preview needs, and dependency update strategy.
Deliverables:
- Tooling introduction plan with sequencing and owners.
- Documentation updates that describe the new tooling expectations.
- Checklist for automations (lint-staged, husky, Renovate/Dependabot).
```

### Subagent S2 – Stack Scaffold (Phase 2)
- **Prerequisites:** P1 tooling merged.
- **Documentation-first actions:** Draft workspace diagrams and module boundaries in `docs/architecture.md` and `docs/ui-map.md` prior to implementation.
- **Tasks:** Bootstrap Vite + React + TypeScript app (`apps/web`), create `/packages/ui` and `/packages/design-tokens`, configure strict TS, path aliases, Vitest + Testing Library, PostCSS pipeline, and `vite-plugin-pwa`.
- **Deliverables:** Working scaffold, documented setup scripts, and updated architecture diagrams.

#### Launch Template
```
Task Title: Migration S2 – Stack Scaffold
Context: Bootstrap the Vite + React + TypeScript workspace and supporting packages based on the documented architecture.
Steps:
1. Confirm architecture diagrams and component boundaries in docs/architecture.md and docs/ui-map.md.
2. Outline the folder structure for apps/web and supporting packages.
3. Specify required tooling configurations (TypeScript, Vitest, PostCSS, vite-plugin-pwa) and documentation touchpoints.
Deliverables:
- Scaffold plan describing file/folder creation and configuration steps.
- Updated docs highlighting the new workspace architecture.
- Checklist for validating the scaffold once implemented.
```

### Subagent S3 – Core Domain Services (Phase 3)
- **Prerequisites:** Stack scaffold available + service diagrams from D0.
- **Documentation-first actions:** Refresh service contract docs (`docs/events.md`, `docs/development.md#services`).
- **Tasks:** Port storage, event bus, theming, audio, AI provider, and analytics utilities to typed modules with dependency injection and observability hooks.
- **Deliverables:** Typed service layer, migration notes, and updated service documentation.

#### Launch Template
```
Task Title: Migration S3 – Core Domain Services
Context: Port legacy services into typed, React-friendly modules without losing existing behavior.
Steps:
1. Review updated service diagrams and event payload notes.
2. Document the target module structure and dependency injection approach.
3. Plan observability hooks and compatibility checks for each service.
Deliverables:
- Service modernization blueprint with module responsibilities.
- Updated documentation for events, services, and integration points.
- Testing and verification checklist for the service layer.
```

### Subagent UI4 – UI Library Extraction (Phase 4)
- **Prerequisites:** Component catalog from D0 + design tokens from S2.
- **Documentation-first actions:** Update `docs/ui-map.md` with component taxonomy and accessibility requirements.
- **Tasks:** Implement `/packages/ui` components with Storybook/Ladle, accessibility audits, snapshot/visual tests, and publishable builds via tsup/rollup.
- **Deliverables:** Reusable component library, documentation site, and styling guidelines referencing shared tokens.

#### Launch Template
```
Task Title: Migration UI4 – UI Library Extraction
Context: Extract all UI elements into a reusable component library with accessibility and testing guardrails.
Steps:
1. Validate the component taxonomy and accessibility requirements in docs/ui-map.md.
2. Plan Storybook/Ladle setup, build tooling, and testing strategy.
3. Define how shared design tokens flow into the component package.
Deliverables:
- Implementation plan for packages/ui with documentation references.
- Accessibility and visual testing approach.
- Publishing pipeline outline for the UI package.
```

### Subagent APP5 – Application Shell & Features (Phase 5)
- **Prerequisites:** UI library alpha from UI4 + services from S3.
- **Documentation-first actions:** Record feature parity expectations, state diagrams, and accessibility notes in `docs/product.md` and `docs/architecture.md` before coding.
- **Tasks:** Recreate React application shell, port task CRUD, filters, achievements, quotes, AI flows, and integrate shared components with Zustand/React Query.
- **Deliverables:** Feature-complete React app slices with parity reports and documentation updates for each migrated flow.

#### Launch Template
```
Task Title: Migration APP5 – Application Shell & Features
Context: Rebuild the application shell and migrate feature slices while reusing shared services and components.
Steps:
1. Reconfirm parity requirements and state diagrams in docs/product.md and docs/architecture.md.
2. Outline provider setup, routing needs, and state management integration.
3. Break down feature migration order with parity validation steps.
Deliverables:
- Migration playbook for shell and feature slices.
- Documentation updates covering new React flows and data handling.
- Checklist for accessibility, responsiveness, and regression testing per feature.
```

### Subagent CSS6 – Styling Modernization (Phase 6)
- **Prerequisites:** Design tokens stable + feature shell functional.
- **Documentation-first actions:** Revise `docs/ui-css.md` with new token definitions, theming rules, and layering strategy.
- **Tasks:** Replace legacy CSS with token-driven, co-located styles, optimize assets, implement dark/light/system themes, and run performance audits (Lighthouse, bundle analysis).
- **Deliverables:** Modernized styling system, asset optimization report, and updated UI/CSS documentation.

#### Launch Template
```
Task Title: Migration CSS6 – Styling Modernization
Context: Replace legacy CSS with token-driven theming and optimized assets based on updated documentation.
Steps:
1. Review docs/ui-css.md for token definitions and theming strategy.
2. Identify legacy styles to retire and map replacements using shared tokens.
3. Plan performance audits and asset optimizations.
Deliverables:
- Styling migration plan with file-level actions.
- Updated documentation for themes, tokens, and responsive behavior.
- Performance audit checklist (e.g., Lighthouse, bundle analysis).
```

### Subagent QA7 – Testing & Quality Gates (Phase 7)
- **Prerequisites:** Functional features from APP5 + styling rules from CSS6.
- **Documentation-first actions:** Extend `docs/qa-walk.md` and testing strategy docs with planned coverage before writing tests.
- **Tasks:** Author Vitest unit/integration suites, Testing Library component tests, Playwright E2E flows, and configure CI pipelines (lint/test/build/storybook/visual regression).
- **Deliverables:** Automated test suites, CI configuration updates, and refreshed QA documentation.

#### Launch Template
```
Task Title: Migration QA7 – Testing & Quality Gates
Context: Expand automated coverage and wire all suites into CI, guided by updated QA docs.
Steps:
1. Review docs/qa-walk.md and parity checklists to understand critical flows.
2. Design the testing pyramid (unit, component, integration, E2E, visual).
3. Map CI pipeline updates required to enforce the new suites.
Deliverables:
- Test plan with suite ownership and tooling details.
- Documentation updates describing test coverage expectations.
- CI guardrail checklist and rollout plan.
```

### Subagent DATA8 – Data Migration & Compatibility (Phase 8)
- **Prerequisites:** Service layer and app shell stable.
- **Documentation-first actions:** Document data schemas, compatibility matrix, and rollback plan in `docs/architecture.md` and `docs/development.md`.
- **Tasks:** Build migration scripts for legacy localStorage, ensure backward-compatible loaders, validate cross-browser/offline behavior, and set up telemetry/monitoring.
- **Deliverables:** Migration utilities, compatibility reports, and documented rollback procedures.

#### Launch Template
```
Task Title: Migration DATA8 – Data Migration & Compatibility
Context: Provide typed migration paths for existing data while preserving backward compatibility and documenting rollback steps.
Steps:
1. Review data schema documentation and note persistence edge cases.
2. Define migration scripts, fallback loaders, and telemetry requirements.
3. Plan validation across browsers/offline modes and record rollback strategy.
Deliverables:
- Data migration blueprint with testing scenarios.
- Documentation updates for schemas, compatibility matrix, and rollback procedures.
- Monitoring plan outlining alerts and success metrics.
```

### Subagent RELEASE9 – Documentation & Release (Phase 9)
- **Prerequisites:** All prior phases complete and validated.
- **Documentation-first actions:** Confirm every doc is refreshed and cross-linked; prepare release notes template in `docs/migration.md` appendix.
- **Tasks:** Finalize documentation bundle, publish UI package pipeline, compile release notes, coordinate final QA sign-off, and orchestrate merge from `migration` to `main`.
- **Deliverables:** Release readiness checklist, UI package publishing artifacts, and final documentation updates.

#### Launch Template
```
Task Title: Migration RELEASE9 – Documentation & Release
Context: Coordinate the final release once all migration phases are complete, ensuring documentation and publishing steps are ready.
Steps:
1. Confirm every prior phase has recorded deliverables and documentation updates.
2. Compile release notes, UI package publishing steps, and QA sign-off requirements.
3. Outline the merge plan for migration -> main and rollback contingencies.
Deliverables:
- Release orchestration checklist with owners and timelines.
- Final documentation audit report and cross-link updates.
- Publish-ready artifacts for the UI package and release notes.
```

## Ongoing Guards
- Keep behavior parity; minimize drift from legacy experience during phased rollout.
- Ensure all new modules are typed and linted with zero `any` usage unless justified.
- Respect accessibility and performance budgets; monitor Core Web Vitals regressions.
