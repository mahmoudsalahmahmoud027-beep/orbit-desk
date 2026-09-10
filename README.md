# Orbit Desk

Orbit Desk is a local-first productivity workspace designed around execution, planning, and resilient personal organization.

It combines tasks, projects, notes, focus sessions, quick capture, review, and search in one responsive interface while keeping the underlying domain logic explicit and testable.

## Highlights

- Focused Today view with deterministic next-action recommendations
- Full task lifecycle: create, edit, complete, reopen, duplicate, reschedule, filter, and reorder
- Project workspaces with task-derived progress, milestones, deadlines, notes, and activity
- Markdown notes with search, pinning, favorites, project links, preview, and autosave
- Focus sessions with task/project context and session history
- Quick Capture inbox with structured conversion into tasks, notes, or project ideas
- Universal search and keyboard command palette
- Light, dark, and system themes with responsive desktop and mobile navigation
- Versioned local persistence with malformed-state recovery
- Reversible actions and clear state boundaries

## Product Principles

Orbit Desk favors clear hierarchy, readable typography, strong keyboard support, and predictable state transitions over decorative dashboards.

The workspace is intentionally useful without an account or remote backend. Core behavior remains available locally, which keeps the application fast and reduces unnecessary infrastructure dependencies.

## Architecture

```text
app/              application routes and metadata
src/components/   shared interaction components
src/features/     Today, Tasks, Projects, Notes, Focus, Capture, Search, Review
src/state/        workspace actions and state coordination
src/services/     persistence boundary
src/types/        domain and workspace models
src/utils/        dates, search, progress, ordering, recommendations
tests/            domain behavior and recovery tests
```

Components do not write storage directly. Workspace actions create immutable snapshots and pass them through the persistence boundary, keeping state changes easier to reason about and test.

## Tech Stack

- Next.js
- React 19
- TypeScript
- Tailwind CSS
- ESLint
- Node test runner

## Local Development

```bash
npm install
npm run dev
```

Verification:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Engineering Focus

Orbit Desk demonstrates product-oriented frontend architecture: explicit domain actions, versioned persistence, recovery behavior, responsive interaction design, keyboard accessibility, and clear separation between UI and data ownership.
