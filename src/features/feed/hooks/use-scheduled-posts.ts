"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cancelScheduledPostRequest,
  fetchScheduledPostsRequest,
  updateScheduledPostRequest,
} from "@/features/feed/services/scheduled-posts.client";
import { ApiError } from "@/lib/api/errors";

export function scheduledPostsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export function useScheduledPostsList() {
  return useInfiniteQuery({
    queryKey: ["posts", "scheduled"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchScheduledPostsRequest({ page: pageParam, signal }),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
  });
}

export function useCancelScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => cancelScheduledPostRequest(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts", "scheduled"] });
    },
  });
}

export function useUpdateScheduledPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScheduledPostRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts", "scheduled"] });
    },
  });
}
