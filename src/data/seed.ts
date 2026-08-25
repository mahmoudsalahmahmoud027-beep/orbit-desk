import type { WorkspaceData, Task, Project, Note } from "../types/workspace.ts";
import { addDays, dateKey } from "../utils/dates.ts";

const now = () => new Date().toISOString();

export function createDemoWorkspace(today = new Date()): WorkspaceData {
  const stamp = now();
  const projects: Project[] = [
    { id: "p-portfolio", name: "Portfolio Redesign", description: "Refresh the portfolio story, case studies, and responsive presentation.", status: "ACTIVE", deadline: addDays(8, today), createdAt: stamp, updatedAt: stamp, accent: "#315fce" },
    { id: "p-mobile", name: "Mobile App Release", description: "Prepare the next mobile release for a calm, reliable launch.", status: "ACTIVE", deadline: addDays(3, today), createdAt: stamp, updatedAt: stamp, accent: "#2f7d64" },
    { id: "p-api", name: "API Integration", description: "Finish authentication and document the remaining error states.", status: "ACTIVE", deadline: addDays(12, today), createdAt: stamp, updatedAt: stamp, accent: "#a2682b" },
    { id: "p-typescript", name: "TypeScript Learning", description: "A practical learning track based on small weekly exercises.", status: "PAUSED", deadline: null, createdAt: stamp, updatedAt: stamp, accent: "#7765a8" },
  ];
  const task = (id: string, title: string, projectId: string | null, scheduled: string | null, due: string | null, priority: Task["priority"], minutes: number, sortOrder: number, status: Task["status"] = "OPEN"): Task => ({
    id, title, description: "", status, priority, dueDate: due, scheduledDate: scheduled, estimatedMinutes: minutes,
    projectId, tags: [], createdAt: stamp, updatedAt: stamp, completedAt: status === "COMPLETED" ? stamp : null, sortOrder,
  });
  const todayKey = dateKey(today);
  const tasks = [
    task("t-nav", "Finalize mobile navigation", "p-portfolio", todayKey, addDays(1, today), "HIGH", 45, 0),
    task("t-auth", "Review authentication states", "p-mobile", todayKey, todayKey, "HIGH", 30, 1),
    task("t-errors", "Document API errors", "p-api", todayKey, addDays(2, today), "MEDIUM", 25, 2),
    task("t-notes", "Prepare release notes", "p-mobile", addDays(1, today), addDays(2, today), "MEDIUM", 40, 3),
    task("t-shots", "Improve project screenshots", "p-portfolio", addDays(3, today), addDays(5, today), "LOW", 60, 4),
    task("t-responsive", "Finish responsive layout", "p-portfolio", addDays(-1, today), addDays(-1, today), "HIGH", 50, 5),
    task("t-release-check", "Check store listing details", "p-mobile", null, addDays(3, today), "NONE", 20, 6, "COMPLETED"),
  ];
  const note = (id: string, title: string, content: string, projectId: string | null, pinned = false): Note => ({ id, title, content, projectId, tags: [], isPinned: pinned, isFavorite: false, createdAt: stamp, updatedAt: stamp });
  return {
    version: 1, projects, tasks,
    notes: [
      note("n-launch", "Launch checklist", "# Launch checklist\n\n- Confirm release notes\n- Review store screenshots\n- Check support links", "p-mobile", true),
      note("n-auth", "Authentication decisions", "# Authentication decisions\n\nKeep expired sessions clear and recoverable. Show a direct sign-in action rather than a generic error.", "p-api"),
      note("n-design", "Design review notes", "# Design review\n\nThe mobile navigation needs more breathing room. Keep primary actions within easy reach.", "p-portfolio"),
      note("n-api", "API integration notes", "# API integration\n\nDocument retry behavior and common response errors before handoff.", "p-api"),
    ],
    captures: [{ id: "c-1", content: "Try a quieter empty state for completed projects", kind: "idea", createdAt: stamp, archivedAt: null }],
    focusSessions: [], activities: [],
    savedViews: [{ id: "sv-high", name: "High Priority", priority: "HIGH", projectId: null, tag: null }],
    preferences: { profileName: "Mahmoud", theme: "system", defaultFocusMinutes: 25, weekStart: "monday", hideCompleted: false },
  };
}
