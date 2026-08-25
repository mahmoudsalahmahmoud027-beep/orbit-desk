"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ title, children, onClose, compact = false }: { title: string; children: ReactNode; onClose: () => void; compact?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = panel.current;
    root?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>("button, input, textarea, select, [tabindex]:not([tabindex='-1'])")].filter((item) => !item.hasAttribute("disabled"));
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div ref={panel} className={`modal-panel ${compact ? "compact" : ""}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}</div></div>;
}
