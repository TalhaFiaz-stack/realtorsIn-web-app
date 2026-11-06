"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dismissInfluencerFirstPopupRequest,
  fetchInfluencerStatusRequest,
  markInfluencerModalShownRequest,
  skipInfluencerModalRequest,
  startInfluencerChallengeRequest,
} from "@/features/influencer/services/influencer.client";
import type { InfluencerStatus } from "@/features/influencer/types/influencer.types";
import { ApiError } from "@/lib/api/errors";

export const influencerStatusKey = ["influencer", "status"] as const;

export function influencerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export function useInfluencerStatus() {
  return useQuery({
    queryKey: influencerStatusKey,
    queryFn: ({ signal }) => fetchInfluencerStatusRequest(signal),
  });
}

export function useInfluencerMutations() {
  const queryClient = useQueryClient();

  const setStatus = (status: InfluencerStatus) => {
    queryClient.setQueryData(influencerStatusKey, status);
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: influencerStatusKey });
    void queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  const startChallenge = useMutation({
    mutationFn: (fromFirstVideoPopup?: boolean) =>
      startInfluencerChallengeRequest({ fromFirstVideoPopup }),
    onSuccess: (status) => {
      setStatus(status);
      invalidate();
    },
  });

  const dismissFirstPopup = useMutation({
    mutationFn: () => dismissInfluencerFirstPopupRequest(),
    onSuccess: () => invalidate(),
  });

  const markModalShown = useMutation({
    mutationFn: () => markInfluencerModalShownRequest(),
    onSuccess: () => invalidate(),
  });

  const skipModal = useMutation({
    mutationFn: () => skipInfluencerModalRequest(),
    onSuccess: () => invalidate(),
  });

  return {
    startChallenge,
    dismissFirstPopup,
    markModalShown,
    skipModal,
  };
}
