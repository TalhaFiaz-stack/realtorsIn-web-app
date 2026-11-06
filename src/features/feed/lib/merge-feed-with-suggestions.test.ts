import { describe, expect, it } from "vitest";
import { mergeFeedWithSuggestions } from "@/features/feed/lib/merge-feed-with-suggestions";
import type { FeedPost } from "@/features/feed/types/post.types";

function post(id: number): FeedPost {
  return {
    id,
    userId: "1",
    authorName: "Author",
    userName: null,
    avatarUrl: null,
    isVerified: false,
    description: "",
    createdAt: null,
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
    userReaction: null,
    reactionSummary: [],
    mentions: [],
    isSaved: false,
    isOwn: false,
    isReposted: false,
    repostCount: 0,
    repostInfo: null,
    repostData: null,
    isRepostWithThoughts: false,
    isPinned: false,
    visibility: "public",
    images: [],
    videos: [],
    isPropertyShare: false,
    isProjectShare: false,
    propertyData: null,
    projectData: null,
  };
}

describe("mergeFeedWithSuggestions", () => {
  it("returns posts only when bundle is empty", () => {
    const posts = [post(1), post(2), post(3)];
    const rows = mergeFeedWithSuggestions(posts, {
      contact_suggestions: [],
      connection_suggestions: [],
      job_suggestions: [],
      event_suggestions: [],
    });
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => r.kind === "post")).toBe(true);
  });

  it("inserts event module after 3rd post when data exists", () => {
    const posts = Array.from({ length: 5 }, (_, i) => post(i + 1));
    const rows = mergeFeedWithSuggestions(posts, {
      contact_suggestions: [],
      connection_suggestions: [],
      job_suggestions: [],
      event_suggestions: [{ id: 99 } as never],
    });
    const modules = rows.filter((r) => r.kind === "module");
    expect(modules.length).toBeGreaterThanOrEqual(1);
    expect(modules[0]?.moduleType).toBe("event_suggestions");
    const idx = rows.findIndex(
      (r) => r.kind === "module" && r.moduleType === "event_suggestions"
    );
    const postsBefore = rows.slice(0, idx).filter((r) => r.kind === "post");
    expect(postsBefore).toHaveLength(3);
  });
});
