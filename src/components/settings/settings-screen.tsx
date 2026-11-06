"use client";

import {
  Bell,
  Globe,
  Palette,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsNavRow } from "@/components/settings/settings-nav-row";

export function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <SettingsNavRow
        href="/me"
        icon={UserRound}
        title={t("View profile")}
        subtitle={t("Edit intro, experience, and visibility")}
        iconClassName="bg-primary/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/settings/notifications"
        icon={Bell}
        title={t("Notification Settings")}
        subtitle={t("Alerts, messages, and activity updates")}
        iconClassName="bg-amber-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/settings/appearance"
        icon={Palette}
        title={t("Appearance")}
        subtitle={t("Light, dark, or system theme")}
        iconClassName="bg-violet-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/settings/language"
        icon={Globe}
        title={t("Languages")}
        subtitle={t("App language and regional preferences")}
        iconClassName="bg-sky-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/settings/security"
        icon={Shield}
        title={t("Password & security")}
        subtitle={t("Update your RealtorsIn password")}
        iconClassName="bg-sky-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/settings/broker-verification"
        icon={ShieldCheck}
        title={t("Broker verification")}
        subtitle={t("Upload broker card and ID for the verified badge")}
        iconClassName="bg-emerald-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/settings/account"
        icon={UserCog}
        title={t("Account Management")}
        subtitle={t("Deletion requests and permanent removal")}
        iconClassName="bg-rose-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/invite"
        icon={UserRound}
        title={t("Invite Friends")}
        subtitle={t("Refer colleagues and earn the Connector Badge")}
        iconClassName="bg-emerald-500/10"
      />
      <div className="border-t border-border" />
      <SettingsNavRow
        href="/growth/influencer"
        icon={Sparkles}
        title={t("Influencer Challenge")}
        subtitle={t("Post videos to earn the Influencer Badge")}
        iconClassName="bg-violet-500/10"
      />
    </div>
  );
}
