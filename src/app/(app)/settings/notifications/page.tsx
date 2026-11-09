import { NotificationSettingsScreen } from "@/components/settings/notification-settings-screen";
import { BrowserNotificationsCard } from "@/components/settings/browser-notifications-card";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Notification settings" };

export default function NotificationSettingsPage() {
  return (
    <SettingsPageShell
      title="Notification settings"
      description="Alerts, messages, and activity updates"
    >
      <BrowserNotificationsCard />
      <NotificationSettingsScreen />
    </SettingsPageShell>
  );
}
