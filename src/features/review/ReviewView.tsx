"use client";

import type { WorkspaceData } from "../../types/workspace";
import { addDays, dateKey } from "../../utils/dates";
import { projectProgress } from "../../utils/domain";

export function ReviewView({ data, onPlan }: { data: WorkspaceData; onPlan: () => void }) {
  const since = addDays(-7); const completed = data.tasks.filter((task) => task.completedAt && task.completedAt.slice(0,10) >= since); const remaining = data.tasks.filter((task) => task.status === "OPEN"); const sessions = data.focusSessions.filter((session) => session.startedAt.slice(0,10) >= since && session.outcome === "FINISHED"); const moved = data.projects.filter((project) => projectProgress(project.id, completed).completed > 0);
  return <div className="view review-view"><header className="view-header"><div><p className="eyebrow">{since} — {dateKey()}</p><h1>Weekly Review</h1></div><button className="button primary" onClick={onPlan}>Plan next week</button></header><p className="review-intro">A simple look at what moved and what still needs a decision.</p><div className="review-lines"><div><span>Completed</span><b>{completed.length}</b><small>tasks finished</small></div><div><span>Remaining</span><b>{remaining.length}</b><small>open tasks</small></div><div><span>Projects</span><b>{moved.length}</b><small>moved forward</small></div><div><span>Focus</span><b>{sessions.length}</b><small>completed sessions</small></div></div><section className="review-section"><h2>Unfinished work</h2>{remaining.length ? <div>{remaining.slice(0, 6).map((task) => <p key={task.id}>{task.title}<span>{task.dueDate ?? "No deadline"}</span></p>)}</div> : <div className="inline-empty"><p>No unfinished tasks.</p></div>}</section></div>;
}
