import i18n, { type InitOptions, type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "./i18n/uz.json";
import ru from "./i18n/ru.json";
import en from "./i18n/en.json";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  resolveLocale,
  type LocaleCode,
} from "./i18n/locale";

export { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, resolveLocale };
export type { LocaleCode };

function getStored(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
  return resolveLocale(match?.split("=")[1]);
}

function buildOptions(): InitOptions {
  return {
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: getStored(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    returnNull: false,
  };
}

i18n.use(initReactI18next).init(buildOptions());

export function getI18n(): I18nInstance {
  return i18n;
}

export function setLocale(code: LocaleCode): void {
  i18n.changeLanguage(code);
  document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = code;
}

export function getErrorMessage(code: string): string {
  const key = `auth.errors.${code}`;
  return i18n.t(key, { defaultValue: i18n.t("auth.errors.generic") });
}