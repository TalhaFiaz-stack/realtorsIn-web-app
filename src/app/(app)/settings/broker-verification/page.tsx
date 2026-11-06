import { BrokerVerificationScreen } from "@/components/broker-verification/broker-verification-screen";
import { SettingsPageShell } from "@/components/settings/settings-page-shell";

export const metadata = { title: "Broker verification" };

export default function BrokerVerificationSettingsPage() {
  return (
    <SettingsPageShell
      title="Broker verification"
      description="Submit your broker card for review — same flow as the mobile app"
    >
      <BrokerVerificationScreen />
    </SettingsPageShell>
  );
}
