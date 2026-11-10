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
import type { StoriesFeed } from "@/features/stories/types/story.types";
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
    // Patch the cache instead of refetching: the ring arc greys out at once,
    // and the open viewer isn't disturbed by a list refresh mid-playback.
    onMutate: (storyId) => {
      queryClient.setQueryData<StoriesFeed>(storiesFeedKey, (current) =>
        current ? markStoryViewedInFeed(current, storyId) : current
      );
    },
  });
}

/** Pure helper (exported for tests): mark one story seen and recompute `hasUnseen`. */
export function markStoryViewedInFeed(feed: StoriesFeed, storyId: number): StoriesFeed {
  let changed = false;
  const groups = feed.groups.map((group) => {
    if (!group.stories.some((s) => s.id === storyId && !s.hasViewed)) return group;
    changed = true;
    const stories = group.stories.map((s) => (s.id === storyId ? { ...s, hasViewed: true } : s));
    return { ...group, stories, hasUnseen: stories.some((s) => !s.hasViewed) };
  });
  return changed ? { ...feed, groups } : feed;
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
    // Drop it from the rail/viewer at once (mobile parity); restore on failure.
    onMutate: async (storyId) => {
      await queryClient.cancelQueries({ queryKey: storiesFeedKey });
      const previous = queryClient.getQueryData<StoriesFeed>(storiesFeedKey);
      queryClient.setQueryData<StoriesFeed>(storiesFeedKey, (current) =>
        current ? removeStoryFromFeed(current, storyId) : current
      );
      return { previous };
    },
    onError: (_error, _storyId, context) => {
      if (context?.previous) queryClient.setQueryData(storiesFeedKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: storiesFeedKey });
    },
  });
}

/** Pure helper (exported for tests): remove one story; drop groups left empty. */
export function removeStoryFromFeed(feed: StoriesFeed, storyId: number): StoriesFeed {
  if (!feed.groups.some((group) => group.stories.some((s) => s.id === storyId))) return feed;
  const groups = feed.groups
    .map((group) => {
      if (!group.stories.some((s) => s.id === storyId)) return group;
      const stories = group.stories.filter((s) => s.id !== storyId);
      return { ...group, stories, hasUnseen: stories.some((s) => !s.hasViewed) };
    })
    .filter((group) => group.stories.length > 0);
  return { ...feed, groups };
}

export function storiesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
