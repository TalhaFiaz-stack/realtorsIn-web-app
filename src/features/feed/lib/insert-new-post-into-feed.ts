import type { QueryClient } from "@tanstack/react-query";
import { feedHomePrefix } from "@/features/feed/hooks/use-feed";
import { postDetailKey } from "@/features/feed/hooks/use-post-detail";
import {
  prependPostToFeedCaches,
  type FeedInfiniteData,
} from "@/features/feed/lib/feed-optimistic";
import { fetchPostDetailsRequest } from "@/features/feed/services/posts.client";

export async function insertNewPostAtFeedTop(
  queryClient: QueryClient,
  postId: number
): Promise<void> {
  try {
    const post = await fetchPostDetailsRequest(postId);
    queryClient.setQueriesData<FeedInfiniteData>(
      { queryKey: feedHomePrefix },
      (current) => prependPostToFeedCaches(current, post)
    );
    queryClient.setQueryData(postDetailKey(postId), post);
  } catch {
    await queryClient.invalidateQueries({ queryKey: feedHomePrefix });
  }
}
