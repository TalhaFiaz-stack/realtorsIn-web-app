import { describe, expect, it } from "vitest";
import { mapScheduledPostsPage } from "@/features/feed/lib/map-scheduled-post";

describe("mapScheduledPostsPage", () => {
  it("maps scheduled posts pagination", () => {
    const page = mapScheduledPostsPage({
      status: true,
      data: {
        posts: [
          {
            id: 1,
            description: "Hello",
            scheduled_at: "2026-12-01T10:00:00.000Z",
            images: [],
          },
        ],
        pagination: { total: 1, page: 1, limit: 20, total_pages: 1 },
      },
    });
    expect(page.posts).toHaveLength(1);
    expect(page.posts[0]?.id).toBe(1);
    expect(page.hasNextPage).toBe(false);
  });
});
