"use client";

import { Menu, Moon, Sun, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/state/ThemeContext";
import { useCommandMenu } from "@/lib/state/CommandContext";
import { NAV_ITEMS } from "./Sidebar";
import { NotificationsButton } from "./NotificationsButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { UserMenu } from "./UserMenu";

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { setOpen } = useCommandMenu();

  const current =
    NAV_ITEMS.find((i) => i.href === pathname) ??
    NAV_ITEMS.find((i) => pathname.startsWith(i.href));

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-zinc-100 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <button
        onClick={onOpenMobile}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Menu className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <h1 className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
        {current ? t(`nav.${current.key}`) : ""}
      </h1>

      <button
        onClick={() => setOpen(true)}
        className="ml-auto hidden h-8 w-64 items-center gap-2 rounded-lg border border-zinc-200 px-2.5 text-[13px] text-zinc-400 transition hover:bg-zinc-50 sm:flex dark:border-zinc-800 dark:hover:bg-zinc-800/50"
      >
        <Search className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
        <span className="flex-1 text-left">{t("cmd.placeholder")}</span>
        <span className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-700">
          ⌘K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1 sm:ml-2">
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label={t("nav.toggleTheme")}
        >
          {theme === "dark" ? <Sun className="h-[17px] w-[17px]" strokeWidth={1.5} /> : <Moon className="h-[17px] w-[17px]" strokeWidth={1.5} />}
        </button>
        <LocaleSwitcher />
        <NotificationsButton />
        <UserMenu />
      </div>
    </header>
  );
}