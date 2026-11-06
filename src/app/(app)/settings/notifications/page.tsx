import { NotificationSettingsScreen } from "@/components/settings/notification-settings-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Notification settings" };

export default function NotificationSettingsPage() {
  return (
    <SettingsPageShell
      title="Notification settings"
      description="Alerts, messages, and activity updates"
    >
      <NotificationSettingsScreen />
    </SettingsPageShell>
  );
}
