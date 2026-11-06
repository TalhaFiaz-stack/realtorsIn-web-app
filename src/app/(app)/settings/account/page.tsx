import { AccountSettingsScreen } from "@/components/settings/account-settings-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Account management" };

export default function AccountSettingsPage() {
  return (
    <SettingsPageShell
      title="Account management"
      description="Password, app lock, and account deletion"
    >
      <AccountSettingsScreen />
    </SettingsPageShell>
  );
}
