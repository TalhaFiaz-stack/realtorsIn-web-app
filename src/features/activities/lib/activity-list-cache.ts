import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { FeedPage } from "@/features/feed/types/post.types";
import { activityQueryPrefix } from "@/features/activities/lib/activity-cache";

type ActivityPostsInfinite = InfiniteData<FeedPage>;

export function removePostFromActivityPostsCache(
  queryClient: QueryClient,
  kind: "saved",
  postId: number
) {
  queryClient.setQueriesData<ActivityPostsInfinite>(
    { queryKey: ["activities", "posts", kind] },
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((p) => p.id !== postId),
          total: Math.max(0, page.total - 1),
        })),
      };
    }
  );
}

export function removePostsFromReactionsCache(
  queryClient: QueryClient,
  postIds: number[]
) {
  const idSet = new Set(postIds);
  queryClient.setQueriesData<ActivityPostsInfinite>(
    { queryKey: ["activities", "posts", "reactions"] },
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => {
          const removed = page.posts.filter((p) => idSet.has(p.id)).length;
          return {
            ...page,
            posts: page.posts.filter((p) => !idSet.has(p.id)),
            total: Math.max(0, page.total - removed),
          };
        }),
      };
    }
  );
}

export function refreshActivitySummary(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: activityQueryPrefix });
}
