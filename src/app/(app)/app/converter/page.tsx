"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  WandSparkles,
  Cpu,
  CloudLightning,
  Save,
  FileText,
  Copy,
  Check,
  Radio,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Send,
  Bot,
} from "lucide-react";
import { useCurrency } from "@/lib/state/CurrencyContext";
import { useWorkspaces } from "@/lib/state/WorkspacesContext";
import { useOrders } from "@/lib/state/OrdersContext";
import { useNotifications } from "@/lib/state/NotificationsContext";
import { Button, Card, Badge } from "@/components/ui";
import { generateInvoicePDF } from "@/lib/invoice";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

type Phase = "idle" | "processing" | "done" | "error";
type Engine = "local" | "llm";

const SAMPLES = ["orders.chat.quick1", "orders.chat.quick2", "orders.chat.quick3"];

function orderShareText(order: Order, format: (n: number) => string): string {
  const lines = order.items.map((i) => `• ${i.quantity} × ${i.product} — ${format(i.lineTotalUZS)}`);
  return [
    `${order.invoiceNumber} · ${order.customerName}`,
    ...lines,
    `Total: ${format(order.totalUZS)}`,
    order.phone ? `Tel: ${order.phone}` : "",
    order.location ? `Manzil: ${order.location}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ConverterPage() {
  const { t, i18n } = useTranslation();
  const { format, currency } = useCurrency();
  const { activeId } = useWorkspaces();
  const { createOrder } = useOrders();
  const { add } = useNotifications();

  const [text, setText] = useState("");
  const [engine, setEngine] = useState<Engine>("llm");
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<Order | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ engine: string; model?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lang = i18n.language;

  async function process() {
    if (!text.trim() || phase === "processing") return;
    setPhase("processing");
    setStep(0);
    setResult(null);
    setReply(null);
    setMeta(null);
    setCopied(false);

    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      if (i <= 5) setStep(i);
    }, 260);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, workspaceId: activeId, lang }),
      });
      const data = await res.json();
      if (timerRef.current) clearInterval(timerRef.current);
      if (!res.ok || !data?.order) {
        setPhase("error");
        setStep(-1);
        add("error", t("notif.aiError.title"));
        return;
      }
      if (data.intent === "other") {
        setReply(data.reply ?? null);
        add("info", t("conv.assistantReply.title"));
      }
      setResult(data.order);
      setMeta({ engine: data.engine ?? "mock-fallback", model: data.model, error: data.error });
      setStep(5);
      setPhase("done");
    } catch {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("error");
      setStep(-1);
      add("error", t("notif.aiError.title"));
    }
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current);
    setText("");
    setPhase("idle");
    setStep(-1);
    setResult(null);
    setReply(null);
    setMeta(null);
    setCopied(false);
  }

  function save() {
    if (!result) return;
    if (savedInvoices.includes(result.invoiceNumber)) return;
    createOrder(result);
    setSavedInvoices((s) => [...s, result.invoiceNumber]);
    add("success", t("conv.savedToOrders"));
  }

  async function copyJson() {
    if (!result) return;
    await navigator.clipboard.writeText(
      JSON.stringify({ ...result, workspaceId: undefined }, null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadPdf() {
    if (!result) return;
    generateInvoicePDF(result, { currency, lang });
    add("success", t("notif.exportPdf.title"));
  }

  const Steps = () => (
    <ol className="space-y-2">
      {[1, 2, 3, 4, 5].map((s) => {
        const done = phase === "done" ? s <= (result ? 5 : 0) : phase === "processing" ? step >= s : s <= 0;
        const active = phase === "processing" && step === s;
        return (
          <li key={s} className="flex items-center gap-3 text-[13px]">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition",
                done
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : active
                    ? "animate-pulse border-zinc-400 text-zinc-500"
                    : "border-zinc-200 text-zinc-400 dark:border-zinc-700",
              )}
            >
              {done ? <Check className="h-3 w-3" strokeWidth={2} /> : s}
            </span>
            <span className={cn(done || active ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500")}>
              {t(`conv.steps.${s}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("conv.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("conv.subtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("conv.processor")}
              </p>
              <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
                <button
                  onClick={() => setEngine("llm")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
                    engine === "llm"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                  )}
                >
                  <CloudLightning className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t("conv.engineLlm")}
                </button>
                <button
                  onClick={() => setEngine("local")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
                    engine === "local"
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                  )}
                >
                  <Cpu className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t("conv.engineLocal")}
                </button>
              </div>
            </div>

            <label className="mt-4 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t("conv.message")}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("conv.placeholder")}
              rows={6}
              className="input-base mt-1.5 w-full resize-none text-sm leading-relaxed"
            />

            <div className="mt-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {t("conv.samples")}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SAMPLES.map((key) => (
                  <button
                    key={key}
                    onClick={() => setText(t(key))}
                    className="rounded-md border border-zinc-200 px-2 py-1 text-left text-[11px] text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button onClick={process} loading={phase === "processing"} disabled={!text.trim()}>
                <WandSparkles className="h-4 w-4" strokeWidth={1.5} />
                {phase === "processing" ? t("conv.processing") : t("conv.process")}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={phase === "processing"}>
                {t("conv.clear")}
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <Steps />
          </Card>
        </div>

        <div className="space-y-3">
          {phase === "idle" && (
            <Card className="p-8 text-center">
              <Radio className="mx-auto h-5 w-5 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
              <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("conv.empty.title")}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{t("conv.empty.desc")}</p>
            </Card>
          )}

          {phase === "error" && (
            <Card className="p-6 text-center">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {meta?.error ?? t("notif.aiError.desc")}
              </p>
              <Button variant="secondary" className="mt-3" onClick={process}>
                {t("common.action.retry")}
              </Button>
            </Card>
          )}

          {result && phase === "done" && (
            <Card className="p-5">
              {reply && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-[13px] text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t("conv.assistantReply.title")}</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sky-700/90 dark:text-sky-200/80">{reply}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">{t("conv.orderReady")}</Badge>
                  <span className="font-mono text-[11px] text-zinc-400">{result.invoiceNumber}</span>
                </div>
                {meta?.engine === "llm" ? (
                  <span className="text-[11px] text-zinc-400">
                    {t("conv.llmModel", { model: meta.model ?? "LLM" })}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400">{t("conv.llmFallback")}</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <ResultField icon={User} label={t("conv.field.customer")} value={result.customerName} />
                <ResultField icon={Phone} label={t("conv.field.phone")} value={result.phone} />
                <ResultField icon={MapPin} label={t("conv.field.location")} value={result.location} />
                <ResultField
                  icon={Radio}
                  label={t("conv.field.source")}
                  value={t(`orders.channel.${result.source}`)}
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">
                    {t("conv.field.confidence")}
                  </span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      result.confidence >= 0.7
                        ? "bg-emerald-500"
                        : result.confidence >= 0.4
                          ? "bg-amber-500"
                          : "bg-red-400",
                    )}
                    style={{ width: `${Math.round(result.confidence * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                      <th className="px-3 py-2 font-medium">{t("orders.col.items")}</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 text-right font-medium">{t("orders.col.total")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {result.items.map((i, idx) => (
                      <tr key={`${result.id}-${idx}`}>
                        <td className="px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300">
                          {i.product}
                          <span className="text-zinc-400"> · {format(i.unitPriceUZS)}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-[13px] text-zinc-600 dark:text-zinc-300">
                          {i.quantity}
                        </td>
                        <td className="px-3 py-2 text-right text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                          {format(i.lineTotalUZS)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {t("conv.field.total")}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {format(result.totalUZS)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {savedInvoices.includes(result.invoiceNumber) ? (
                  <Button variant="secondary" disabled>
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                    {t("conv.savedToOrders")}
                  </Button>
                ) : (
                  <Button onClick={save}>
                    <Save className="h-4 w-4" strokeWidth={1.5} />
                    {t("common.action.save")}
                  </Button>
                )}
                <Button variant="secondary" onClick={downloadPdf}>
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                  {t("conv.download")}
                </Button>
                <Button variant="ghost" onClick={copyJson}>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  {copied ? t("common.action.copied") : t("conv.copyJson")}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(orderShareText(result, format))}`,
                      "_blank",
                    )
                  }
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />
                  {t("conv.shareWhatsApp")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://t.me/share/url?url=${encodeURIComponent(
                        `https://bizflow.ai/${result.invoiceNumber}`,
                      )}&text=${encodeURIComponent(orderShareText(result, format))}`,
                      "_blank",
                    )
                  }
                >
                  <Send className="h-3.5 w-3.5 text-sky-500" strokeWidth={1.5} />
                  {t("conv.shareTelegram")}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        <Icon className="h-3 w-3" strokeWidth={1.5} />
        {label}
      </p>
      <p className="mt-0.5 truncate text-[13px] text-zinc-800 dark:text-zinc-200">{value}</p>
    </div>
  );
}