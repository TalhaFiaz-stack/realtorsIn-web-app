"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchActivityCommentsPageRequest,
  fetchActivityPostsPageRequest,
  fetchActivityReactionsPageRequest,
  fetchActivityRepostsPageRequest,
  fetchActivitySummaryRequest,
} from "@/features/activities/services/activities.client";
import type { ActivityPostsKind } from "@/features/activities/types/activity.types";
import type { ActivityReactionsFilter } from "@/features/activities/types/reactions.types";
import { ApiError } from "@/lib/api/errors";

export function useActivitySummary() {
  return useQuery({
    queryKey: ["activities", "summary"],
    queryFn: ({ signal }) => fetchActivitySummaryRequest(signal),
    select: (data) => data.summary,
  });
}

export function useActivityReactions(filter: ActivityReactionsFilter) {
  return useInfiniteQuery({
    queryKey: ["activities", "posts", "reactions", filter],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchActivityReactionsPageRequest(pageParam, filter, signal),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function useActivityPosts(kind: ActivityPostsKind) {
  return useInfiniteQuery({
    queryKey: ["activities", "posts", kind],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchActivityPostsPageRequest(kind, pageParam, signal),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function useActivityReposts() {
  return useInfiniteQuery({
    queryKey: ["activities", "reposts"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchActivityRepostsPageRequest(pageParam, signal),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function useActivityComments() {
  return useInfiniteQuery({
    queryKey: ["activities", "comments"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchActivityCommentsPageRequest(pageParam, signal),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function activityErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
