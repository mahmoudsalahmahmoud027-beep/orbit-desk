"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CommandPalette } from "./features/search/CommandPalette";
import { InboxView } from "./features/capture/InboxView";
import { FocusView } from "./features/focus/FocusView";
import { NotesView } from "./features/notes/NotesView";
import { ProjectDetail, ProjectsView } from "./features/projects/ProjectsView";
import { ReviewView } from "./features/review/ReviewView";
import { SettingsView } from "./features/settings/SettingsView";
import { TasksView } from "./features/tasks/TasksView";
import { TodayView } from "./features/today/TodayView";
import { QuickAdd, QuickCapture } from "./components/QuickAdd";
import { TaskEditor } from "./components/TaskEditor";
import { workspaceRepository } from "./services/workspaceRepository";
import { useWorkspace } from "./state/useWorkspace";
import type { Capture, Note, Task, WorkspaceData } from "./types/workspace";

type Overlay = "quick-add" | "capture" | "search" | null;
interface UndoState { label: string; snapshot: WorkspaceData; }

export default function OrbitApp() {
  const { data, ready, warning, setWarning, saveState, actions } = useWorkspace();
  const [view, setView] = useState("today"); const [overlay, setOverlay] = useState<Overlay>(null); const [editingTask, setEditingTask] = useState<Task | null>(null); const [focusTaskId, setFocusTaskId] = useState<string | null>(null); const [focusActive, setFocusActive] = useState(false); const [undo, setUndo] = useState<UndoState | null>(null);
  const navigate = useCallback((target: string) => {
    if (target.startsWith("task:")) { const task = data.tasks.find((item) => item.id === target.slice(5)); if (task) setEditingTask(task); setView("tasks"); }
    else if (target.startsWith("project:")) setView(target);
    else if (target.startsWith("note:")) setView(target);
    else if (target.startsWith("capture:")) setView("inbox");
    else setView(target);
  }, [data.tasks]);
  const makeUndoable = (label: string, action: () => void) => { setUndo({ label, snapshot: data }); action(); };
  useEffect(() => { if (!undo) return; const timer = window.setTimeout(() => setUndo(null), 5500); return () => clearTimeout(timer); }, [undo]);
  useEffect(() => {
    const root = document.documentElement; const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { const dark = data.preferences.theme === "dark" || (data.preferences.theme === "system" && media.matches); root.dataset.theme = dark ? "dark" : "light"; };
    apply(); media.addEventListener("change", apply); return () => media.removeEventListener("change", apply);
  }, [data.preferences.theme]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOverlay("search"); return; }
      const target = event.target as HTMLElement; const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey || overlay || editingTask) return;
      if (event.key.toLowerCase() === "q") setOverlay("quick-add");
      if (event.key.toLowerCase() === "c") setOverlay("capture");
      if (event.key.toLowerCase() === "f") navigate("focus");
      if (event.key.toLowerCase() === "n") { const id = actions.addNote(); setView(`note:${id}`); }
    };
    document.addEventListener("keydown", keydown); return () => document.removeEventListener("keydown", keydown);
  }, [actions, editingTask, navigate, overlay]);
  const toggleTask = (task: Task) => makeUndoable(task.status === "COMPLETED" ? "Task reopened" : "Task completed", () => actions.completeTask(task.id));
  const deleteTask = (task: Task) => makeUndoable("Task deleted", () => actions.deleteTask(task.id));
  const deleteNote = (note: Note) => makeUndoable("Note deleted", () => { actions.deleteNote(note.id); if (view === `note:${note.id}`) setView("notes"); });
  const convertCapture = (capture: Capture, target: "task" | "note" | "project") => makeUndoable(`Capture converted to ${target}`, () => actions.convertCapture(capture.id, target));
  const startFocus = (task: Task) => { setFocusTaskId(task.id); setView("focus"); };
  const toggleTheme = () => actions.updatePreferences({ theme: document.documentElement.dataset.theme === "dark" ? "light" : "dark" });
  const initialNoteId = view.startsWith("note:") ? view.slice(5) : undefined;
  const projectId = view.startsWith("project:") ? view.slice(8) : null; const project = data.projects.find((item) => item.id === projectId);
  let content;
  if (!ready) content = <div className="loading-state"><span className="brand-mark" />Opening your workspace…</div>;
  else if (project) content = <ProjectDetail project={project} data={data} onBack={() => setView("projects")} onUpdate={(patch) => actions.updateProject(project.id, patch)} onToggle={toggleTask} onEditTask={setEditingTask} onAddTask={() => setOverlay("quick-add")} onOpenNote={(note) => setView(`note:${note.id}`)} />;
  else if (view === "today") content = <TodayView data={data} onAdd={() => setOverlay("quick-add")} onSearch={() => setOverlay("search")} onStartFocus={startFocus} onToggle={toggleTask} onEdit={setEditingTask} onNavigate={navigate} />;
  else if (view.startsWith("tasks")) content = <TasksView key={view} data={data} initialTab={view === "tasks-upcoming" ? "upcoming" : view === "tasks-overdue" ? "overdue" : "today"} onAdd={() => setOverlay("quick-add")} onToggle={toggleTask} onEdit={setEditingTask} onReorder={actions.reorder} onSaveView={actions.addSavedView} />;
  else if (view === "projects") content = <ProjectsView data={data} onOpen={(id) => setView(`project:${id}`)} onAdd={actions.addProject} />;
  else if (view === "notes" || initialNoteId) content = <NotesView key={initialNoteId ?? "notes"} notes={data.notes} projects={data.projects} initialId={initialNoteId} saveState={saveState} onAdd={actions.addNote} onCreated={(id) => setView(`note:${id}`)} onUpdate={actions.updateNote} onDelete={deleteNote} />;
  else if (view === "focus") content = <FocusView data={data} initialTaskId={focusTaskId} onRecord={actions.addFocusSession} onCapture={(value) => actions.addCapture(value, "thought")} onActiveChange={setFocusActive} />;
  else if (view === "inbox") content = <InboxView captures={data.captures} onAdd={() => setOverlay("capture")} onConvert={convertCapture} onDelete={(capture) => makeUndoable("Capture deleted", () => actions.deleteCapture(capture.id))} />;
  else if (view === "review") content = <ReviewView data={data} onPlan={() => setView("tasks-upcoming")} />;
  else content = <SettingsView preferences={data.preferences} storageBytes={workspaceRepository.size()} onUpdate={actions.updatePreferences} onReset={actions.reset} />;
  return <AppShell view={view} focusActive={focusActive} name={data.preferences.profileName} inboxCount={data.captures.filter((item) => !item.archivedAt).length} onNavigate={navigate} onQuickAdd={() => setOverlay("quick-add")} onSearch={() => setOverlay("search")}>
    {warning && <div className="storage-warning" role="status"><span>{warning}</span><button onClick={() => setWarning(null)}>Dismiss</button></div>}{content}
    {overlay === "quick-add" && <QuickAdd projects={data.projects} onAdd={actions.addTask} onClose={() => setOverlay(null)} />}
    {overlay === "capture" && <QuickCapture onAdd={actions.addCapture} onClose={() => setOverlay(null)} />}
    {overlay === "search" && <CommandPalette data={data} onClose={() => setOverlay(null)} onNavigate={navigate} onQuickAdd={() => setOverlay("quick-add")} onCapture={() => setOverlay("capture")} onNewNote={() => { const id = actions.addNote(); setView(`note:${id}`); }} onToggleTheme={toggleTheme} />}
    {editingTask && <TaskEditor task={data.tasks.find((task) => task.id === editingTask.id) ?? editingTask} projects={data.projects} onSave={(patch) => actions.updateTask(editingTask.id, patch)} onDelete={() => deleteTask(editingTask)} onDuplicate={() => actions.duplicateTask(editingTask.id)} onClose={() => setEditingTask(null)} />}
    {undo && <div className="undo-toast" role="status"><span>{undo.label}</span><button onClick={() => { actions.restore(undo.snapshot); setUndo(null); }}>Undo</button></div>}
  </AppShell>;
}
