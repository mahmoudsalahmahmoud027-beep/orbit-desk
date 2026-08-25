"use client";

import type { Capture } from "../../types/workspace";
import { humanDate } from "../../utils/dates";

export function InboxView({ captures, onAdd, onConvert, onDelete }: { captures: Capture[]; onAdd: () => void; onConvert: (capture: Capture, target: "task" | "note" | "project") => void; onDelete: (capture: Capture) => void }) {
  const active = captures.filter((capture) => !capture.archivedAt);
  return <div className="view"><header className="view-header"><div><p className="eyebrow">Organize it when you are ready</p><h1>Inbox</h1></div><button className="button primary" onClick={onAdd}>＋ Capture</button></header>{active.length ? <div className="capture-list">{active.map((capture) => <article key={capture.id}><div className="capture-top"><span>{capture.kind}</span><small>{humanDate(capture.createdAt.slice(0, 10))}</small></div><p>{capture.content}</p><div className="capture-actions"><span>Convert to</span><button onClick={() => onConvert(capture, "task")}>Task</button><button onClick={() => onConvert(capture, "note")}>Note</button><button onClick={() => onConvert(capture, "project")}>Project idea</button><button className="delete" onClick={() => onDelete(capture)}>Delete</button></div></article>)}</div> : <div className="empty-state large"><div className="empty-orbit" /><h2>Your inbox is clear.</h2><p>Capture ideas here before deciding where they belong.</p><button className="button primary" onClick={onAdd}>Save a thought</button></div>}</div>;
}
