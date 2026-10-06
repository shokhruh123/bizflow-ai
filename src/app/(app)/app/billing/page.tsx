"use client";

import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  CheckCircle2,
  Circle,
  WalletCards,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { Card, Button, Badge, Modal, ModalHeader } from "@/components/ui";
import { useCurrency } from "@/lib/state/CurrencyContext";
import { useNotifications } from "@/lib/state/NotificationsContext";
import { useEntitlements } from "@/lib/state/EntitlementsContext";
import { readJSON, uid, writeJSON } from "@/lib/storage";
import { PLANS, providersForCurrency, type PlanDef, type PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  label: string;
  amount: string;
  provider: string;
  date: number;
}

type PayState = "idle" | "processing" | "success";

export default function BillingPage() {
  const { t } = useTranslation();
  const { currency, setCurrency, format } = useCurrency();
  const { add } = useNotifications();
  const { status, plan, vip, trialDaysLeft, cardBound, startTrial, applyPlan } =
    useEntitlements();
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    readJSON<HistoryItem[]>("billing_history_v1", []),
  );
  const [checkout, setCheckout] = useState<PlanDef | null>(null);
  const [topUp, setTopUp] = useState<number | null>(null);

  function record(item: HistoryItem) {
    const next = [item, ...history].slice(0, 20);
    setHistory(next);
    writeJSON("billing_history_v1", next);
  }

  function onPaid(planId: string | null, provider: string, amountLabel: string) {
    if (planId) {
      applyPlan(planId as PlanId);
      add("billing", t("notif.billing.title"), t("notif.billing.desc", { plan: t(`bill.plans.${planId}`) }));
    } else {
      add("billing", t("notif.billing.title"), t("bill.checkout.success.title"));
    }
    record({
      id: uid("pay"),
      label: planId ? t("bill.history.charge") : t("bill.oneTime.title"),
      amount: amountLabel + (provider ? ` · ${t(`bill.provider.${provider}`)}` : ""),
      provider,
      date: Date.now(),
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("bill.title")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("bill.subtitle")}</p>
        </div>
        <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {(["UZS", "USD"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                currency === c
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {vip && (
        <Card className="flex items-center gap-3 border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t("bill.vip.title")}</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-200/70">{t("bill.vip.desc")}</p>
          </div>
        </Card>
      )}

      {!vip && status === "expired" && (
        <Card className="flex flex-wrap items-center gap-3 border-red-200 bg-red-50/60 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <CreditCard className="h-5 w-5 shrink-0 text-red-500" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">{t("bill.trial.expiredTitle")}</p>
            <p className="text-xs text-red-700/80 dark:text-red-200/70">{t("bill.trial.expiredDesc")}</p>
          </div>
          <Button variant="danger" onClick={() => setCheckout(PLANS[0])}>
            {t("bill.trial.choosePlan")}
          </Button>
        </Card>
      )}

      {!vip && status !== "expired" && (
        <TrialCard
          trialDaysLeft={trialDaysLeft}
          cardBound={cardBound}
          onStart={startTrial}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id || status === "vip";
          const price = currency === "UZS" ? format(p.priceUZS) : `$${p.priceUSD}`;
          return (
            <Card
              key={p.id}
              className={cn(
                "relative flex flex-col p-5",
                p.popular && "border-zinc-900 dark:border-white",
                isCurrent && "ring-1 ring-zinc-900 dark:ring-white",
              )}
            >
              {p.popular && !isCurrent && (
                <Badge variant="warning" className="absolute -top-2 right-3">
                  {t("bill.popular")}
                </Badge>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t(`bill.plans.${p.id}`)}
                </p>
                {isCurrent && <Badge variant="success">{t("bill.current")}</Badge>}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-[24px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {price}
                </span>
                <span className="text-sm text-zinc-400">{t("bill.perMonth")}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={1.5} />
                    {t(`bill.feat.${f}`)}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={isCurrent ? "secondary" : p.popular ? "primary" : "outline"}
                disabled={isCurrent}
                onClick={() => setCheckout(p)}
              >
                {isCurrent ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                    {t("bill.current")}
                  </>
                ) : (
                  t("bill.choose")
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("bill.oneTime.title")}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{t("bill.oneTime.desc")}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={topUp ?? ""}
              onChange={(e) => setTopUp(Number(e.target.value) || null)}
              placeholder={currency === "UZS" ? "1 000 000" : "100"}
              className="input-base h-9 w-36 px-3 text-sm"
            />
            <Button
              variant="secondary"
              disabled={!topUp || topUp <= 0}
              onClick={() =>
                onPaid(
                  null,
                  providersForCurrency(currency)[0],
                  currency === "UZS" ? format(topUp!) : `$${topUp}`,
                )
              }
            >
              <WalletCards className="h-4 w-4" strokeWidth={1.5} />
              {t("bill.oneTime.topUp")}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t("bill.history.title")}
        </p>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">{t("bill.history.empty")}</p>
        ) : (
          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{h.label}</p>
                  <p className="text-xs text-zinc-400">{h.amount}</p>
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(h.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[11px] text-zinc-400">{t("bill.demoNote")}</p>
      </Card>

      {checkout && (
        <CheckoutModal
          plan={checkout}
          onClose={() => setCheckout(null)}
          onPaid={(provider) =>
            onPaid(
              checkout.id,
              provider,
              currency === "UZS" ? format(checkout.priceUZS) : `$${checkout.priceUSD}`,
            )
          }
        />
      )}
    </div>
  );
}

function TrialCard({
  trialDaysLeft,
  cardBound,
  onStart,
}: {
  trialDaysLeft: number;
  cardBound: boolean;
  onStart: () => void;
}) {
  const { t } = useTranslation();
  const { status } = useEntitlements();

  return (
    <Card className="flex flex-wrap items-center gap-4 border-sky-200 bg-sky-50/60 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
      <Sparkles className="h-5 w-5 shrink-0 text-sky-500" strokeWidth={1.5} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-sky-900 dark:text-sky-300">{t("bill.trial.title")}</p>
        <p className="text-xs text-sky-700/80 dark:text-sky-200/70">
          {status === "trial"
            ? t("bill.trial.active", { days: trialDaysLeft })
            : t("bill.trial.inactive", { days: trialDaysLeft })}
        </p>
      </div>
      {status !== "trial" && (
        <Button variant="secondary" onClick={onStart}>
          <CreditCard className="h-4 w-4" strokeWidth={1.5} />
          {cardBound ? t("bill.trial.reactivate") : t("bill.trial.start")}
        </Button>
      )}
    </Card>
  );
}

function CheckoutModal({
  plan,
  onClose,
  onPaid,
}: {
  plan: PlanDef;
  onClose: () => void;
  onPaid: (provider: string) => void;
}) {
  const { t } = useTranslation();
  const { currency, format } = useCurrency();
  const [provider, setProvider] = useState<string>(
    providersForCurrency(currency)[0] as unknown as string,
  );
  const [state, setState] = useState<PayState>("idle");
  const inputId = useId();

  const providers = providersForCurrency(currency);
  const amountLabel = currency === "UZS" ? format(plan.priceUZS) : `$${plan.priceUSD}`;

  function pay() {
    setState("processing");
    setTimeout(() => {
      setState("success");
      onPaid(provider);
    }, 1400);
  }

  return (
    <Modal open onClose={onClose}>
      <ModalHeader
        title={state === "success" ? t("bill.checkout.success.title") : t("bill.checkout.title")}
        subtitle={state === "success" ? t("bill.checkout.success.desc") : undefined}
        onClose={onClose}
      />
      {state === "success" ? (
        <div className="py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <Check className="h-6 w-6 text-emerald-500" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{t("bill.checkout.success.desc")}</p>
          <Button className="mt-5 w-full" onClick={onClose}>
            {t("bill.checkout.done")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("bill.checkout.plan")}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {t(`bill.plans.${plan.id}`)}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("bill.checkout.amount")}</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{amountLabel}</span>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("bill.checkout.provider")}
            </legend>
            <div className="space-y-2">
              {providers.map((p) => (
                <label
                  key={p}
                  htmlFor={`${inputId}-${p}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
                    provider === p
                      ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-700",
                  )}
                >
                  <input
                    id={`${inputId}-${p}`}
                    type="radio"
                    name="provider"
                    checked={provider === p}
                    onChange={() => setProvider(p)}
                    className="sr-only"
                  />
                  {provider === p ? (
                    <Circle className="h-4 w-4 fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white" strokeWidth={1.5} />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
                  )}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {t(`bill.provider.${p}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button className="w-full" onClick={pay} loading={state === "processing"}>
            {state === "processing" ? t("bill.checkout.processing") : t("bill.checkout.payNow")}
          </Button>
          <p className="text-center text-[11px] text-zinc-400">{t("bill.demoNote")}</p>
        </div>
      )}
    </Modal>
  );
}