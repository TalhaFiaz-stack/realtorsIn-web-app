"use client";

import { useTranslation } from "react-i18next";
import { LanguageSettingsScreen } from "@/components/settings/language-settings-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export function LanguageSettingsPageView() {
  const { t } = useTranslation();

  return (
    <SettingsPageShell
      title={t("Languages")}
      description={t("App language and regional preferences")}
      backLabel={t("Settings")}
    >
      <LanguageSettingsScreen />
    </SettingsPageShell>
  );
}
