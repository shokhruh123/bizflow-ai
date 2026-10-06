"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getI18n, setLocale } from "@/lib/i18n";

let synced = false;

/** Initializes i18next once and keeps document.lang in sync. */
export function I18nBootstrap({ children }: { children: ReactNode }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!synced) {
      getI18n();
      synced = true;
    }
    const lang = getI18n().language ?? "uz";
    document.documentElement.lang = lang;
    const onChange = () => {
      document.documentElement.lang = getI18n().language ?? "uz";
      setTick((t) => t + 1);
    };
    getI18n().on("languageChanged", onChange);
    return () => {
      getI18n().off("languageChanged", onChange);
    };
  }, []);

  return <>{children}</>;
}

export function switchLocale(code: "uz" | "ru" | "en"): void {
  setLocale(code);
}