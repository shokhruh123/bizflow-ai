"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Workflow } from "lucide-react";
import { LOCALES, resolveLocale } from "@/lib/i18n";
import { switchLocale } from "@/lib/app/i18n-bootstrap";
import { cn } from "@/lib/utils";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const locale = resolveLocale(i18n.language);

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Workflow className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Bizflow
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition",
                locale === l.code
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {l.flag}
            </button>
          ))}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm">{footer}</div>}
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
        Bizflow · {t("common2.brandName")} — {t("auth.demoMode")}
      </footer>
    </div>
  );
}