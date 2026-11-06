import { describe, expect, it } from "vitest";
import {
  getConnectionRepostThoughts,
  mapFeedPage,
  mapFeedPost,
  isBackendSuccess,
} from "@/features/feed/lib/map-post";
import { dedupeCheck } from "@/features/feed/lib/map-post-test-helpers";

describe("mapFeedPost", () => {
  it("maps a verified list item without inventing fields", () => {
    const post = mapFeedPost({
      id: 42,
      name: "Ada Agent",
      user_name: "ada",
      user_image: "https://cdn.realtorsin.com/a.jpg",
      description: "Hello #uae",
      like_counts: 3,
      comment_counts: 1,
      is_liked: true,
      is_saved: false,
      images: [{ id: 1, image_url: "https://cdn.realtorsin.com/p.jpg" }],
      videos: [],
    });
    expect(post?.id).toBe(42);
    expect(post?.authorName).toBe("Ada Agent");
    expect(post?.likeCount).toBe(3);
    expect(post?.isLiked).toBe(true);
    expect(post?.images[0]?.url).toContain("cdn.realtorsin.com");
  });

  it("returns null for invalid rows", () => {
    expect(mapFeedPost({})).toBeNull();
  });

  it("maps connection repost info and nested repost_data", () => {
    const post = mapFeedPost({
      id: 99,
      name: "Reposter",
      description: "My take on this",
      repost_data: {
        id: 7,
        name: "Original Author",
        user_name: "orig",
        description: "Original caption",
        like_counts: 2,
        comment_counts: 0,
        images: [{ image_url: "https://cdn.example/o.jpg" }],
      },
      repost_info: {
        is_repost: true,
        total_reposts: 1,
        all_reposters: [
          {
            reposter_id: "5",
            reposter_name: "Sam",
            repost_text: "Great post!",
            reposted_at: "1h ago",
          },
        ],
      },
    });
    expect(post?.isRepostWithThoughts).toBe(true);
    expect(post?.repostData?.id).toBe(7);
    expect(post?.repostData?.description).toBe("Original caption");
    expect(post?.repostInfo?.isRepost).toBe(true);
    expect(getConnectionRepostThoughts(post?.repostInfo ?? null)).toBe(
      "Great post!"
    );
  });
});

describe("mapFeedPage", () => {
  it("dedupes and paginates from Laravel-style envelope", () => {
    const page = mapFeedPage({
      status: true,
      data: {
        current_page: 1,
        last_page: 2,
        next_page_url: "https://api.example/posts/list?page=2",
        per_page: 20,
        total: 2,
        data: [
          { id: 1, name: "A", description: "one" },
          { id: 1, name: "A", description: "dup" },
          { id: 2, name: "B", description: "two" },
        ],
      },
    });
    expect(page.hasNextPage).toBe(true);
    expect(dedupeCheck(page.posts.map((p) => p.id))).toEqual([1, 2]);
  });
});

describe("isBackendSuccess", () => {
  it("accepts boolean or string status", () => {
    expect(isBackendSuccess({ status: true })).toBe(true);
    expect(isBackendSuccess({ status: "true" })).toBe(true);
    expect(isBackendSuccess({ status: false })).toBe(false);
  });
});
