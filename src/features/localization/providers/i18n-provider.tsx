"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { LocaleDocumentSync } from "@/features/localization/providers/locale-document-sync";
import {
  ensureI18nInitialized,
  getI18nInstance,
} from "@/features/localization/i18n/create-i18n";
import { readStoredLocale } from "@/features/localization/lib/locale-storage";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const locale = readStoredLocale();
    let active = true;
    void ensureI18nInitialized(locale).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <I18nextProvider i18n={getI18nInstance()}>
      <LocaleDocumentSync enabled={ready} />
      {children}
    </I18nextProvider>
  );
}
