"use client";

import { useTranslation } from "react-i18next";
import {
  DEFAULT_LOCALE,
  normalizeAppLocale,
} from "@/features/localization/constants/supported-languages";
import { isRtlLocale } from "@/features/localization/lib/is-rtl-locale";
import { cn } from "@/lib/utils";

/** RTL typography without flipping the app shell flex layout. */
export function useLocaleTextClass(className?: string) {
  const { i18n } = useTranslation();
  const locale = normalizeAppLocale(i18n.language || DEFAULT_LOCALE);
  const rtl = isRtlLocale(locale);
  return cn(rtl && "locale-text", className);
}

export function useIsRtlLocale() {
  const { i18n } = useTranslation();
  return isRtlLocale(normalizeAppLocale(i18n.language || DEFAULT_LOCALE));
}
