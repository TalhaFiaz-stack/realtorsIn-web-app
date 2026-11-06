"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchReferralHistoryRequest,
  fetchReferralStatusRequest,
  fetchVerifiedBrokersRequest,
  markReferralModalShownRequest,
  skipReferralModalRequest,
} from "@/features/referral/services/referral.client";
import { ApiError } from "@/lib/api/errors";

export const referralStatusKey = ["referral", "status"] as const;
export const referralHistoryKey = ["referral", "history"] as const;

export function referralBrokersKey(search: string) {
  return ["referral", "verified-brokers", search] as const;
}

export function referralErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export function useReferralStatus() {
  return useQuery({
    queryKey: referralStatusKey,
    queryFn: ({ signal }) => fetchReferralStatusRequest(signal),
  });
}

export function useReferralHistory() {
  return useQuery({
    queryKey: referralHistoryKey,
    queryFn: ({ signal }) => fetchReferralHistoryRequest(signal),
  });
}

export function useVerifiedBrokers(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: referralBrokersKey(trimmed),
    queryFn: ({ signal }) =>
      fetchVerifiedBrokersRequest({
        page: 1,
        limit: 20,
        search: trimmed || undefined,
        signal,
      }),
  });
}

export function useReferralPromptActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: referralStatusKey });
  };

  const markShown = useMutation({
    mutationFn: () => markReferralModalShownRequest(),
    onSuccess: invalidate,
  });

  const skip = useMutation({
    mutationFn: () => skipReferralModalRequest(),
    onSuccess: invalidate,
  });

  return { markShown, skip };
}
