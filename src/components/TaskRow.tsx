"use client";

import type { Project, Task } from "../types/workspace";
import { humanDate } from "../utils/dates";

export function TaskRow({ task, projects, onToggle, onEdit, draggable = false, onDragStart, onDrop }: { task: Task; projects: Project[]; onToggle: () => void; onEdit: () => void; draggable?: boolean; onDragStart?: () => void; onDrop?: () => void }) {
  const project = projects.find((item) => item.id === task.projectId);
  return <div className={`task-row ${task.status === "COMPLETED" ? "is-complete" : ""}`} draggable={draggable} onDragStart={onDragStart} onDragOver={(event) => draggable && event.preventDefault()} onDrop={onDrop}>
    {draggable && <span className="drag-handle" aria-hidden="true">⠿</span>}
    <button className="task-check" onClick={onToggle} aria-label={task.status === "COMPLETED" ? `Reopen ${task.title}` : `Complete ${task.title}`}>{task.status === "COMPLETED" && "✓"}</button>
    <button className="task-main" onClick={onEdit}><span className="task-title">{task.title}</span><span className="task-meta">{project?.name ?? "No project"}{task.tags.length ? ` · ${task.tags.join(", ")}` : ""}</span></button>
    {task.priority !== "NONE" && <span className={`priority-dot ${task.priority.toLowerCase()}`} title={`${task.priority.toLowerCase()} priority`} />}
    <span className={`task-date ${task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10) && task.status === "OPEN" ? "overdue" : ""}`}>{task.dueDate ? humanDate(task.dueDate) : task.estimatedMinutes ? `${task.estimatedMinutes} min` : ""}</span>
    <button className="row-more" onClick={onEdit} aria-label={`Edit ${task.title}`}>•••</button>
  </div>;
}
