"use client";

import { useTranslation } from "react-i18next";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";
import { SettingsScreen } from "@/components/settings/settings-screen";

export function SettingsPageView() {
  const { t } = useTranslation();

  return (
    <SettingsPageShell
      title={t("Settings")}
      description={t("Manage your account settings")}
      backHref="/feed"
      backLabel={t("Home")}
    >
      <SettingsScreen />
    </SettingsPageShell>
  );
}
