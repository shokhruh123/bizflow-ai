"use client";

import { LogOut, MonitorCog, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/state/SessionContext";
import { Menu, Avatar } from "@/components/ui";

export function UserMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, signOut } = useSession();
  const user = session.user;

  if (!user) return null;
  const name = user.name || user.login || user.email?.split("@")[0] || "User";

  return (
    <Menu
      trigger={
        <button className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Avatar name={name} size={28} />
        </button>
      }
      align="end"
    >
      <div className="px-3 py-2">
        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{user.email}</p>
      </div>
      <Menu.Divider />
      <Menu.Item onSelect={() => router.push("/app/settings")}>
        <MonitorCog className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        {t("nav.settings")}
      </Menu.Item>
      <Menu.Item onSelect={() => router.push("/app/billing")}>
        <CreditCard className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        {t("nav.billing")}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        danger
        onSelect={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          await signOut();
          router.replace("/login");
        }}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        {t("auth.signOut")}
      </Menu.Item>
    </Menu>
  );
}