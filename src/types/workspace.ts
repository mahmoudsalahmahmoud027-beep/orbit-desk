export type TaskStatus = "OPEN" | "COMPLETED" | "CANCELLED";
export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type ThemePreference = "light" | "dark" | "system";

export interface Task {
  id: string; title: string; description: string; status: TaskStatus; priority: Priority;
  dueDate: string | null; scheduledDate: string | null; estimatedMinutes: number | null;
  projectId: string | null; tags: string[]; createdAt: string; updatedAt: string;
  completedAt: string | null; sortOrder: number;
}

export interface Project {
  id: string; name: string; description: string; status: ProjectStatus; deadline: string | null;
  createdAt: string; updatedAt: string; accent: string;
}

export interface Note {
  id: string; title: string; content: string; projectId: string | null; tags: string[];
  isPinned: boolean; isFavorite: boolean; createdAt: string; updatedAt: string;
}

export interface Capture {
  id: string; content: string; kind: "idea" | "reminder" | "thought" | "link";
  createdAt: string; archivedAt: string | null;
}

export interface FocusSession {
  id: string; durationMinutes: number; elapsedSeconds: number; taskId: string | null;
  projectId: string | null; startedAt: string; endedAt: string; outcome: "FINISHED" | "CANCELLED";
}

export interface Activity {
  id: string; projectId: string | null; text: string; createdAt: string;
}

export interface SavedView {
  id: string; name: string; priority: Priority | "ANY"; projectId: string | null; tag: string | null;
}

export interface Preferences {
  profileName: string; theme: ThemePreference; defaultFocusMinutes: number;
  weekStart: "monday" | "sunday"; hideCompleted: boolean;
}

export interface WorkspaceData {
  version: 1; tasks: Task[]; projects: Project[]; notes: Note[]; captures: Capture[];
  focusSessions: FocusSession[]; activities: Activity[]; savedViews: SavedView[]; preferences: Preferences;
}

export interface SearchResult {
  id: string; type: "Task" | "Project" | "Note" | "Capture"; title: string; subtitle: string; score: number;
}
