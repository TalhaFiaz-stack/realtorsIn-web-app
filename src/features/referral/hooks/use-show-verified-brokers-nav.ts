"use client";

import { useOwnProfile } from "@/features/profile/hooks/use-profile";
import { useReferralStatus } from "@/features/referral/hooks/use-referral";

/**
 * Mobile shows the Verified Brokers shortcut when the connector badge is earned
 * (`hasBadge`). Also show for verified brokers so the directory is discoverable.
 */
export function useShowVerifiedBrokersNav(): boolean {
  const { data: profile } = useOwnProfile();
  const statusQuery = useReferralStatus();
  const status = statusQuery.data;

  return Boolean(
    profile?.hasConnectorBadge ||
      profile?.brokerCardVerified ||
      status?.hasConnectorBadge,
  );
}
