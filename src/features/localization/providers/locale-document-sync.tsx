"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRtlLocale } from "@/features/localization/lib/is-rtl-locale";
import {
  DEFAULT_LOCALE,
  normalizeAppLocale,
} from "@/features/localization/constants/supported-languages";

/**
 * Keeps document layout LTR (shell columns); RTL applies via `.locale-text` regions.
 */
export function LocaleDocumentSync({ enabled }: { enabled: boolean }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const locale = normalizeAppLocale(i18n.language || DEFAULT_LOCALE);
    const root = document.documentElement;
    root.lang = locale;
    root.dir = "ltr";
    root.classList.toggle("locale-rtl", isRtlLocale(locale));
  }, [enabled, i18n.language]);

  return null;
}
