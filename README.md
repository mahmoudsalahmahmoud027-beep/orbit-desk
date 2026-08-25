# Orbit Desk

> **Repository:** `mahmoudsalahmahmoud027-beep/orbit-desk`  
> **Status:** Portfolio project · source release
> **Demo:** https://orbit-desk.mahmoudsalahmahmoud0.chatgpt.site/ *(currently protected by ChatGPT sign-in)*

Orbit Desk is a local-first personal productivity workspace for deciding what matters and getting it done. It combines Today, Tasks, Projects, Notes, Focus, Quick Capture, weekly review, and universal search in one responsive interface.

## Core Features

- A focused Today view with a deterministic Next recommendation and calm overdue review
- Full task creation, editing, completion, reopening, deletion, duplication, rescheduling, filtering, saved views, and drag ordering
- Projects with task-derived progress, next actions, linked notes, deadlines, status, and real activity
- Markdown notes with search, pinning, favorites, project links, preview, and persistence-backed autosave
- Focus timers from 15 to 90 minutes or a custom duration, optional task/project links, uninterrupted thought capture, and real session history
- Quick Capture Inbox with one-time conversion to a task, note, or project idea
- Workspace search and command palette with full keyboard navigation
- Light, dark, and system themes; editable profile preferences; undo for common reversible actions
- Responsive desktop, tablet, and purpose-built mobile navigation

## UX Principles

Orbit Desk favors hierarchy, typography, dividers, and clear actions over dashboard cards and decorative analytics. The Today view is an execution surface. Language is direct, overdue work is handled without guilt, and keyboard shortcuts never fire while the user is typing.

## Tech Stack

- React 19 and TypeScript
- Vite through vinext for App Router rendering and Cloudflare-compatible output
- Plain CSS with design tokens and responsive breakpoints
- Browser `localStorage` for intentionally device-local, offline-first data
- Node's built-in test runner for domain behavior

## Architecture

The UI calls domain actions exposed by `useWorkspace`. Actions create immutable workspace snapshots and pass them to `workspaceRepository`; components never write browser storage directly. Pure functions handle Next selection, progress derivation, search, task ordering, capture conversion, and Focus records.

Persisted data uses schema version `1`. On malformed data, Orbit Desk preserves the original raw value under a timestamped recovery key and opens a clean demo workspace with a visible warning.

## Local Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Validation commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Persistence

Tasks, projects, notes, captures, Focus sessions, activity, saved views, profile preferences, and theme are saved on the current device. No account, backend, network connection, or AI service is required. Settings includes storage size, schema version, and a confirmed demo reset.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Command palette and search |
| `Q` | Quick task |
| `C` | Quick capture |
| `F` | Open Focus |
| `N` | New note |
| `↑` / `↓` | Move through command results |
| `Enter` | Open the selected result |
| `Escape` | Close a dialog |

Single-key shortcuts are disabled while an input, select, textarea, or editor has focus.

## Demo Workspace

The first launch includes four believable projects—Portfolio Redesign, Mobile App Release, API Integration, and TypeScript Learning—plus connected tasks and notes. Demo data is editable and can be restored from Settings.

## Project Structure

```text
app/                 Route shell, metadata, and global styles
src/components/      Shared interaction components and dialogs
src/features/        Today, Tasks, Projects, Notes, Focus, Capture, Search, Review, Settings
src/state/           Workspace actions and state coordination
src/services/        Versioned local persistence boundary
src/types/           Domain and workspace types
src/utils/           Dates, search, progress, ordering, Next, conversion
src/data/            Demo workspace seed
tests/               Critical domain and recovery tests
worker/              Cloudflare-compatible application entry
```

## Future Improvements

- Optional encrypted export/import for moving a workspace between devices
- Recurring tasks with explicit, understandable rules
- A dedicated planning queue for unscheduled work
- Additional Markdown keyboard helpers without turning Notes into a heavy editor