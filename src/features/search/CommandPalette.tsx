"use client";

import { useState } from "react";
import type { WorkspaceData } from "../../types/workspace";
import { searchWorkspace } from "../../utils/domain";
import { Modal } from "../../components/Modal";

interface Command { id: string; title: string; hint: string; run: () => void; }
export function CommandPalette({ data, onClose, onNavigate, onQuickAdd, onCapture, onNewNote, onToggleTheme }: { data: WorkspaceData; onClose: () => void; onNavigate: (view: string) => void; onQuickAdd: () => void; onCapture: () => void; onNewNote: () => void; onToggleTheme: () => void }) {
  const [query, setQuery] = useState(""); const [active, setActive] = useState(0);
  const commands: Command[] = [{ id:"create-task", title:"Create task", hint:"Q", run:onQuickAdd },{ id:"create-note", title:"Create note", hint:"N", run:onNewNote },{ id:"capture", title:"Quick capture", hint:"C", run:onCapture },{ id:"focus", title:"Start focus", hint:"F", run:()=>onNavigate("focus") },{ id:"today", title:"Open Today", hint:"", run:()=>onNavigate("today") },{ id:"upcoming", title:"Open Upcoming", hint:"", run:()=>onNavigate("tasks-upcoming") },{ id:"theme", title:"Toggle theme", hint:"", run:onToggleTheme },{ id:"search", title:"Search workspace", hint:"", run:()=>setQuery(" ") }];
  const results = query.trim() ? searchWorkspace(data, query).map((result) => ({ id:`${result.type}:${result.id}`, title:result.title, hint:result.type, run:()=>onNavigate(`${result.type.toLowerCase()}:${result.id}`) })) : commands;
  const run = (item?: Command) => { if (!item) return; item.run(); if (item.id !== "search") onClose(); };
  return <Modal title="Command palette" onClose={onClose} compact><div className="command-palette"><input value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(results.length - 1, value + 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(0, value - 1)); } if (event.key === "Enter") run(results[active]); }} placeholder="Search workspace or run a command…" aria-label="Search workspace" /><div className="command-results"><p>{query.trim() ? "Workspace" : "Commands"}</p>{results.length ? results.map((item, index) => <button className={index === active ? "active" : ""} onMouseEnter={() => setActive(index)} onClick={() => run(item)} key={item.id}><span>{item.title}</span><kbd>{item.hint}</kbd></button>) : <div className="no-results">No matches. Try a task, project, or note title.</div>}</div><footer><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></footer></div></Modal>;
}
