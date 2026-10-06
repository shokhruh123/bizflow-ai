"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FileText,
  LayoutDashboard,
  Search,
  WandSparkles,
  MonitorCog,
  CreditCard,
  PackageOpen,
  Languages,
  Moon,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useCommandMenu } from "@/lib/state/CommandContext";
import { useTheme } from "@/lib/state/ThemeContext";
import { useWorkspaces } from "@/lib/state/WorkspacesContext";
import { useOrders } from "@/lib/state/OrdersContext";
import { useNotifications } from "@/lib/state/NotificationsContext";
import { switchLocale } from "@/lib/app/i18n-bootstrap";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  group: "navigate" | "actions";
  keywords?: string;
  run?: () => void;
}

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { toggle } = useTheme();
  const { workspaces, activeId, setActive } = useWorkspaces();
  const { activeOrders, exportOrdersCsv } = useOrders();
  const { add } = useNotifications();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const locale = i18n.language as "uz" | "ru" | "en";
  const localeIdx = LOCALES.findIndex((l) => l.code === locale);
  const nextLang = LOCALES[(localeIdx + 1) % LOCALES.length].code;

  const items = useMemo<Item[]>(() => {
    const nav = (href: string, key: string, icon: Item["icon"]) => ({
      id: href,
      label: t(`nav.${key}`),
      href,
      icon,
      group: "navigate" as const,
      keywords: href,
    });
    return [
      nav("/app", "dashboard", LayoutDashboard),
      nav("/app/orders", "orders", PackageOpen),
      nav("/app/converter", "converter", WandSparkles),
      nav("/app/billing", "billing", CreditCard),
      nav("/app/settings", "settings", MonitorCog),
      {
        id: "action-new-order",
        label: t("cmd.newOrder"),
        icon: WandSparkles,
        group: "actions",
        run: () => router.push("/app/converter"),
      },
      {
        id: "action-report",
        label: t("cmd.report"),
        icon: FileText,
        group: "actions",
        run: () => {
          if (activeOrders.length === 0) {
            add("info", t("orders.empty.title"));
          } else {
            exportOrdersCsv(activeOrders);
            add("success", t("orders.exportedCsv"));
          }
        },
      },
      {
        id: "action-workspace",
        label: t("cmd.switchWorkspace"),
        icon: Building2,
        group: "actions",
        run: () => {
          const idx = workspaces.findIndex((w) => w.id === activeId);
          const next = workspaces[(idx + 1) % workspaces.length];
          setActive(next.id);
        },
      },
      {
        id: "action-theme",
        label: t("cmd.toggleTheme"),
        icon: Moon,
        group: "actions",
        run: toggle,
      },
      {
        id: "action-billing",
        label: t("cmd.gotoBilling"),
        icon: CreditCard,
        group: "actions",
        keywords: "pay plan",
        run: () => router.push("/app/billing"),
      },
      {
        id: "action-lang",
        label: t("cmd.toggleLang", { lang: nextLang }),
        icon: Languages,
        group: "actions",
        run: () => switchLocale(nextLang),
      },
    ];
  }, [t, router, activeOrders, exportOrdersCsv, add, workspaces, activeId, setActive, toggle, nextLang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            (i.keywords ?? "").toLowerCase().includes(q),
        )
      : items;
    return {
      navigate: list.filter((i) => i.group === "navigate"),
      actions: list.filter((i) => i.group === "actions"),
    };
  }, [query, items]);

  const flat = [...filtered.navigate, ...filtered.actions];

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setSel(0), [query]);

  const run = (item: Item) => {
    setOpen(false);
    if (item.href) router.push(item.href);
    item.run?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, flat.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && flat[sel]) {
                run(flat[sel]);
              }
            }}
            placeholder={t("cmd.placeholder")}
            className="h-12 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
          <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {flat.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-zinc-400">{t("cmd.empty")}</p>
          )}
          {filtered.navigate.length > 0 && (
            <Section label={t("cmd.groups.navigate")}>
              {filtered.navigate.map((item) => (
                <Row key={item.id} item={item} selected={sel === flat.indexOf(item)} onRun={() => run(item)} onHover={() => setSel(flat.indexOf(item))} />
              ))}
            </Section>
          )}
          {filtered.actions.length > 0 && (
            <Section label={t("cmd.groups.actions")}>
              {filtered.actions.map((item) => (
                <Row key={item.id} item={item} selected={sel === flat.indexOf(item)} onRun={() => run(item)} onHover={() => setSel(flat.indexOf(item))} />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function Row({
  item,
  selected,
  onRun,
  onHover,
}: {
  item: Item;
  selected: boolean;
  onRun: () => void;
  onHover: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onMouseEnter={onHover}
      onClick={(e) => e.type === "click" && onRun()}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
        selected
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          : "text-zinc-600 dark:text-zinc-300",
      )}
    >
      <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
      <span className="flex-1">{item.label}</span>
      {item.href && <ArrowRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />}
    </button>
  );
}