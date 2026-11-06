import type { SupportedLanguage } from "@/features/localization/constants/supported-languages";

/** i18n keys match mobile `Strings.js` (e.g. English, Arabic, …). */
export function languageDisplayName(
  language: SupportedLanguage,
  t: (key: string) => string
): string {
  return t(language.name);
}
