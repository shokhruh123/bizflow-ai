"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageOpen,
  WandSparkles,
  CreditCard,
  MonitorCog,
  Workflow,
  X,
  CheckCircle2,
  Bot,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandMenu } from "@/lib/state/CommandContext";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export const NAV_ITEMS = [
  { href: "/app", key: "dashboard", icon: LayoutDashboard },
  { href: "/app/orders", key: "orders", icon: PackageOpen },
  { href: "/app/converter", key: "converter", icon: WandSparkles },
  { href: "/app/assistant", key: "assistant", icon: Bot },
  { href: "/app/logistics", key: "logistics", icon: Route },
  { href: "/app/billing", key: "billing", icon: CreditCard },
  { href: "/app/settings", key: "settings", icon: MonitorCog },
] as const;

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { setOpen } = useCommandMenu();

  const content = (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Workflow className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Bizflow
          </span>
        </Link>
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1 text-zinc-400 transition hover:text-zinc-900 md:hidden dark:hover:text-zinc-100"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-3 pb-2 pt-2">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 px-3 py-2">
        <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {t("nav.workspace")}
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-100",
                )}
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.5} />
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-100"
        >
          <CheckCircle2 className="h-[17px] w-[17px]" strokeWidth={1.5} />
          {t("nav.cmdHint")}
          <span className="ml-auto rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-700">
            ⌘K
          </span>
        </button>
        <Link
          href="/app/billing"
          onClick={onCloseMobile}
          className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-100"
        >
          <CreditCard className="h-[17px] w-[17px]" strokeWidth={1.5} />
          {t("nav.upgrade")}
        </Link>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{t("nav.online")}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-60 shrink-0 border-r border-zinc-100 md:block dark:border-zinc-800">
        {content}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/40"
            onClick={onCloseMobile}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-zinc-200 shadow-xl dark:border-zinc-800">
            {content}
          </div>
        </div>
      )}
    </>
  );
}