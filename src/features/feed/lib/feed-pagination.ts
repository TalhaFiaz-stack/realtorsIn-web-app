import type { FeedPage, FeedPost } from "@/features/feed/types/post.types";

/** Mobile `useSocialFeedController`: valid next_page_url string. */
export function hasValidFeedNextPageUrl(nextPageUrl: string | null): boolean {
  if (!nextPageUrl) return false;
  const normalized = nextPageUrl.trim().toLowerCase();
  return normalized.length > 0 && normalized !== "null";
}

/**
 * Mirrors mobile feed `hasMore`:
 * - empty page → false
 * - non-paginated array response → length >= perPage
 * - Laravel pagination envelope → next_page_url only
 */
export function feedHasMoreLikeMobile(input: {
  postsCount: number;
  perPage: number;
  nextPageUrl: string | null;
  isPaginatedEnvelope: boolean;
}): boolean {
  const { postsCount, perPage, nextPageUrl, isPaginatedEnvelope } = input;
  if (postsCount === 0) return false;
  if (!isPaginatedEnvelope) {
    return postsCount >= perPage;
  }
  return hasValidFeedNextPageUrl(nextPageUrl);
}

/** Append feed pages with dedupe by post id (mobile list append). */
export function mergeFeedPagesUnique(pages: FeedPage[]): FeedPost[] {
  const seen = new Set<number>();
  const out: FeedPost[] = [];
  for (const page of pages) {
    for (const post of page.posts) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      out.push(post);
    }
  }
  return out;
}

/** Uses `hasNextPage` from the mapped API page (same signal mobile uses via next_page_url). */
export function feedInfiniteNextPageParam(
  lastPage: FeedPage
): number | undefined {
  if (!lastPage.hasNextPage || lastPage.posts.length === 0) return undefined;
  return lastPage.page + 1;
}
