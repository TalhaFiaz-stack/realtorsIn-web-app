import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  normalizeAppLocale,
  type AppLocale,
} from "@/features/localization/constants/supported-languages";

export function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  try {
    const fromStorage = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (fromStorage) {
      return normalizeAppLocale(fromStorage);
    }
  } catch {
    // ignore
  }
  const fromCookie = readLocaleCookie();
  return fromCookie ?? DEFAULT_LOCALE;
}

export function persistLocale(locale: AppLocale): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  writeLocaleCookie(locale);
}

function readLocaleCookie(): AppLocale | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`));
  if (!match) {
    return null;
  }
  const value = decodeURIComponent(match.split("=")[1] ?? "");
  return normalizeAppLocale(value);
}

function writeLocaleCookie(locale: AppLocale): void {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)};path=/;max-age=${maxAge};SameSite=Lax`;
}
