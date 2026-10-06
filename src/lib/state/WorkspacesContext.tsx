"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Workspace } from "@/lib/types";
import { DEFAULT_WORKSPACES } from "@/lib/mockData";
import { readJSON, writeJSON } from "@/lib/storage";

const Ctx = createContext<{
  workspaces: Workspace[];
  activeId: string;
  active: Workspace;
  setActive: (id: string) => void;
} | null>(null);

export function WorkspacesProvider({ children }: { children: ReactNode }) {
  const [workspaces] = useState<Workspace[]>(
    () => readJSON<Workspace[]>("workspaces", DEFAULT_WORKSPACES),
  );
  const [activeId, setActiveId] = useState<string>(
    () => readJSON<string>("activeWorkspace", DEFAULT_WORKSPACES[0].id),
  );

  useEffect(() => writeJSON("activeWorkspace", activeId), [activeId]);

  const setActive = useCallback((id: string) => setActiveId(id), []);
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];

  return (
    <Ctx.Provider value={{ workspaces, activeId, active, setActive }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspaces() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspaces outside provider");
  return ctx;
}