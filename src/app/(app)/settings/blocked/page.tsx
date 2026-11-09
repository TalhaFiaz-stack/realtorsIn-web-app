import { BlockedUsersScreen } from "@/components/settings/blocked-users-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Blocked users" };

export default function BlockedUsersPage() {
  return (
    <SettingsPageShell
      title="Blocked users"
      description="Members you have blocked in messages"
    >
      <BlockedUsersScreen />
    </SettingsPageShell>
  );
}
