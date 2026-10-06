"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthShell from "@/components/auth/AuthShell";
import { Button, Field, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/i18n";

function VerifyForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") === "login" ? "login" : "register";
  const paramEmail = params.get("email") ?? "";
  const [email, setEmail] = useState("");

  const [code, setCode] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const initialEmail = paramEmail || sessionStorage.getItem("bf_pending_email") || "";
    setEmail(initialEmail);
    const otp = sessionStorage.getItem("bf_pending_otp");
    if (otp) setDemoOtp(otp);
    sessionStorage.removeItem("bf_pending_email");
    sessionStorage.removeItem("bf_pending_otp");

    // Always try to refresh the code so the visible demo code is guaranteed valid.
    if (initialEmail) requestCode(true, initialEmail);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestCode(initial = false, forceEmail?: string) {
    const target = forceEmail ?? email;
    if (cooldown > 0 && !initial) return;
    if (!target) return;
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target, mode }),
      });
      const data = await res.json();
      if (data?.demoOtp) setDemoOtp(data.demoOtp);
      if (data?.ok || !res.ok) {
        setCooldown(60);
        if (timer.current) clearInterval(timer.current);
        timer.current = setInterval(() => {
          setCooldown((c) => {
            if (c <= 1 && timer.current) clearInterval(timer.current);
            return c > 0 ? c - 1 : 0;
          });
        }, 1000);
      }
      if (!res.ok) setError(getErrorMessage(data?.code ?? "generic"));
    } catch {
      setError(t("auth.errors.generic"));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getErrorMessage(data?.code ?? "generic"));
        setLoading(false);
        return;
      }
      sessionStorage.removeItem("bf_pending_email");
      sessionStorage.removeItem("bf_pending_otp");
      router.replace("/app");
    } catch {
      setError(t("auth.errors.generic"));
      setLoading(false);
    }
  }

  const needsEmail = !email.trim();

  return (
    <>
      {demoOtp && (
        <button
          type="button"
          onClick={() => setCode(demoOtp)}
          className="mb-4 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-xs text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          title={t("auth.verify.tapToFill")}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm">
              ✉
            </span>
            <span>
              {t("auth.verify.demoNotice", { code: demoOtp })}
              <span className="mt-0.5 flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono tracking-wider">
                  {demoOtp}
                </span>
                {t("auth.verify.tapToFill")}
              </span>
            </span>
          </span>
        </button>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        {!needsEmail ? (
          <>
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "login"
                  ? t("auth.verify.subtitleLogin")
                  : t("auth.verify.subtitleRegister")}
              </p>
              <p className="mt-1 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                {email}
              </p>
            </div>
            <Input
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="text-center text-lg tracking-[0.5em]"
              aria-label={t("auth.verify.code")}
            />
            <Button type="submit" loading={loading} disabled={code.length !== 6} className="w-full">
              {t("auth.verify.verify")}
            </Button>
            <button
              type="button"
              onClick={() => requestCode()}
              disabled={cooldown > 0}
              className="w-full text-center text-sm font-medium text-zinc-500 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {cooldown > 0
                ? `${t("auth.verify.resendIn").replace("{sec}", String(cooldown))}`
                : t("auth.verify.resend")}
            </button>
          </>
        ) : (
          <Field label={t("auth.login.email")}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.uz"
              autoFocus
            />
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => requestCode()}
            >
              {t("auth.verify.sendCode")}
            </Button>
          </Field>
        )}
      </form>
    </>
  );
}

export default function VerifyPage() {
  const { t } = useTranslation();
  return (
    <AuthShell title={t("auth.verify.title")} subtitle={t("auth.verify.subtitleRegister")}>
      <Suspense>
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}