"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchFeedPageRequest,
  toggleLikeRequest,
  toggleSaveRequest,
} from "@/features/feed/services/posts.client";
import type { PostReactionType } from "@/features/feed/constants/post-reactions";
import {
  applyLikeSuccess,
  applyLikeSuccessOnPost,
  applyOptimisticLike,
  applyOptimisticLikeOnPost,
  applyOptimisticSave,
  applySaveSuccess,
  type FeedInfiniteData,
} from "@/features/feed/lib/feed-optimistic";
import {
  patchPostDetailCache,
  patchPostInAllProfilePostsCaches,
  profilePostsPrefix,
} from "@/features/feed/lib/patch-feed-caches";
import type { FeedPost } from "@/features/feed/types/post.types";
import { FEED_LIST_PAGE_SIZE } from "@/features/feed/constants/feed.constants";
import { ApiError } from "@/lib/api/errors";

export const feedQueryKey = ["feed", "home"] as const;

export type FeedQueryFilters = {
  feedType?: "off_plan" | "properties" | "inquiries" | "video";
  propertyCategory?: "apartment" | "villa" | "townhouse" | "penthouse";
  listingTransaction?: "sale" | "rent";
  inquiryType?: "buy" | "rent";
};

export function feedFiltersQueryKey(filters?: FeedQueryFilters) {
  return [
    "feed",
    "home",
    filters?.feedType ?? "all",
    filters?.propertyCategory ?? "all",
    filters?.listingTransaction ?? "all",
    filters?.inquiryType ?? "all",
  ] as const;
}

function dedupePosts(posts: FeedPost[]): FeedPost[] {
  const seen = new Set<number>();
  const out: FeedPost[] = [];
  for (const post of posts) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    out.push(post);
  }
  return out;
}

export function useFeed(filters?: FeedQueryFilters) {
  const queryKey = feedFiltersQueryKey(filters);
  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchFeedPageRequest({
        page: pageParam,
        perPage: FEED_LIST_PAGE_SIZE,
        // Mobile parity: `refresh_feed` only on explicit pull-to-refresh
        // (see useFeedPullRefresh), never on normal loads.
        refreshFeed: false,
        feedType: filters?.feedType,
        propertyCategory: filters?.propertyCategory,
        listingTransaction: filters?.listingTransaction,
        inquiryType: filters?.inquiryType,
        signal,
      }),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
    // Backend feed is slow (~5s/page). Returning to Home within a few minutes
    // should show the cached list instantly instead of re-fetching every
    // loaded page; pull-to-refresh / the refresh button still force fresh data.
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
  });

  const posts = dedupePosts(
    query.data?.pages.flatMap((page) => page.posts) ?? []
  );

  return {
    posts,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    isRefetching: query.isRefetching && !query.isFetchingNextPage,
  };
}

export const feedHomePrefix = ["feed", "home"] as const;

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      postId: number;
      reactionType?: string | null;
      isTapToggle?: boolean;
    }) => toggleLikeRequest(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: feedHomePrefix });
      await queryClient.cancelQueries({ queryKey: profilePostsPrefix });
      const previous = queryClient.getQueriesData<FeedInfiniteData>({
        queryKey: feedHomePrefix,
      });
      const previousProfile = queryClient.getQueriesData<FeedInfiniteData>({
        queryKey: profilePostsPrefix,
      });
      const previousDetail = queryClient.getQueryData<FeedPost>(
        ["post", input.postId]
      );
      const optimisticInput = {
        reactionType: (input.reactionType ?? null) as PostReactionType | null,
        isTapToggle: input.isTapToggle ?? input.reactionType == null,
      };

      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: feedHomePrefix },
        (current) => applyOptimisticLike(current, input.postId, optimisticInput)
      );
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: profilePostsPrefix },
        (current) => applyOptimisticLike(current, input.postId, optimisticInput)
      );
      patchPostDetailCache(queryClient, input.postId, (post) =>
        applyOptimisticLikeOnPost(post, optimisticInput)
      );

      return {
        previous,
        previousProfile,
        previousDetail,
        postId: input.postId,
      };
    },
    onError: (_err, input, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      ctx?.previousProfile?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (ctx?.previousDetail != null && ctx.postId != null) {
        queryClient.setQueryData(["post", ctx.postId], ctx.previousDetail);
      }
    },
    onSuccess: (result, input) => {
      const reconcile = (post: FeedPost) =>
        applyLikeSuccessOnPost(post, {
          isLiked: result.isLiked,
          userReaction: result.userReaction as PostReactionType | null,
        });
      const successPayload = {
        isLiked: result.isLiked,
        userReaction: result.userReaction as PostReactionType | null,
      };

      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: feedHomePrefix },
        (current) => applyLikeSuccess(current, input.postId, successPayload)
      );
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: profilePostsPrefix },
        (current) => applyLikeSuccess(current, input.postId, successPayload)
      );
      patchPostDetailCache(queryClient, input.postId, reconcile);
    },
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleSaveRequest(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: feedHomePrefix });
      await queryClient.cancelQueries({ queryKey: profilePostsPrefix });
      const previous = queryClient.getQueriesData<FeedInfiniteData>({
        queryKey: feedHomePrefix,
      });
      const previousProfile = queryClient.getQueriesData<FeedInfiniteData>({
        queryKey: profilePostsPrefix,
      });
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: feedHomePrefix },
        (current) => applyOptimisticSave(current, postId)
      );
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: profilePostsPrefix },
        (current) => applyOptimisticSave(current, postId)
      );
      return { previous, previousProfile };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      ctx?.previousProfile?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (result, postId) => {
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: feedHomePrefix },
        (current) => applySaveSuccess(current, postId, result.isSaved)
      );
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: profilePostsPrefix },
        (current) => applySaveSuccess(current, postId, result.isSaved)
      );
    },
  });
}

export function feedErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "SESSION_EXPIRED") {
      return "Your session expired. Sign in again.";
    }
    return error.message;
  }
  return "Unable to load the feed";
}
