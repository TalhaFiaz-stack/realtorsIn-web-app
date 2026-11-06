"use client";

import { useCallback, useState } from "react";
import { ReferralHistoryList } from "@/components/referral/referral-history-list";
import { ReferralInvitePanel } from "@/components/referral/referral-invite-panel";
import { VerifiedBrokersPanel } from "@/components/referral/verified-brokers-panel";
import { ErrorState } from "@/components/states/error-state";
import { InviteFriendsDetailSkeleton } from "@/components/settings/settings-detail-skeleton";
import {
  referralErrorMessage,
  useReferralHistory,
  useReferralStatus,
} from "@/features/referral/hooks/use-referral";
import { shareReferralInvite } from "@/features/referral/lib/share-referral-invite";
import { copyTextToClipboard } from "@/lib/clipboard";
import { showAppToast } from "@/lib/toast/app-toast";
import { Button } from "@/components/ui/button";

export function InviteFriendsScreen() {
  const statusQuery = useReferralStatus();
  const historyQuery = useReferralHistory();
  const [sharePending, setSharePending] = useState(false);

  const status = statusQuery.data ?? historyQuery.data?.status ?? null;
  const referrals = historyQuery.data?.referrals ?? [];
  const historyLoading =
    historyQuery.isPending ||
    historyQuery.isLoading ||
    (historyQuery.isFetching && referrals.length === 0);

  const handleCopy = useCallback(async () => {
    if (!status?.referralCode) return;
    const ok = await copyTextToClipboard(status.referralCode);
    if (ok) {
      showAppToast.success(
        "Code copied",
        "Share this code when friends sign up on RealtorsIn."
      );
    } else {
      showAppToast.error(
        "Unable to copy code",
        "Select the code manually or try again."
      );
    }
  }, [status?.referralCode]);

  const handleShare = useCallback(async () => {
    if (!status?.referralCode) return;
    setSharePending(true);
    try {
      const outcome = await shareReferralInvite({
        referralCode: status.referralCode,
        origin: window.location.origin,
      });
      if (outcome === "cancelled") return;
      if (outcome === "shared") {
        showAppToast.success(
          "Invite shared",
          "Your colleague can use your referral code when they join."
        );
        return;
      }
      if (outcome === "copied") {
        showAppToast.success(
          "Invite copied",
          "Paste the message in WhatsApp, email, or anywhere you chat."
        );
        return;
      }
      showAppToast.success(
        "Opening WhatsApp",
        "Finish sending the prefilled invite message in WhatsApp."
      );
    } catch {
      showAppToast.error(
        "Unable to share invite",
        "Try Copy on your code, or copy the invite text again."
      );
    } finally {
      setSharePending(false);
    }
  }, [status?.referralCode]);

  const loading = statusQuery.isLoading && !status;
  const error = statusQuery.error ?? historyQuery.error;

  if (loading) {
    return <InviteFriendsDetailSkeleton />;
  }

  if (error || !status) {
    return (
      <ErrorState
        title="Unable to load invites"
        description={referralErrorMessage(error)}
        onRetry={() => {
          void statusQuery.refetch();
          void historyQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-2">
      <ReferralInvitePanel
        status={status}
        onCopy={() => void handleCopy()}
        onShare={() => void handleShare()}
        sharePending={sharePending}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={historyQuery.isFetching || statusQuery.isFetching}
          onClick={() => {
            void statusQuery.refetch();
            void historyQuery.refetch();
          }}
        >
          Refresh
        </Button>
      </div>

      <ReferralHistoryList
        referrals={referrals}
        loading={historyLoading}
        hasBadge={status.hasConnectorBadge}
      />

      <VerifiedBrokersPanel enabled={status.canRefer} />
    </div>
  );
}
