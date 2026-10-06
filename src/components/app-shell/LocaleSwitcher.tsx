"use client";

import { useTranslation } from "react-i18next";
import { Languages, Check } from "lucide-react";
import { resolveLocale, LOCALES } from "@/lib/i18n";
import { switchLocale } from "@/lib/app/i18n-bootstrap";
import { Menu } from "@/components/ui";

export function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const locale = resolveLocale(i18n.language);

  return (
    <Menu
      trigger={
        <button className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
          <Languages className="h-[15px] w-[15px]" strokeWidth={1.5} />
          <span className="text-xs font-medium uppercase">{locale}</span>
        </button>
      }
      align="end"
    >
      {LOCALES.map((l) => (
        <Menu.Item
          key={l.code}
          onSelect={() => switchLocale(l.code)}
          trailing={
            l.code === locale ? <Check className="h-4 w-4" strokeWidth={1.5} /> : undefined
          }
        >
          <span className="flex h-5 w-5 items-center justify-center text-sm">{l.flag}</span>
          {l.label}
        </Menu.Item>
      ))}
    </Menu>
  );
}