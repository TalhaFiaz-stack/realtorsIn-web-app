"use client";

import { useCreatePostComposer } from "@/components/feed/create-post-provider";

import { InfluencerChallengeBody } from "@/components/influencer/influencer-challenge-body";
import { InfluencerChallengeSkeleton } from "@/components/influencer/influencer-challenge-skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  influencerErrorMessage,
  useInfluencerMutations,
  useInfluencerStatus,
} from "@/features/influencer/hooks/use-influencer";
import { showAppToast } from "@/lib/toast/app-toast";

export function InfluencerChallengeScreen() {
  const { openComposer } = useCreatePostComposer();
  const statusQuery = useInfluencerStatus();
  const { startChallenge } = useInfluencerMutations();

  const status = statusQuery.data;

  async function handlePrimary() {
    if (!status) return;
    try {
      await startChallenge.mutateAsync(false);
      showAppToast.success(
        "Challenge started",
        "Post videos from Create — up to the daily cap counts toward your badge."
      );
      openComposer("video");
    } catch (error) {
      showAppToast.fromError(error, "Could not start challenge");
    }
  }

  if (statusQuery.isLoading && !status) {
    return <InfluencerChallengeSkeleton />;
  }

  if (statusQuery.error || !status) {
    return (
      <ErrorState
        title="Unable to load challenge"
        description={influencerErrorMessage(statusQuery.error)}
        onRetry={() => void statusQuery.refetch()}
      />
    );
  }

  if (!status.featureEnabled) {
    return (
      <ErrorState
        title="Challenge unavailable"
        description="The Influencer Badge program is turned off right now. Check back later."
      />
    );
  }

  return (
    <InfluencerChallengeBody
      status={status}
      actionPending={startChallenge.isPending}
      onPrimaryAction={() => void handlePrimary()}
    />
  );
}
