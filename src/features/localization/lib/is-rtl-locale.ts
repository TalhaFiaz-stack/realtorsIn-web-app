import type { AppLocale } from "@/features/localization/constants/supported-languages";

const RTL_LOCALES = new Set<AppLocale>(["ar", "ur", "fa"]);

export function isRtlLocale(locale: AppLocale): boolean {
  return RTL_LOCALES.has(locale);
}
