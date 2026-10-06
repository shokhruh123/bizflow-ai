"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { Currency } from "@/lib/types";
import { formatMoney, formatNumber } from "@/lib/currency";
import { readJSON, writeJSON } from "@/lib/storage";

const Ctx = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amountUZS: number) => string;
  formatNumber: (n: number) => string;
} | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [currency, setCurrency] = useState<Currency>(
    () => readJSON<Currency>("currency", "UZS"),
  );

  useEffect(() => writeJSON("currency", currency), [currency]);

  const format = useCallback(
    (amountUZS: number) => formatMoney(amountUZS, currency, lang),
    [currency, lang],
  );
  const fmtNumber = useCallback(
    (n: number) => formatNumber(n, lang),
    [lang],
  );

  return (
    <Ctx.Provider value={{ currency, setCurrency, format, formatNumber: fmtNumber }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCurrency outside provider");
  return ctx;
}