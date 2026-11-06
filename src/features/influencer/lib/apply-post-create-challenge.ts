import type { QueryClient } from "@tanstack/react-query";
import { emitInfluencerFirstVideoPrompt } from "@/features/influencer/lib/influencer-post-challenge-events";
import type { InfluencerPostCreateChallenge } from "@/features/influencer/types/influencer.types";
import { influencerStatusKey } from "@/features/influencer/hooks/use-influencer";

export function applyInfluencerPostCreateChallenge(
  queryClient: QueryClient,
  challenge: InfluencerPostCreateChallenge | null | undefined
): "first_video_popup" | "progress" | null {
  if (!challenge) return null;

  queryClient.setQueryData(influencerStatusKey, challenge);

  if (challenge.shouldShowStartPopup) {
    emitInfluencerFirstVideoPrompt({ status: challenge });
    return "first_video_popup";
  }

  if (challenge.countedTowardChallenge) {
    void queryClient.invalidateQueries({ queryKey: influencerStatusKey });
    void queryClient.invalidateQueries({ queryKey: ["profile"] });
    return "progress";
  }

  return null;
}
