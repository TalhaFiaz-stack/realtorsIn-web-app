import { SecuritySettingsScreen } from "@/components/settings/security-settings-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Password & security" };

export default function SecuritySettingsPage() {
  return (
    <SettingsPageShell
      title="Password & security"
      description="Update your RealtorsIn password"
    >
      <SecuritySettingsScreen />
    </SettingsPageShell>
  );
}
