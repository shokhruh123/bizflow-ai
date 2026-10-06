"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthShell from "@/components/auth/AuthShell";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/i18n";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getErrorMessage(data?.code ?? "generic"));
        setLoading(false);
        return;
      }
      sessionStorage.setItem("bf_pending_email", email);
      if (data?.demoOtp) sessionStorage.setItem("bf_pending_otp", data.demoOtp);
      router.replace(`/verify?mode=register&email=${encodeURIComponent(email)}`);
    } catch {
      setError(t("auth.errors.generic"));
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        <Field label={t("auth.register.login")}>
          <Input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            placeholder="avaz"
            required
          />
        </Field>
        <Field label={t("auth.register.email")}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.uz"
            required
          />
        </Field>
        <Field label={t("auth.register.password")}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          {t("auth.register.signUp")}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link
          href="/login"
          className="font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {t("auth.register.haveAccount")} {t("auth.register.signIn")}
        </Link>
      </div>
    </AuthShell>
  );
}