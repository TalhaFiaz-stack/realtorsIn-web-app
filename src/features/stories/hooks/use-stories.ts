"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStoryRequest,
  deleteStoryRequest,
  fetchStoriesFeedRequest,
  fetchStoryViewersRequest,
  markStoryViewedRequest,
  reactToStoryRequest,
  sendStoryReplyRequest,
} from "@/features/stories/services/stories.client";
import { ApiError } from "@/lib/api/errors";

export const storiesFeedKey = ["stories", "feed"] as const;

export function useStoriesFeed(enabled = true) {
  return useQuery({
    queryKey: storiesFeedKey,
    queryFn: ({ signal }) => fetchStoriesFeedRequest(signal),
    enabled,
    staleTime: 30_000,
  });
}

/** Story ring + viewer for a profile user (from stories feed, mobile StoryAwareAvatar parity). */
export function useStoryUserGroup(userId: number | null | undefined) {
  const feed = useStoriesFeed(userId != null && userId > 0);
  const groups = feed.data?.groups ?? [];
  const group = useMemo(() => {
    if (userId == null || userId <= 0) return null;
    return groups.find((item) => item.userId === userId) ?? null;
  }, [groups, userId]);
  return { group, groups };
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => createStoryRequest(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storiesFeedKey });
    },
  });
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: number) => markStoryViewedRequest(storyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storiesFeedKey });
    },
  });
}

export function useReactToStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { storyId: number; reaction?: string }) =>
      reactToStoryRequest(input.storyId, input.reaction ?? "heart"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storiesFeedKey });
    },
  });
}

export function useStoryViewers(storyId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["stories", "viewers", storyId],
    queryFn: () => fetchStoryViewersRequest(storyId!),
    enabled: enabled && storyId != null && storyId > 0,
    staleTime: 15_000,
  });
}

export function useStoryReply() {
  return useMutation({
    mutationFn: sendStoryReplyRequest,
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: number) => deleteStoryRequest(storyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: storiesFeedKey });
    },
  });
}

export function storiesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
