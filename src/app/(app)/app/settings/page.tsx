"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User, Monitor, Trash2, ShieldAlert } from "lucide-react";
import { Card, Button, Field, Input, Badge } from "@/components/ui";
import { useSession } from "@/lib/state/SessionContext";
import { useTheme } from "@/lib/state/ThemeContext";
import { useCurrency } from "@/lib/state/CurrencyContext";
import { useNotifications } from "@/lib/state/NotificationsContext";
import { LOCALES, resolveLocale } from "@/lib/i18n";
import { switchLocale } from "@/lib/app/i18n-bootstrap";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { session, refresh } = useSession();
  const user = session.user;
  const { theme, set } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { add } = useNotifications();

  const [name, setName] = useState(user?.name || user?.login || "");
  const [login, setLogin] = useState(user?.login || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const locale = resolveLocale(i18n.language);

  async function saveProfile() {
    if (!user) return;
    if (!login.trim()) {
      add("error", t("auth.errors.required"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), login: login.trim() }),
      });
      if (!res.ok) {
        add("error", t("auth.errors.generic"));
        return;
      }
      await refresh();
      add("success", t("set.saved"));
    } catch {
      add("error", t("auth.errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  function clearDemo() {
    try {
      const prefix = "bizflow:";
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    add("info", t("set.cleared"));
    window.location.reload();
  }

  const Seg = ({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition",
            value === o.value
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("set.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("set.subtitle")}</p>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("set.profile")}</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("set.name")}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t("set.login")}>
            <Input value={login} onChange={(e) => setLogin(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t("set.email")}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={saveProfile} loading={saving}>{t("common.action.save")}</Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("set.appearance")}</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("set.theme")}</p>
            <Seg
              value={theme}
              onChange={(v) => set(v === "dark" ? "dark" : "light")}
              options={[
                { value: "light", label: t("set.light") },
                { value: "dark", label: t("set.dark") },
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("set.language")}</p>
            <Seg
              value={locale}
              onChange={(v) => switchLocale(v as "uz" | "ru" | "en")}
              options={LOCALES.map((l) => ({ value: l.code, label: l.flag }))}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("set.currencyDefault")}</p>
            <Seg
              value={currency}
              onChange={(v) => setCurrency(v === "USD" ? "USD" : "UZS")}
              options={[
                { value: "UZS", label: "UZS" },
                { value: "USD", label: "USD" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card className="border-red-200 p-5 dark:border-red-800/40">
        <div className="mb-1 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("set.danger")}</h3>
          <Badge variant="warning">demo</Badge>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("set.clearData")}</p>
        <Button variant="danger" className="mt-3" onClick={clearDemo}>
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          {t("set.clearData")}
        </Button>
      </Card>
    </div>
  );
}