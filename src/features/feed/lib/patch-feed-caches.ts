import type { QueryClient } from "@tanstack/react-query";
import { feedHomePrefix } from "@/features/feed/hooks/use-feed";
import {
  findPostInFeed,
  patchPostInPages,
  type FeedInfiniteData,
} from "@/features/feed/lib/feed-optimistic";
import type { FeedPost } from "@/features/feed/types/post.types";

/** All profile post tabs (`["profile", "posts", userId]`). */
export const profilePostsPrefix = ["profile", "posts"] as const;

export function postDetailQueryKey(postId: number) {
  return ["post", postId] as const;
}

/** Update a post everywhere it appears in home feed caches (all filter variants). */
export function patchPostInAllFeedCaches(
  queryClient: QueryClient,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  queryClient.setQueriesData<FeedInfiniteData>(
    { queryKey: feedHomePrefix },
    (current) => {
      if (!current?.pages) return current;
      return {
        ...current,
        pages:
          patchPostInPages(current.pages, postId, updater) ?? current.pages,
      };
    }
  );
}

export function findPostInFeedCaches(
  queryClient: QueryClient,
  postId: number
): FeedPost | undefined {
  const entries = queryClient.getQueriesData<FeedInfiniteData>({
    queryKey: feedHomePrefix,
  });
  for (const [, data] of entries) {
    const found = findPostInFeed(data, postId);
    if (found) return found;
  }
  return undefined;
}

export function patchPostInAllProfilePostsCaches(
  queryClient: QueryClient,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  queryClient.setQueriesData<FeedInfiniteData>(
    { queryKey: profilePostsPrefix },
    (current) => {
      if (!current?.pages) return current;
      return {
        ...current,
        pages:
          patchPostInPages(current.pages, postId, updater) ?? current.pages,
      };
    }
  );
}

export function findPostInProfilePostsCaches(
  queryClient: QueryClient,
  postId: number
): FeedPost | undefined {
  const entries = queryClient.getQueriesData<FeedInfiniteData>({
    queryKey: profilePostsPrefix,
  });
  for (const [, data] of entries) {
    const found = findPostInFeed(data, postId);
    if (found) return found;
  }
  return undefined;
}

export function patchPostDetailCache(
  queryClient: QueryClient,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  queryClient.setQueryData<FeedPost>(postDetailQueryKey(postId), (current) =>
    current ? updater(current) : current
  );
}

/** Set detail cache when missing (e.g. comments modal before fetch completes). */
export function ensurePostDetailCache(
  queryClient: QueryClient,
  postId: number,
  seed: FeedPost
) {
  const key = postDetailQueryKey(postId);
  if (!queryClient.getQueryData<FeedPost>(key)) {
    queryClient.setQueryData(key, seed);
  }
}

export function applyPostLikeOptimisticEverywhere(
  queryClient: QueryClient,
  postId: number,
  input: {
    reactionType?: FeedPost["userReaction"];
    isTapToggle?: boolean;
  },
  apply: (
    post: FeedPost,
    optimistic: typeof input
  ) => FeedPost
): FeedPost | null {
  const detailKey = postDetailQueryKey(postId);
  const previousDetail = queryClient.getQueryData<FeedPost>(detailKey);
  const base =
    previousDetail ??
    findPostInFeedCaches(queryClient, postId) ??
    findPostInProfilePostsCaches(queryClient, postId);
  if (!base) return null;

  const next = apply(base, input);
  queryClient.setQueryData(detailKey, next);
  patchPostInAllFeedCaches(queryClient, postId, () => next);
  patchPostInAllProfilePostsCaches(queryClient, postId, () => next);
  return next;
}

export function patchPostEverywhere(
  queryClient: QueryClient,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  patchPostInAllFeedCaches(queryClient, postId, updater);
  patchPostInAllProfilePostsCaches(queryClient, postId, updater);
  patchPostDetailCache(queryClient, postId, updater);
}
