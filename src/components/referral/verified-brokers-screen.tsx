"use client";

import Link from "next/link";
import { VerifiedBrokersPanel } from "@/components/referral/verified-brokers-panel";
import { InviteFriendsDetailSkeleton } from "@/components/settings/settings-detail-skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  referralErrorMessage,
  useReferralStatus,
} from "@/features/referral/hooks/use-referral";

export function VerifiedBrokersScreen() {
  const statusQuery = useReferralStatus();
  const status = statusQuery.data;

  if (statusQuery.isLoading && !status) {
    return <InviteFriendsDetailSkeleton />;
  }

  if (statusQuery.isError) {
    return (
      <ErrorState
        title="Unable to load directory"
        description={referralErrorMessage(statusQuery.error)}
        onRetry={() => void statusQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-2">
      <VerifiedBrokersPanel enabled showHeader={false} />
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/invite" className="text-primary hover:underline">
          Invite friends
        </Link>{" "}
        to unlock the full verified broker directory if access is limited.
      </p>
    </div>
  );
}
