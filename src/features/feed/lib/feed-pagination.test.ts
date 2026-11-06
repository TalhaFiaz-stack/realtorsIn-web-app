import { describe, expect, it } from "vitest";
import {
  feedHasMoreLikeMobile,
  feedInfiniteNextPageParam,
  hasValidFeedNextPageUrl,
  mergeFeedPagesUnique,
} from "@/features/feed/lib/feed-pagination";
import type { FeedPage } from "@/features/feed/types/post.types";

function page(
  overrides: Partial<FeedPage> & Pick<FeedPage, "page" | "posts">
): FeedPage {
  return {
    perPage: 20,
    total: overrides.posts.length,
    lastPage: 1,
    hasNextPage: true,
    ...overrides,
  };
}

describe("hasValidFeedNextPageUrl", () => {
  it("accepts real urls and rejects null placeholders", () => {
    expect(
      hasValidFeedNextPageUrl("https://api.example/posts/list?page=2")
    ).toBe(true);
    expect(hasValidFeedNextPageUrl("null")).toBe(false);
    expect(hasValidFeedNextPageUrl(null)).toBe(false);
  });
});

describe("feedHasMoreLikeMobile", () => {
  it("uses next_page_url for paginated envelopes", () => {
    expect(
      feedHasMoreLikeMobile({
        postsCount: 3,
        perPage: 20,
        nextPageUrl: "https://api.example/posts/list?page=3",
        isPaginatedEnvelope: true,
      })
    ).toBe(true);
  });

  it("stops when paginated and next_page_url is missing", () => {
    expect(
      feedHasMoreLikeMobile({
        postsCount: 3,
        perPage: 20,
        nextPageUrl: null,
        isPaginatedEnvelope: true,
      })
    ).toBe(false);
  });

  it("uses full-page heuristic for non-paginated array responses", () => {
    expect(
      feedHasMoreLikeMobile({
        postsCount: 20,
        perPage: 20,
        nextPageUrl: null,
        isPaginatedEnvelope: false,
      })
    ).toBe(true);
  });

  it("stops on empty pages", () => {
    expect(
      feedHasMoreLikeMobile({
        postsCount: 0,
        perPage: 20,
        nextPageUrl: "https://api.example/posts/list?page=2",
        isPaginatedEnvelope: true,
      })
    ).toBe(false);
  });
});

describe("feedInfiniteNextPageParam", () => {
  it("advances while hasNextPage is true", () => {
    expect(
      feedInfiniteNextPageParam(
        page({ page: 2, posts: [{ id: 1 } as FeedPage["posts"][0]], hasNextPage: true })
      )
    ).toBe(3);
  });

  it("stops when hasNextPage is false", () => {
    expect(
      feedInfiniteNextPageParam(
        page({ page: 63, posts: [{ id: 1 } as FeedPage["posts"][0]], hasNextPage: false })
      )
    ).toBeUndefined();
  });
});

describe("mergeFeedPagesUnique", () => {
  it("dedupes across pages like mobile append", () => {
    const merged = mergeFeedPagesUnique([
      page({ page: 1, posts: [{ id: 1 } as FeedPage["posts"][0]] }),
      page({ page: 2, posts: [{ id: 1 }, { id: 2 }] as FeedPage["posts"] }),
    ]);
    expect(merged.map((p) => p.id)).toEqual([1, 2]);
  });
});
