import { VerifiedBrokersScreen } from "@/components/referral/verified-brokers-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Verified brokers" };

export default function VerifiedBrokersPage() {
  return (
    <SettingsPageShell
      title="Verified brokers"
      description="Connect with brokers who verified their card on RealtorsIn."
      backHref="/connections"
      backLabel="Network"
    >
      <VerifiedBrokersScreen />
    </SettingsPageShell>
  );
}
