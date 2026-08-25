import { createDemoWorkspace } from "../data/seed.ts";
import type { WorkspaceData } from "../types/workspace.ts";

export const WORKSPACE_KEY = "orbit-desk:workspace";
export const RECOVERY_PREFIX = "orbit-desk:recovery:";

const isWorkspace = (value: unknown): value is WorkspaceData => {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<WorkspaceData>;
  return data.version === 1 && Array.isArray(data.tasks) && Array.isArray(data.projects) && Array.isArray(data.notes) && Array.isArray(data.captures) && Array.isArray(data.focusSessions) && !!data.preferences;
};

export interface LoadResult { data: WorkspaceData; warning: string | null; recoveredRaw: boolean; }

export const workspaceRepository = {
  load(): LoadResult {
    if (typeof window === "undefined") return { data: createDemoWorkspace(), warning: null, recoveredRaw: false };
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return { data: createDemoWorkspace(), warning: null, recoveredRaw: false };
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isWorkspace(parsed)) return { data: parsed, warning: null, recoveredRaw: false };
      throw new Error("The saved workspace has an unsupported shape.");
    } catch {
      try { localStorage.setItem(`${RECOVERY_PREFIX}${Date.now()}`, raw); } catch { /* data remains in the main key */ }
      return { data: createDemoWorkspace(), warning: "Orbit Desk could not read the saved workspace. The original data was preserved in recovery storage.", recoveredRaw: true };
    }
  },
  save(data: WorkspaceData) {
    if (typeof window === "undefined") return false;
    try { localStorage.setItem(WORKSPACE_KEY, JSON.stringify(data)); return true; } catch { return false; }
  },
  size() {
    if (typeof window === "undefined") return 0;
    return new Blob([localStorage.getItem(WORKSPACE_KEY) ?? ""]).size;
  },
};
