"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Truck, FileText, ArrowRight } from "lucide-react";
import { Card, Button, Badge, Field, Input } from "@/components/ui";
import { useCurrency } from "@/lib/state/CurrencyContext";
import {
  CITIES,
  optimizeRoute,
  estimateCargo,
  buildRouteReport,
  type City,
  type RouteReport,
} from "@/lib/logistics";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LogisticsPage() {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [selected, setSelected] = useState<string[]>(["samarkand", "bukhara", "nukus"]);
  const [weight, setWeight] = useState(1200);
  const [volume, setVolume] = useState(8);
  const [distance, setDistance] = useState(740);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const destinations = selected.map((id) => CITIES.find((c) => c.id === id)).filter(Boolean) as City[];
  const route = useMemo(
    () => (destinations.length ? optimizeRoute(destinations) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  );
  const cargo = estimateCargo({ weightKg: weight, volumeM3: volume, distanceKm: distance });

  function exportPdf() {
    if (!route) return;
    const rep = buildRouteReport(route.order, route.totalKm);
    generateRoutePdf(rep, cargo.costUZS);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("log.title")}
          </h2>
          <Badge variant="info">{t("log.badge")}</Badge>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("log.subtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("log.route.title")}
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("log.route.desc")}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {CITIES.map((c) => {
              const on = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] transition",
                    on
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
            {route ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
                  {route.order.map((c, i) => (
                    <span key={c.id} className="flex items-center gap-1.5">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{c.name}</span>
                      {i < route.order.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-zinc-400" strokeWidth={1.5} />
                      )}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Route className="h-3 w-3" strokeWidth={1.5} />
                  {t("log.route.total")}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {route.totalKm} km
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-zinc-400">{t("log.route.empty")}</p>
            )}
          </div>

          <Button className="mt-4 w-full" disabled={!route} onClick={exportPdf}>
            <FileText className="h-4 w-4" strokeWidth={1.5} />
            {t("log.route.pdf")}
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("log.cargo.title")}
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("log.cargo.desc")}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label={t("log.cargo.weight")}>
              <Input type="number" min={0} value={weight || ""} onChange={(e) => setWeight(Number(e.target.value) || 0)} />
            </Field>
            <Field label={t("log.cargo.volume")}>
              <Input type="number" min={0} value={volume || ""} onChange={(e) => setVolume(Number(e.target.value) || 0)} />
            </Field>
            <div className="col-span-2">
              <Field label={t("log.cargo.distance")}>
                <Input type="number" min={0} value={distance || ""} onChange={(e) => setDistance(Number(e.target.value) || 0)} />
              </Field>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[13px] dark:border-zinc-800 dark:bg-zinc-800/40">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>{t("log.cargo.base")}</span>
              <span className="text-zinc-800 dark:text-zinc-100">{format(cargo.baseKm)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>{t("log.cargo.weightFactor")}</span>
              <span className="text-zinc-800 dark:text-zinc-100">{format(cargo.weightFactor)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>{t("log.cargo.volumeFactor")}</span>
              <span className="text-zinc-800 dark:text-zinc-100">{format(cargo.volumeFactor)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-1.5 dark:border-zinc-700">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t("log.cargo.total")}</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{format(cargo.costUZS)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{t("log.cargo.eta")}</span>
              <span>~{cargo.etaHours} {t("log.cargo.hours")}</span>
            </div>
          </div>
        </Card>
      </div>

      <p className="text-center text-[11px] text-zinc-400">{t("log.demoNote")}</p>
    </div>
  );
}

function generateRoutePdf(report: RouteReport, costUZS: number): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, W, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("EM Techno Logistics", 14, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 205);
  doc.text("Route optimization & freight report", 14, 24);
  doc.text(new Date(report.date).toLocaleDateString(), W - 14, 17, { align: "right" });

  autoTable(doc, {
    startY: 44,
    head: [["#", "Leg", "Distance (km)"]],
    body: report.legs.map((l, i) => [String(i + 1), `${l.from} → ${l.to}`, String(l.km)]),
    theme: "striped",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 10, textColor: [24, 24, 27] },
    alternateRowStyles: { fillColor: [244, 244, 245] },
  });

  const c = doc as unknown as { lastAutoTable: { finalY: number } };
  const y = c.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(9, 9, 11);
  doc.text(`Route order: ${report.order.map((o) => o.name).join(" → ")}`, 14, y);
  doc.text(`Total distance: ${report.totalKm} km`, 14, y + 7);
  doc.text(`Freight estimate: ${costUZS.toLocaleString()} so'm`, 14, y + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text("Generated by Bizflow AI · EM Techno Logistics", 14, y + 22);
  doc.save(`logistics-route-${report.date.slice(0, 10)}.pdf`);
}