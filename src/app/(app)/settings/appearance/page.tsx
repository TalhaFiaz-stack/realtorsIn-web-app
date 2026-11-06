import { AppearanceSettingsScreen } from "@/components/settings/appearance-settings-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Appearance" };

export default function AppearanceSettingsPage() {
  return (
    <SettingsPageShell
      title="Appearance"
      description="Choose how RealtorsIn looks on this device"
    >
      <AppearanceSettingsScreen />
    </SettingsPageShell>
  );
}
