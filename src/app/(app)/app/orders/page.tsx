"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PackageOpen,
  Download,
  Trash2,
  Search,
  Send,
} from "lucide-react";
import { useOrders } from "@/lib/state/OrdersContext";
import { useCurrency } from "@/lib/state/CurrencyContext";
import { useNotifications } from "@/lib/state/NotificationsContext";
import { Card, Button, Badge, EmptyState, Menu } from "@/components/ui";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<OrderStatus, "default" | "warning" | "success" | "muted"> = {
  confirmed: "success",
  processing: "warning",
  shipped: "default",
  delivered: "success",
};

const SOURCE_LABEL: Record<string, string> = {
  telegram: "orders.channel.telegram",
  whatsapp: "orders.channel.whatsapp",
  voice: "orders.channel.voice",
  manual: "orders.channel.manual",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  confirmed: "bg-sky-500",
  processing: "bg-amber-500",
  shipped: "bg-violet-500",
  delivered: "bg-emerald-500",
};

export default function OrdersPage() {
  const { t } = useTranslation();
  const { activeOrders, setStatus, removeOrder, exportOrdersCsv } = useOrders();
  const { format } = useCurrency();
  const { add } = useNotifications();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const q = query.trim().toLowerCase();
  const filtered = activeOrders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (!q) return true;
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.invoiceNumber.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: activeOrders.length,
    confirmed: activeOrders.filter((o) => o.status === "confirmed").length,
    processing: activeOrders.filter((o) => o.status === "processing").length,
    shipped: activeOrders.filter((o) => o.status === "shipped").length,
    delivered: activeOrders.filter((o) => o.status === "delivered").length,
  };

  const filters = ["all", ...ORDER_STATUSES] as const;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("nav.orders")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("orders.subtitle")}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            if (filtered.length === 0) {
              add("info", t("orders.empty.title"));
              return;
            }
            exportOrdersCsv(filtered);
            add("success", t("orders.exportedCsv"));
          }}
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          {t("orders.exportCsv")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("orders.search")}
            className="input-base h-9 w-full pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                statusFilter === s
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              {s === "all" ? t("orders.filters.all") : t(`common.status.${s}`)} {counts[s]}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-5 w-5" strokeWidth={1.5} />}
            title={t("orders.empty.title")}
            description={t("orders.empty.desc")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                  <th className="px-4 py-2.5 font-medium">{t("orders.col.invoice")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("orders.col.customer")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("orders.col.items")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("orders.col.total")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("orders.col.status")}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t("orders.col.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                          {o.invoiceNumber}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{o.customerName}</p>
                      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                        <Send className="mr-1 inline h-3 w-3 -translate-y-px text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
                        {t(SOURCE_LABEL[o.source] ?? "orders.channel.manual")}
                        {o.phone && o.phone !== "—" ? ` · ${o.phone}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                      <ul className="space-y-0.5">
                        {o.items.slice(0, 3).map((i, idx) => (
                          <li key={`${o.id}-${idx}`}>
                            {i.quantity}× {i.product}
                          </li>
                        ))}
                        {o.items.length > 3 && (
                          <li className="text-zinc-400 dark:text-zinc-500">
                            +{o.items.length - 3} {t("orders.more")}
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {format(o.totalUZS)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[o.status]}>
                        {t(`common.status.${o.status}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Menu
                        align="end"
                        trigger={
                          <button className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                            {t("orders.actions")}
                          </button>
                        }
                      >
                        {ORDER_STATUSES.map((s) => (
                          <Menu.Item key={s} onSelect={() => setStatus(o.id, s)}>
                            <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[s])} />
                            {t(`common.status.${s}`)}
                          </Menu.Item>
                        ))}
                        <Menu.Divider />
                        <Menu.Item
                          danger
                          onSelect={() => {
                            removeOrder(o.id);
                            add("info", t("orders.removed"));
                          }}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          {t("orders.remove")}
                        </Menu.Item>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}