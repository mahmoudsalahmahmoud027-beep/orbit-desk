"use client";

import { useMemo, useState } from "react";
import type { SavedView, Task, WorkspaceData } from "../../types/workspace";
import { addDays, dateKey } from "../../utils/dates";
import { TaskRow } from "../../components/TaskRow";

type TaskTab = "today" | "upcoming" | "all" | "completed" | "overdue";
export function TasksView({ data, initialTab = "today", onAdd, onToggle, onEdit, onReorder, onSaveView }: { data: WorkspaceData; initialTab?: TaskTab; onAdd: () => void; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onReorder: (from: string, to: string) => void; onSaveView: (view: SavedView) => void }) {
  const [tab, setTab] = useState<TaskTab>(initialTab); const [query, setQuery] = useState(""); const [priority, setPriority] = useState<Task["priority"] | "ANY">("ANY"); const [projectId, setProjectId] = useState(""); const [tag, setTag] = useState(""); const [dragId, setDragId] = useState<string | null>(null);
  const tags = [...new Set(data.tasks.flatMap((task) => task.tags))];
  const tasks = useMemo(() => data.tasks.filter((task) => {
    const today = dateKey();
    const tabMatch = tab === "today" ? task.status === "OPEN" && task.scheduledDate === today : tab === "upcoming" ? task.status === "OPEN" && !!task.scheduledDate && task.scheduledDate > today : tab === "completed" ? task.status === "COMPLETED" : tab === "overdue" ? task.status === "OPEN" && !!task.dueDate && task.dueDate < today : task.status !== "CANCELLED";
    return tabMatch && (!query || `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase())) && (priority === "ANY" || task.priority === priority) && (!projectId || task.projectId === projectId) && (!tag || task.tags.includes(tag));
  }).sort((a, b) => a.sortOrder - b.sortOrder), [data.tasks, tab, query, priority, projectId, tag]);
  const saveView = () => { const name = window.prompt("Name this saved view"); if (name?.trim()) onSaveView({ id: crypto.randomUUID(), name: name.trim(), priority, projectId: projectId || null, tag: tag || null }); };
  const applyView = (view: SavedView) => { setPriority(view.priority); setProjectId(view.projectId ?? ""); setTag(view.tag ?? ""); setTab("all"); };
  return <div className="view wide-view"><header className="view-header"><div><p className="eyebrow">Plan and follow through</p><h1>Tasks</h1></div><button className="button primary" onClick={onAdd}>＋ Add task</button></header><div className="tabs" role="tablist">{(["today", "upcoming", "all", "completed"] as TaskTab[]).map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    <div className="filterbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /><select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}><option value="ANY">Any priority</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option><option value="NONE">None</option></select><select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">All projects</option>{data.projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select>{tags.length > 0 && <select value={tag} onChange={(event) => setTag(event.target.value)}><option value="">All tags</option>{tags.map((item) => <option key={item}>{item}</option>)}</select>}<button className="button quiet save-view" onClick={saveView}>Save view</button></div>
    {data.savedViews.length > 0 && <div className="saved-views"><span>Saved</span>{data.savedViews.map((view) => <button key={view.id} onClick={() => applyView(view)}>{view.name}</button>)}</div>}
    <div className="list-summary"><span>{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>{tab === "upcoming" && <small>Next 7 days: {tasks.filter((task) => task.scheduledDate && task.scheduledDate <= addDays(7)).length}</small>}</div><div className="task-list full">{tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} projects={data.projects} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} draggable={tab === "all"} onDragStart={() => { setDragId(task.id); }} onDrop={() => { if (dragId) onReorder(dragId, task.id); setDragId(null); }} />) : <div className="empty-state"><h2>{tab === "completed" ? "No completed tasks yet." : "No tasks match this view."}</h2><p>{tab === "completed" ? "Completed work will appear here." : "Change a filter or add a task."}</p>{tab !== "completed" && <button className="button primary" onClick={onAdd}>Add a task</button>}</div>}</div>
  </div>;
}
