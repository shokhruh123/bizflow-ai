"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthShell from "@/components/auth/AuthShell";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/i18n";

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const expired = params.get("expired") === "1";
  const next = params.get("next") ?? "/app";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.needsVerification) {
          sessionStorage.setItem("bf_pending_email", email);
          if (data.demoOtp) sessionStorage.setItem("bf_pending_otp", data.demoOtp);
          router.replace(`/verify?mode=register&email=${encodeURIComponent(email)}`);
          return;
        }
        setError(getErrorMessage(data?.code ?? "generic"));
        setLoading(false);
        return;
      }
      router.replace(next);
    } catch {
      setError(t("auth.errors.generic"));
      setLoading(false);
    }
  }

  return (
    <>
      {expired && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          {t("auth.login.sessionExpired")}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        <Field label={t("auth.login.email")}>
          <Input
            type="email"
            name="email"
            autoComplete="username"
            autoCapitalize="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.uz"
            required
          />
        </Field>
        <Field label={t("auth.login.password")}>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          {t("auth.login.signIn")}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link
          href="/register"
          className="font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {t("auth.login.noAccount")} {t("auth.login.signUp")}
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <AuthShell
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}