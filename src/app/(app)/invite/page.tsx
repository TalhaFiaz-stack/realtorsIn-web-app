import { InviteFriendsScreen } from "@/components/referral/invite-friends-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Invite friends" };

export default function InviteFriendsPage() {
  return (
    <SettingsPageShell
      title="Invite friends"
      description="Share your code, earn the Connector Badge, and grow your network"
      backHref="/settings"
      backLabel="Settings"
    >
      <InviteFriendsScreen />
    </SettingsPageShell>
  );
}
