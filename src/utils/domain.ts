import type { Capture, FocusSession, Project, SearchResult, Task, WorkspaceData } from "../types/workspace.ts";
import { dateKey } from "./dates.ts";

const priorityWeight: Record<Task["priority"], number> = { HIGH: 40, MEDIUM: 20, LOW: 8, NONE: 0 };

export function createTask(input: Partial<Task> & Pick<Task, "title">, existingCount = 0, now = new Date().toISOString()): Task {
  return { id: crypto.randomUUID(), title: input.title.trim(), description: input.description ?? "", status: input.status ?? "OPEN", priority: input.priority ?? "NONE", dueDate: input.dueDate ?? null, scheduledDate: input.scheduledDate ?? null, estimatedMinutes: input.estimatedMinutes ?? null, projectId: input.projectId ?? null, tags: input.tags ?? [], createdAt: input.createdAt ?? now, updatedAt: now, completedAt: input.completedAt ?? null, sortOrder: input.sortOrder ?? existingCount };
}

export function toggleTaskCompletion(task: Task, now = new Date().toISOString()): Task {
  const completed = task.status !== "COMPLETED";
  return { ...task, status: completed ? "COMPLETED" : "OPEN", completedAt: completed ? now : null, updatedAt: now };
}

export function chooseNextTask(tasks: Task[], projects: Project[], today = dateKey()): Task | null {
  const activeProjects = new Set(projects.filter((p) => p.status === "ACTIVE").map((p) => p.id));
  return tasks.filter((task) => task.status === "OPEN" && (!task.projectId || activeProjects.has(task.projectId)))
    .map((task) => {
      let score = priorityWeight[task.priority];
      if (task.dueDate && task.dueDate < today) score += 150;
      else if (task.dueDate === today) score += 80;
      if (task.scheduledDate === today) score += 60;
      if (task.estimatedMinutes && task.estimatedMinutes <= 45) score += 4;
      return { task, score };
    })
    .sort((a, b) => b.score - a.score || a.task.sortOrder - b.task.sortOrder)[0]?.task ?? null;
}

export function projectProgress(projectId: string, tasks: Task[]) {
  const relevant = tasks.filter((task) => task.projectId === projectId && task.status !== "CANCELLED");
  const completed = relevant.filter((task) => task.status === "COMPLETED").length;
  return { completed, total: relevant.length, percent: relevant.length ? Math.round((completed / relevant.length) * 100) : 0, remaining: relevant.length - completed };
}

export function reorderTasks(tasks: Task[], activeId: string, overId: string) {
  const ordered = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const from = ordered.findIndex((task) => task.id === activeId);
  const to = ordered.findIndex((task) => task.id === overId);
  if (from < 0 || to < 0 || from === to) return tasks;
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);
  return ordered.map((task, index) => ({ ...task, sortOrder: index }));
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
const fuzzyScore = (query: string, text: string) => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const haystack = normalize(text);
  if (!tokens.length) return 0;
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += haystack.startsWith(token) ? 8 : 5;
    else {
      let cursor = 0;
      for (const char of token) cursor = haystack.indexOf(char, cursor) >= 0 ? haystack.indexOf(char, cursor) + 1 : -999;
      if (cursor > 0) score += 1;
      else return 0;
    }
  }
  return score;
};

export function searchWorkspace(data: WorkspaceData, query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const add = (id: string, type: SearchResult["type"], title: string, subtitle: string, searchable: string) => {
    const score = fuzzyScore(query, searchable);
    if (score) results.push({ id, type, title, subtitle, score });
  };
  data.tasks.forEach((item) => add(item.id, "Task", item.title, item.status === "COMPLETED" ? "Completed" : "Open task", `${item.title} ${item.description} ${item.tags.join(" ")}`));
  data.projects.forEach((item) => add(item.id, "Project", item.name, item.status.toLowerCase(), `${item.name} ${item.description}`));
  data.notes.forEach((item) => add(item.id, "Note", item.title, item.content.slice(0, 60), `${item.title} ${item.content} ${item.tags.join(" ")}`));
  data.captures.filter((item) => !item.archivedAt).forEach((item) => add(item.id, "Capture", item.content, item.kind, item.content));
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function convertCaptureToTask(capture: Capture, tasks: Task[], now = new Date().toISOString()) {
  if (tasks.some((task) => task.description === `capture:${capture.id}`)) return tasks;
  return [...tasks, { id: crypto.randomUUID(), title: capture.content, description: `capture:${capture.id}`, status: "OPEN" as const, priority: "NONE" as const, dueDate: null, scheduledDate: dateKey(), estimatedMinutes: null, projectId: null, tags: [], createdAt: now, updatedAt: now, completedAt: null, sortOrder: tasks.length }];
}

export function recordFocusSession(input: Omit<FocusSession, "id" | "endedAt">, endedAt = new Date().toISOString()): FocusSession {
  return { ...input, id: crypto.randomUUID(), endedAt };
}

export function nextReason(task: Task) {
  const bits: string[] = [];
  if (task.dueDate && task.dueDate < dateKey()) bits.push("Overdue");
  else if (task.dueDate === dateKey()) bits.push("Due today");
  else if (task.dueDate) bits.push("Nearest deadline");
  if (task.priority !== "NONE") bits.push(`${task.priority[0]}${task.priority.slice(1).toLowerCase()} priority`);
  return bits.join(" · ") || "Scheduled for today";
}
