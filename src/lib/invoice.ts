import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Currency, Order } from "./types";
import { plainMoney } from "./utils";

export function generateInvoicePDF(
  order: Order,
  opts: { currency: Currency; lang: string },
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const fmt = (n: number) => plainMoney(n, opts.currency, opts.lang);

  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, W, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Bizflow", 14, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 205);
  doc.text("Order processing & sales copilot", 14, 24);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("INVOICE", W - 14, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 210, 215);
  doc.text(order.invoiceNumber, W - 14, 22, { align: "right" });
  doc.text(
    new Date(order.createdAt).toLocaleDateString(opts.lang === "uz" ? "uz-UZ" : opts.lang === "ru" ? "ru-RU" : "en-US", { year: "numeric", month: "short", day: "numeric" }),
    W - 14,
    27,
    { align: "right" },
  );

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO", 14, 48);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(82, 82, 91);
  doc.text(order.customerName, 14, 54);
  doc.text(order.phone, 14, 59);
  doc.text(order.location, 14, 64);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27);
  doc.text("Fulfilment", W - 14, 48, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(82, 82, 91);
  doc.text("Delivery", W - 14, 54, { align: "right" });
  doc.text(`Source: ${order.source}`, W - 14, 59, { align: "right" });
  doc.text(`Status: ${order.status}`, W - 14, 64, { align: "right" });

  autoTable(doc, {
    startY: 74,
    head: [["#", "Item", "Qty", "Unit price", "Total"]],
    body: order.items.map((i, idx) => [
      String(idx + 1),
      i.product,
      String(i.quantity),
      fmt(i.unitPriceUZS),
      fmt(i.lineTotalUZS),
    ]),
    theme: "striped",
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 10, textColor: [24, 24, 27] },
    alternateRowStyles: { fillColor: [244, 244, 245] },
    styles: { cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  const c = doc as unknown as { lastAutoTable: { finalY: number } };
  const y = c.lastAutoTable.finalY + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(9, 9, 11);
  doc.text(`Total: ${fmt(order.totalUZS)}`, W - 14, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text("Generated automatically by Bizflow AI from a customer message.", 14, y + 6);

  doc.setFillColor(244, 244, 245);
  doc.rect(0, 287, W, 10, "F");
  doc.setTextColor(161, 161, 170);
  doc.text(
    "Bizflow · hello@bizflow.ai · Support +998 90 123 45 67",
    W / 2,
    293,
    { align: "center" },
  );

  doc.save(`${order.invoiceNumber.replace(/\s+/g, "")}.pdf`);
}