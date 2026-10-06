import type { Currency } from "./types";

/** 1 USD = 12900 UZS (demo constant). Only UZS and USD are supported — no RUB. */
export const USD_RATE = 12900;

export const LOCALE_BY_LANG: Record<string, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

export function toAmount(amountUZS: number, currency: Currency): number {
  return currency === "USD" ? amountUZS / USD_RATE : amountUZS;
}

export function formatMoney(
  amountUZS: number,
  currency: Currency,
  lang = "uz",
): string {
  const locale = LOCALE_BY_LANG[lang] ?? "en-US";
  const value = toAmount(amountUZS, currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UZS" ? 0 : 2,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number, lang = "uz"): string {
  return new Intl.NumberFormat(LOCALE_BY_LANG[lang] ?? "en-US").format(value);
}