/** React-free locale constants. Safe to import from edge/middleware/server code. */

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE = "uz";

export const LOCALES = [
  { code: "uz", label: "O‘zbek", flag: "UZ" },
  { code: "ru", label: "Русский", flag: "RU" },
  { code: "en", label: "English", flag: "EN" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export function resolveLocale(raw?: string | null): LocaleCode {
  const code = (raw || DEFAULT_LOCALE).toLowerCase();
  return LOCALES.some((l) => l.code === code) ? (code as LocaleCode) : DEFAULT_LOCALE;
}