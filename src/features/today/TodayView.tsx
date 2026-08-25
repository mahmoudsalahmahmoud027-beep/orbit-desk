"use client";

import type { Task, WorkspaceData } from "../../types/workspace";
import { addDays, dateKey, fullToday, greeting, humanDate } from "../../utils/dates";
import { chooseNextTask, nextReason } from "../../utils/domain";
import { TaskRow } from "../../components/TaskRow";

export function TodayView({ data, onAdd, onSearch, onStartFocus, onToggle, onEdit, onNavigate }: { data: WorkspaceData; onAdd: () => void; onSearch: () => void; onStartFocus: (task: Task) => void; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onNavigate: (view: string) => void }) {
  const today = dateKey();
  const todayTasks = data.tasks.filter((task) => task.status === "OPEN" && task.scheduledDate === today).sort((a, b) => a.sortOrder - b.sortOrder);
  const overdue = data.tasks.filter((task) => task.status === "OPEN" && !!task.dueDate && task.dueDate < today);
  const later = data.tasks.filter((task) => task.status === "OPEN" && task.scheduledDate === addDays(1)).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3);
  const next = chooseNextTask(data.tasks, data.projects);
  const nextProject = next && data.projects.find((project) => project.id === next.projectId);
  const minutes = todayTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0);
  const recentNote = [...data.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  return <div className="view today-view"><header className="view-header today-header"><div><p className="eyebrow">{fullToday()}</p><h1>{greeting()}{data.preferences.profileName ? `, ${data.preferences.profileName}` : ""}</h1></div><div className="header-actions"><button className="button quiet" onClick={onSearch}>⌕ Search</button><button className="button primary" onClick={onAdd}>＋ Add</button></div></header>
    {data.tasks.length === 0 ? <EmptyToday onAdd={onAdd} /> : <>
      {overdue.length > 0 && <button className="overdue-notice" onClick={() => onNavigate("tasks-overdue")}><span><b>{overdue.length} overdue</b><small>Take a moment to review what still matters.</small></span><strong>Review →</strong></button>}
      {next && <section className="next-block"><div className="section-label"><span>Next</span><small>{nextReason(next)}</small></div><div className="next-task"><div><p>{next.title}</p><span>{nextProject?.name ?? "Personal"}{next.estimatedMinutes ? ` · ${next.estimatedMinutes} min` : ""}</span></div><button onClick={() => onStartFocus(next)}>Start focus <span>→</span></button></div></section>}
      <section className="content-section"><div className="section-heading"><h2>Today</h2><span>{todayTasks.length} {todayTasks.length === 1 ? "task" : "tasks"}{minutes ? ` · ${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} hr ` : ""}${minutes % 60 ? `${minutes % 60} min` : ""}` : ""}</span></div><div className="task-list">{todayTasks.length ? todayTasks.map((task) => <TaskRow key={task.id} task={task} projects={data.projects} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} />) : <div className="inline-empty"><p>Nothing scheduled for today.</p><button onClick={onAdd}>Add a task</button></div>}</div></section>
      {later.length > 0 && <section className="content-section later-section"><div className="section-heading"><h2>Later</h2><span>Tomorrow</span></div><div className="task-list subdued">{later.map((task) => <TaskRow key={task.id} task={task} projects={data.projects} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} />)}</div></section>}
      <div className="today-bottom"><section className="upcoming-panel"><span className="section-kicker">Upcoming</span><p>{later[0]?.title ?? data.projects.find((project) => project.deadline)?.name ?? "Plan the week ahead"}</p><small>{later[0]?.dueDate ? humanDate(later[0].dueDate) : "Open planning"}</small><button onClick={() => onNavigate("tasks-upcoming")}>View upcoming →</button></section>{recentNote && <button className="recent-panel" onClick={() => onNavigate(`note:${recentNote.id}`)}><span className="section-kicker">Recent note</span><p>{recentNote.title}</p><small>Edited {humanDate(recentNote.updatedAt.slice(0, 10))}</small></button>}</div>
    </>}
  </div>;
}

function EmptyToday({ onAdd }: { onAdd: () => void }) { return <div className="empty-state large"><div className="empty-orbit" /><h2>Nothing scheduled for today.</h2><p>Keep the day open or add one clear next step.</p><button className="button primary" onClick={onAdd}>Add a task</button></div>; }
