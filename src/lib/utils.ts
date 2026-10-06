import type { Currency } from "./types";
import { LOCALE_BY_LANG } from "./currency";

export const cn = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export const initials = (name: string) =>
  (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export function fmtDate(iso: string, lang = "uz"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(LOCALE_BY_LANG[lang] ?? "en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function fmtUZS(n: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(n);
}

/** For jsPDF/plain contexts where Intl is unavailable or we need raw formatting. */
export function plainMoney(amountUZS: number, currency: Currency, lang = "uz"): string {
  const locale = LOCALE_BY_LANG[lang] ?? "en-US";
  const value = currency === "USD" ? amountUZS / 12900 : amountUZS;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UZS" ? 0 : 2,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);
}