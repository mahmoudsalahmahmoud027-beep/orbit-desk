"use client";

import { useCallback, useEffect, useState } from "react";
import { createDemoWorkspace } from "../data/seed";
import { workspaceRepository } from "../services/workspaceRepository";
import type { Activity, Capture, FocusSession, Note, Preferences, Project, SavedView, Task, WorkspaceData } from "../types/workspace";
import { convertCaptureToTask, createTask, reorderTasks, toggleTaskCompletion } from "../utils/domain";

const stamp = () => new Date().toISOString();
const id = () => crypto.randomUUID();

export function useWorkspace() {
  const [data, setData] = useState<WorkspaceData>(() => createDemoWorkspace());
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "error">("saved");

  useEffect(() => { const loaded = workspaceRepository.load(); const timer = window.setTimeout(() => { setData(loaded.data); setWarning(loaded.warning); setReady(true); }, 0); return () => clearTimeout(timer); }, []);

  const commit = useCallback((recipe: (current: WorkspaceData) => WorkspaceData) => {
    setData((current) => {
      const next = recipe(current);
      setSaveState(workspaceRepository.save(next) ? "saved" : "error");
      return next;
    });
  }, []);

  const addActivity = (projectId: string | null, text: string): Activity => ({ id: id(), projectId, text, createdAt: stamp() });
  const addTask = (input: Partial<Task> & Pick<Task, "title">) => commit((current) => ({ ...current, tasks: [...current.tasks, createTask(input, current.tasks.length)] }));
  const updateTask = (taskId: string, patch: Partial<Task>) => commit((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, ...patch, updatedAt: stamp() } : task) }));
  const completeTask = (taskId: string) => commit((current) => { const task = current.tasks.find((item) => item.id === taskId); const completed = task?.status !== "COMPLETED"; return { ...current, tasks: current.tasks.map((item) => item.id === taskId ? toggleTaskCompletion(item) : item), activities: task && completed ? [addActivity(task.projectId, `Completed “${task.title}”`), ...current.activities] : current.activities }; });
  const deleteTask = (taskId: string) => commit((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) }));
  const duplicateTask = (taskId: string) => commit((current) => { const task = current.tasks.find((item) => item.id === taskId); return task ? { ...current, tasks: [...current.tasks, { ...task, id: id(), title: `${task.title} copy`, status: "OPEN", completedAt: null, createdAt: stamp(), updatedAt: stamp(), sortOrder: current.tasks.length }] } : current; });
  const reorder = (activeId: string, overId: string) => commit((current) => ({ ...current, tasks: reorderTasks(current.tasks, activeId, overId) }));

  const addProject = (name: string) => commit((current) => ({ ...current, projects: [...current.projects, { id: id(), name, description: "", status: "ACTIVE", deadline: null, createdAt: stamp(), updatedAt: stamp(), accent: "#315fce" }] }));
  const updateProject = (projectId: string, patch: Partial<Project>) => commit((current) => ({ ...current, projects: current.projects.map((project) => project.id === projectId ? { ...project, ...patch, updatedAt: stamp() } : project), activities: patch.deadline ? [addActivity(projectId, "Changed the project deadline"), ...current.activities] : current.activities }));

  const addNote = (title = "Untitled note", projectId: string | null = null) => { const note: Note = { id: id(), title, content: "", projectId, tags: [], isPinned: false, isFavorite: false, createdAt: stamp(), updatedAt: stamp() }; commit((current) => ({ ...current, notes: [note, ...current.notes], activities: [addActivity(projectId, `Created note “${title}”`), ...current.activities] })); return note.id; };
  const updateNote = (noteId: string, patch: Partial<Note>) => commit((current) => ({ ...current, notes: current.notes.map((note) => note.id === noteId ? { ...note, ...patch, updatedAt: stamp() } : note) }));
  const deleteNote = (noteId: string) => commit((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== noteId) }));

  const addCapture = (content: string, kind: Capture["kind"] = "thought") => commit((current) => ({ ...current, captures: [{ id: id(), content, kind, createdAt: stamp(), archivedAt: null }, ...current.captures] }));
  const deleteCapture = (captureId: string) => commit((current) => ({ ...current, captures: current.captures.filter((capture) => capture.id !== captureId) }));
  const convertCapture = (captureId: string, target: "task" | "note" | "project") => commit((current) => { const capture = current.captures.find((item) => item.id === captureId); if (!capture) return current; const captures = current.captures.filter((item) => item.id !== captureId); if (target === "task") return { ...current, tasks: convertCaptureToTask(capture, current.tasks), captures }; if (target === "note") { const note: Note = { id: id(), title: capture.content.slice(0, 50), content: capture.content, projectId: null, tags: [], isPinned: false, isFavorite: false, createdAt: stamp(), updatedAt: stamp() }; return { ...current, notes: [note, ...current.notes], captures }; } const project: Project = { id: id(), name: capture.content.slice(0, 60), description: "", status: "ACTIVE", deadline: null, createdAt: stamp(), updatedAt: stamp(), accent: "#315fce" }; return { ...current, projects: [...current.projects, project], captures }; });

  const addFocusSession = (session: FocusSession) => commit((current) => ({ ...current, focusSessions: [session, ...current.focusSessions] }));
  const updatePreferences = (patch: Partial<Preferences>) => commit((current) => ({ ...current, preferences: { ...current.preferences, ...patch } }));
  const addSavedView = (view: SavedView) => commit((current) => ({ ...current, savedViews: [...current.savedViews.filter((item) => item.name !== view.name), view] }));
  const reset = () => { const clean = createDemoWorkspace(); setWarning(null); setSaveState(workspaceRepository.save(clean) ? "saved" : "error"); setData(clean); };
  const restore = (snapshot: WorkspaceData) => { setSaveState(workspaceRepository.save(snapshot) ? "saved" : "error"); setData(snapshot); };

  return { data, ready, warning, setWarning, saveState, actions: { addTask, updateTask, completeTask, deleteTask, duplicateTask, reorder, addProject, updateProject, addNote, updateNote, deleteNote, addCapture, deleteCapture, convertCapture, addFocusSession, updatePreferences, addSavedView, reset, restore } };
}
