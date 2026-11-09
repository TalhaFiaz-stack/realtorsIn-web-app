"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFollowedHashtagsRequest,
  followHashtagRequest,
  unfollowHashtagRequest,
} from "@/features/hashtag/services/hashtag.client";
import { ApiError } from "@/lib/api/errors";
import { showAppToast } from "@/lib/toast/app-toast";

export function followedHashtagsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export function useFollowedHashtags() {
  return useQuery({
    queryKey: ["hashtags", "followed"],
    queryFn: ({ signal }) => fetchFollowedHashtagsRequest(signal),
  });
}

export function useUnfollowHashtag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfollowHashtagRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hashtags", "followed"] });
    },
  });
}

export function useFollowHashtag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followHashtagRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hashtags", "followed"] });
    },
    onError: (error) =>
      showAppToast.fromError(error, "Could not follow tag"),
  });
}
