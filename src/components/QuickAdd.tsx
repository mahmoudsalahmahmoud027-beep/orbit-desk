"use client";

import { useMemo, useState } from "react";
import type { Project, Task } from "../types/workspace";
import { addDays, dateKey } from "../utils/dates";
import { Modal } from "./Modal";

function parseTitle(value: string) {
  const tomorrow = /\s+tomorrow\s*$/i.test(value);
  const today = /\s+today\s*$/i.test(value);
  return { title: value.replace(/\s+(tomorrow|today)\s*$/i, "").trim(), scheduledDate: tomorrow ? addDays(1) : today ? dateKey() : null, label: tomorrow ? "Tomorrow" : today ? "Today" : null };
}

export function QuickAdd({ projects, onAdd, onClose }: { projects: Project[]; onAdd: (task: Partial<Task> & Pick<Task, "title">) => void; onClose: () => void }) {
  const [value, setValue] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("NONE");
  const parsed = useMemo(() => parseTitle(value), [value]);
  const submit = () => { if (!parsed.title) return; onAdd({ title: parsed.title, scheduledDate: parsed.scheduledDate, projectId: projectId || null, priority }); onClose(); };
  return <Modal title="Quick add" onClose={onClose} compact><div className="quick-form"><input className="hero-input" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder="Add a task…" aria-label="Task title" /><div className="parsed-row">{parsed.label && <span className="meta-chip">◷ {parsed.label}</span>}<span className="hint">Try “Finish presentation tomorrow”</span></div><div className="form-footer"><div className="inline-fields"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} aria-label="Project"><option value="">No project</option>{projects.filter((project) => project.status === "ACTIVE").map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select><select value={priority} onChange={(event) => setPriority(event.target.value as Task["priority"])} aria-label="Priority"><option value="NONE">No priority</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div><button className="button primary" onClick={submit} disabled={!parsed.title}>Add task</button></div></div></Modal>;
}

export function QuickCapture({ onAdd, onClose }: { onAdd: (content: string, kind: "idea" | "reminder" | "thought" | "link") => void; onClose: () => void }) {
  const [value, setValue] = useState(""); const [kind, setKind] = useState<"idea" | "reminder" | "thought" | "link">("thought");
  const submit = () => { if (!value.trim()) return; onAdd(value.trim(), kind); onClose(); };
  return <Modal title="Quick capture" onClose={onClose} compact><div className="quick-form"><textarea className="capture-input" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit(); }} placeholder="Save a thought without organizing it yet…" /><div className="form-footer"><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} aria-label="Capture type"><option value="thought">Thought</option><option value="idea">Idea</option><option value="reminder">Reminder</option><option value="link">Link</option></select><button className="button primary" onClick={submit} disabled={!value.trim()}>Save capture</button></div></div></Modal>;
}
