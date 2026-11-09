import { BrokerGateProvider } from "@/components/broker-verification/broker-gate-provider";
import { Suspense } from "react";
import { CampaignHost } from "@/components/campaigns/campaign-host";
import { WebPushBridge } from "@/components/providers/web-push-bridge";
import { MemberTelemetry } from "@/components/providers/member-telemetry";
import { CreatePostProvider } from "@/components/feed/create-post-provider";
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
      <MemberTelemetry />
      <WebPushBridge />
      <Suspense fallback={null}>
        <CampaignHost />
      </Suspense>
      <CreatePostProvider
        displayName={member.fullName || member.name || member.userName || "Member"}
        avatarUrl={member.avatarUrl}
      >
        <AppShell member={member} rightRail={<ShellSuggestionsRail />}>
          {children}
        </AppShell>
      </CreatePostProvider>
    </BrokerGateProvider>
  );
}
