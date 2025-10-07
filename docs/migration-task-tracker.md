# Migration Task Tracker

Structured task list derived from the migration roadmap so subagents can be dispatched directly from this repository.

## Usage
- Locate the next available unchecked task in the index.
- Reference `docs/migration-tasks.yaml` for ready-to-send payloads when opening a Codex subagent request.
- Update the checkbox, notes, and YAML `status` once the task is assigned or delivered.

## Task Index

### Governance & Foundations
- [ ] **MIG-000 Pre-flight Governance**  
  _Prerequisites:_ None  
  _Summary:_ Spin up the long-lived `migration` branch, enforce documentation-first workflow, and verify GitHub Pages preview configuration.  
  _Deliverables:_ Branching plan, doc update checklist, preview validation notes.

- [ ] **MIG-D0 Documentation Vanguard**  
  _Prerequisites:_ MIG-000  
  _Summary:_ Sweep the entire `/docs` tree, log stale sections, and capture parity acceptance criteria plus regression test inventory in `docs/change-log.md`.  
  _Deliverables:_ Updated docs, parity checklist, regression inventory, change-log entry.

### Planning & Scaffold
- [ ] **MIG-P1 Planning & Tooling**  
  _Prerequisites:_ MIG-D0 sign-off  
  _Summary:_ Document target stack adjustments, outline linting/formatting automation (ESLint, Prettier, Stylelint), configure lint-staged + husky, and plan CI preview workflows.  
  _Deliverables:_ Tooling implementation notes, updated architecture/development docs, automation checklist.

- [ ] **MIG-S2 Stack Scaffold**  
  _Prerequisites:_ MIG-P1 merged  
  _Summary:_ Bootstrap the Vite + React + TypeScript workspace (`apps/web`, `packages/ui`, `packages/design-tokens`), wire strict TS, Vitest, PostCSS, and `vite-plugin-pwa`, and refresh diagrams.  
  _Deliverables:_ Scaffold plan, updated architecture diagrams, validation checklist.

### Core Systems & UI
- [ ] **MIG-S3 Core Domain Services**  
  _Prerequisites:_ MIG-S2 available  
  _Summary:_ Port storage, event bus, theming, audio, AI provider, and analytics into typed modules with dependency injection and observability hooks.  
  _Deliverables:_ Service modernization blueprint, updated service/event docs, verification checklist.

- [ ] **MIG-UI4 UI Library Extraction**  
  _Prerequisites:_ MIG-S3 service contracts, MIG-S2 design tokens  
  _Summary:_ Build `/packages/ui` with shared design tokens, Storybook/Ladle setup, accessibility/visual tests, and publishing pipeline notes.  
  _Deliverables:_ Component library plan, accessibility/testing strategy, publishing outline.

- [ ] **MIG-APP5 Application Shell & Features**  
  _Prerequisites:_ MIG-UI4 alpha library, MIG-S3 services  
  _Summary:_ Recreate React app shell, migrate task CRUD, filters, achievements, quotes, AI flows, and integrate shared services/components with Zustand/React Query.  
  _Deliverables:_ Feature migration playbook, parity notes, accessibility/regression checklist.

### Styling, QA, Data, Release
- [ ] **MIG-CSS6 Styling Modernization**  
  _Prerequisites:_ MIG-APP5 shell + design tokens  
  _Summary:_ Replace legacy CSS with token-driven theming, optimize assets, and document multi-theme support with performance audits.  
  _Deliverables:_ Styling migration plan, updated UI/CSS docs, performance audit checklist.

- [ ] **MIG-QA7 Testing & Quality Gates**  
  _Prerequisites:_ MIG-APP5 functionality, MIG-CSS6 styling guidance  
  _Summary:_ Author Vitest, Testing Library, and Playwright suites; configure CI pipelines for lint/test/build/storybook/visual checks; refresh QA documentation.  
  _Deliverables:_ Test plan, CI guardrail checklist, updated QA docs.

- [ ] **MIG-DATA8 Data Migration & Compatibility**  
  _Prerequisites:_ MIG-S3 services, MIG-APP5 app shell  
  _Summary:_ Document schemas, implement typed migration scripts for legacy storage, ensure backward compatibility, and establish telemetry/monitoring.  
  _Deliverables:_ Data migration blueprint, compatibility matrix, rollback/monitoring notes.

- [ ] **MIG-RELEASE9 Documentation & Release**  
  _Prerequisites:_ Completion of prior tasks  
  _Summary:_ Compile release notes, finalize documentation bundle, publish UI package assets, coordinate final QA sign-off, and script `migration` → `main` merge with rollback plan.  
  _Deliverables:_ Release readiness checklist, final documentation audit, publishing artifacts.

## Notes & Status Updates
- Use `docs/change-log.md` to record when each task is dispatched or completed.
- Append any clarifications, blockers, or cross-phase dependencies below.
