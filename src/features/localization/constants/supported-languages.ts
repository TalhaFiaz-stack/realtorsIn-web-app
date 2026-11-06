export type AppLocale =
  | "en"
  | "ar"
  | "de"
  | "tr"
  | "ru"
  | "ur"
  | "ja"
  | "fr"
  | "hi"
  | "zh"
  | "it"
  | "fa"
  | "es"
  | "nl"
  | "cs"
  | "hu";

export type SupportedLanguage = {
  code: AppLocale;
  name: string;
  nativeLabel: string;
  flag: string;
};

/** Matches mobile `LangItemComp` list order and codes. */
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "ar", name: "Arabic", nativeLabel: "العربية", flag: "🇸🇦" },
  { code: "de", name: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { code: "tr", name: "Turkish", nativeLabel: "Türkçe", flag: "🇹🇷" },
  { code: "ru", name: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
  { code: "ur", name: "Urdu", nativeLabel: "اردو", flag: "🇵🇰" },
  { code: "ja", name: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
  { code: "fr", name: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { code: "hi", name: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  { code: "zh", name: "Chinese", nativeLabel: "中国人", flag: "🇨🇳" },
  { code: "it", name: "Italian", nativeLabel: "Italiana", flag: "🇮🇹" },
  { code: "fa", name: "Persian", nativeLabel: "فارسی", flag: "🇮🇷" },
  { code: "es", name: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "nl", name: "Dutch", nativeLabel: "Nederlands", flag: "🇳🇱" },
  { code: "cs", name: "Czech", nativeLabel: "Čeština", flag: "🇨🇿" },
  { code: "hu", name: "Hungarian", nativeLabel: "Magyar", flag: "🇭🇺" },
];

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_STORAGE_KEY = "SELECTED_LANGUAGE";

export const LOCALE_COOKIE_NAME = "realtorsin_locale";

const localeSet = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return typeof value === "string" && localeSet.has(value as AppLocale);
}

export function normalizeAppLocale(
  value: string | null | undefined
): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}
