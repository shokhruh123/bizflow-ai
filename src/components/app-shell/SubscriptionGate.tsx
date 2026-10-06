"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CreditCard, Sparkles } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useEntitlements } from "@/lib/state/EntitlementsContext";
import { useSession } from "@/lib/state/SessionContext";

const UNBLOCKED_PATHS = ["/app/billing", "/app/settings"];

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { blocked, status, startTrial } = useEntitlements();
  const { session } = useSession();

  if (!blocked || UNBLOCKED_PATHS.includes(pathname)) return <>{children}</>;
  if (session.status !== "authenticated") return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CreditCard className="h-6 w-6 text-zinc-500" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("bill.gate.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {status === "trial" ? t("bill.gate.blockedTrial") : t("bill.gate.desc")}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {status === "expired" && (
          <Button onClick={startTrial} loading={false}>
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            {t("bill.trial.reactivate")}
          </Button>
        )}
        <Link href="/app/billing" className="w-full">
          <Button variant="secondary" className="w-full">
            <CreditCard className="h-4 w-4" strokeWidth={1.5} />
            {t("bill.gate.choosePlan")}
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="warning">{t("bill.gate.demoBadge")}</Badge>
        <span className="text-xs text-zinc-400">{t("bill.gate.help")}</span>
      </div>
    </div>
  );
}