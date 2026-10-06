"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  PackageOpen,
  TrendingUp,
  Wallet,
  Timer,
  ArrowRight,
  WandSparkles,
} from "lucide-react";
import { useOrders } from "@/lib/state/OrdersContext";
import { useCurrency } from "@/lib/state/CurrencyContext";
import { useWorkspaces } from "@/lib/state/WorkspacesContext";
import { Card, Badge, Button, EmptyState } from "@/components/ui";

const STATUS_BADGE = {
  confirmed: "success",
  processing: "warning",
  shipped: "default",
  delivered: "success",
} as const;

export default function DashboardPage() {
  const { t } = useTranslation();
  const { activeOrders } = useOrders();
  const { format } = useCurrency();
  const { active } = useWorkspaces();

  const totalUZS = activeOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.lineTotalUZS, 0),
    0,
  );
  const avg =
    activeOrders.length > 0 ? Math.round(totalUZS / activeOrders.length) : 0;
  const savedHours = activeOrders.length * 3;
  const delivered = activeOrders.filter(
    (o) => o.status === "shipped" || o.status === "delivered",
  ).length;

  const woName =
    active.name === "personal" ? t("workspace.personal") : active.name;

  const kpis = [
    { label: t("dash.kpi.orders"), value: String(activeOrders.length), icon: PackageOpen },
    { label: t("dash.kpi.revenue"), value: format(totalUZS), icon: Wallet },
    { label: t("dash.kpi.timeSaved"), value: `${savedHours} ${t("dash.hoursUnit")}`, icon: Timer },
    { label: t("dash.kpi.avgOrder"), value: activeOrders.length ? format(avg) : t("dash.noDataValue"), icon: TrendingUp },
  ];

  const recent = activeOrders.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("dash.hello", { name: woName })}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("dash.subtitle")}</p>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{t("dash.period30")}</p>
      </div>

      {activeOrders.length === 0 && (
        <Card className="p-8 text-center">
          <EmptyState
            icon={<WandSparkles className="h-5 w-5" strokeWidth={1.5} />}
            title={t("dash.noOrders.title")}
            description={t("dash.noOrders.desc")}
            action={
              <Link href="/app/converter">
                <Button>
                  {t("dash.noOrders.cta")}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </Link>
            }
          />
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{k.label}</p>
              <k.icon className="h-4 w-4 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
            </div>
            <p className="mt-2 truncate text-[20px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {k.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between px-5 pt-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("dash.recentOrders")}
          </h3>
          {activeOrders.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {activeOrders.length} {t("dash.ordersCount")} · {delivered} {t("orders.filters.delivered").toLowerCase()}
            </span>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="px-5 pb-6 pt-3 text-sm text-zinc-400">{t("common.emptyTitle")}</p>
        ) : (
          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {recent.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {o.customerName}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {o.invoiceNumber} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {format(o.totalUZS)}
                  </span>
                  <Badge variant={STATUS_BADGE[o.status]}>{t(`common.status.${o.status}`)}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeOrders.length > 0 && (
          <div className="px-5 pb-4 pt-1">
            <Link
              href="/app/orders"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t("dash.viewAll")}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
