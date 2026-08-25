import assert from "node:assert/strict";
import test from "node:test";
import { createDemoWorkspace } from "../src/data/seed.ts";
import { WORKSPACE_KEY, workspaceRepository } from "../src/services/workspaceRepository.ts";
import type { Capture } from "../src/types/workspace.ts";
import { chooseNextTask, convertCaptureToTask, createTask, projectProgress, recordFocusSession, reorderTasks, searchWorkspace, toggleTaskCompletion } from "../src/utils/domain.ts";
import { dateKey } from "../src/utils/dates.ts";

test("creates a complete task record with stable defaults", () => {
  const task = createTask({ title: "  Write release notes  ", scheduledDate: "2026-08-25", projectId: "p-mobile" }, 4, "2026-08-25T10:00:00.000Z");
  assert.equal(task.title, "Write release notes"); assert.equal(task.status, "OPEN"); assert.equal(task.sortOrder, 4); assert.equal(task.projectId, "p-mobile");
});

test("completes and reopens a task without losing its data", () => {
  const task = createTask({ title: "Finish layout", priority: "HIGH" });
  const completed = toggleTaskCompletion(task, "2026-08-25T11:00:00.000Z");
  assert.equal(completed.status, "COMPLETED"); assert.equal(completed.completedAt, "2026-08-25T11:00:00.000Z");
  const reopened = toggleTaskCompletion(completed, "2026-08-25T12:00:00.000Z");
  assert.equal(reopened.status, "OPEN"); assert.equal(reopened.completedAt, null); assert.equal(reopened.priority, "HIGH");
});

test("reorders tasks and produces persistable sort positions", () => {
  const tasks = ["a", "b", "c"].map((id, sortOrder) => ({ ...createTask({ title: id }, sortOrder), id }));
  const reordered = reorderTasks(tasks, "c", "a");
  assert.deepEqual(reordered.map((task) => task.id), ["c", "a", "b"]); assert.deepEqual(reordered.map((task) => task.sortOrder), [0, 1, 2]);
});

test("selects the overdue high-priority task as Next", () => {
  const data = createDemoWorkspace(new Date("2026-08-25T12:00:00"));
  const next = chooseNextTask(data.tasks, data.projects, "2026-08-25");
  assert.equal(next?.id, "t-responsive");
});

test("derives project progress from real task state", () => {
  const data = createDemoWorkspace(new Date("2026-08-25T12:00:00"));
  assert.deepEqual(projectProgress("p-mobile", data.tasks), { completed: 1, total: 3, percent: 33, remaining: 2 });
});

test("converts a capture once and prevents duplicate conversion", () => {
  const capture: Capture = { id: "capture-1", content: "Check the API timeout", kind: "thought", createdAt: "2026-08-25T10:00:00Z", archivedAt: null };
  const once = convertCaptureToTask(capture, [], "2026-08-25T10:01:00Z"); const twice = convertCaptureToTask(capture, once, "2026-08-25T10:02:00Z");
  assert.equal(once.length, 1); assert.equal(twice.length, 1); assert.equal(once[0].scheduledDate, dateKey());
});

test("records completed Focus session details", () => {
  const session = recordFocusSession({ durationMinutes: 25, elapsedSeconds: 1500, taskId: "t-auth", projectId: "p-mobile", startedAt: "2026-08-25T10:00:00Z", outcome: "FINISHED" }, "2026-08-25T10:25:00Z");
  assert.equal(session.outcome, "FINISHED"); assert.equal(session.elapsedSeconds, 1500); assert.equal(session.endedAt, "2026-08-25T10:25:00Z");
});

test("search matches tokens across tasks, projects, and notes", () => {
  const data = createDemoWorkspace(new Date("2026-08-25T12:00:00")); const results = searchWorkspace(data, "auth");
  assert.ok(results.some((result) => result.type === "Task" && result.title.includes("authentication"))); assert.ok(results.some((result) => result.type === "Note" && result.title.includes("Authentication")));
});

test("storage recovery preserves malformed raw data", () => {
  const values = new Map<string, string>();
  const localStorage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => void values.set(key, value), removeItem: (key: string) => void values.delete(key), clear: () => values.clear(), key: (index: number) => [...values.keys()][index] ?? null, get length() { return values.size; } };
  Object.assign(globalThis, { window: {}, localStorage }); values.set(WORKSPACE_KEY, "{broken json");
  const result = workspaceRepository.load();
  assert.equal(result.recoveredRaw, true); assert.ok(result.warning); assert.ok([...values.keys()].some((key) => key.startsWith("orbit-desk:recovery:"))); assert.equal(result.data.version, 1);
});
