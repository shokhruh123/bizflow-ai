"use client";

import { Check, CircleAlert, CreditCard, Info, Bell, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/lib/state/NotificationsContext";
import { Menu, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const ICONS = {
  success: Check,
  billing: CreditCard,
  info: Info,
  error: CircleAlert,
} as const;

export function NotificationsButton() {
  const { t } = useTranslation();
  const { items, unreadCount, markAllRead, clearAll } = useNotifications();

  return (
    <Menu
      trigger={
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            </span>
          )}
        </button>
      }
      align="end"
      width={320}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
          {t("notif.title")}
        </p>
        {items.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-medium text-zinc-400 transition hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {t("notif.markAll")}
          </button>
        )}
      </div>
      <Menu.Divider />
      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 && (
          <div className="px-3 py-8 text-center">
            <Bell className="mx-auto h-5 w-5 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
            <p className="mt-2 text-sm text-zinc-400">{t("notif.empty")}</p>
          </div>
        )}
        {items.map((item) => {
          const Icon = ICONS[item.kind] ?? Info;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5",
                item.read ? "opacity-60" : "",
              )}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Icon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" strokeWidth={1.5} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
                )}
                {!item.read && <Badge className="mt-1.5">{t("notif.new")}</Badge>}
              </div>
              <span className="mt-0.5 text-[10px] text-zinc-300 dark:text-zinc-600">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
      {items.length > 0 && (
        <>
          <Menu.Divider />
          <button
            onClick={clearAll}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-400 transition hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            {t("notif.clearAll")}
          </button>
        </>
      )}
    </Menu>
  );
}