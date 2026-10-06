"use client";

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspaces } from "@/lib/state/WorkspacesContext";
import { Menu } from "@/components/ui";

export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const { workspaces, activeId, setActive } = useWorkspaces();
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];

  if (!active) return null;

  return (
    <Menu
      trigger={
        <button className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-2 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
              {active.name === "personal" ? t("workspace.personal") : active.name}
            </p>
<p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {t("workspace.workspaces")}
          </p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
        </button>
      }
      align="start"
    >
      <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {t("workspace.workspaces")}
      </p>
      {workspaces.map((w) => (
        <Menu.Item
          key={w.id}
          onSelect={() => setActive(w.id)}
          trailing={w.id === activeId ? <Check className="h-4 w-4" strokeWidth={1.5} /> : undefined}
        >
          <Building2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          {w.name === "personal" ? t("workspace.personal") : w.name}
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item
        onSelect={() => setActive("ws_company")}
        leading={undefined}
      >
        <Plus className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        {t("workspace.addWorkspace")}
      </Menu.Item>
    </Menu>
  );
}