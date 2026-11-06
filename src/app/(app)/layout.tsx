import { BrokerGateProvider } from "@/components/broker-verification/broker-gate-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ShellSuggestionsRail } from "@/components/layout/shell-suggestions-rail";
import { requireMember } from "@/lib/auth/require-member";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireMember({ nextPath: "/feed" });

  return (
    <BrokerGateProvider>
      <AppShell member={member} rightRail={<ShellSuggestionsRail />}>
        {children}
      </AppShell>
    </BrokerGateProvider>
  );
}
