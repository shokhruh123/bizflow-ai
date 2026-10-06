"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { useEntitlements } from "@/lib/state/EntitlementsContext";
import { useSession } from "@/lib/state/SessionContext";

/** Slim banner shown when a non-VIP user has no paid plan (trial or not started yet). */
export function TrialBanner() {
  const { t } = useTranslation();
  const { status, trialDaysLeft, cardBound, startTrial, vip } = useEntitlements();
  const { session } = useSession();

  if (session.status !== "authenticated" || vip) return null;
  if (status === "paid") return null;

  const days = trialDaysLeft;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-amber-100 bg-amber-50/70 px-4 py-1.5 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
      <Sparkles className="h-3 w-3 shrink-0" strokeWidth={1.5} />
      <span className="min-w-0 flex-1">
        {status === "trial"
          ? t("bill.banner.trial", { days })
          : t("bill.banner.prompt")}
      </span>
      {status === "trial" ? (
        <button
          onClick={startTrial}
          className="font-medium underline-offset-2 hover:underline"
        >
          {t("bill.banner.renew")}
        </button>
      ) : (
        <Link href="/app/billing" className="font-medium underline-offset-2 hover:underline">
          {cardBound ? t("bill.banner.reactivate") : t("bill.banner.useTrial")}
        </Link>
      )}
    </div>
  );
}