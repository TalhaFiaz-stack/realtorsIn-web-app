import { describe, expect, it } from "vitest";
import { mergeFeedWithSuggestions } from "@/features/feed/lib/merge-feed-with-suggestions";
import type { FeedPost } from "@/features/feed/types/post.types";
import type { OffPlanFeedSection } from "@/features/off-plan/lib/off-plan-feed-sections";

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

  it("pins Top Picks above the first post and cycles other off-plan sections from post 13, every 20 (mobile)", () => {
    const project = (id: string) =>
      ({ id, title: id, featured: false }) as unknown as OffPlanFeedSection["projects"][number];
    const section = (key: OffPlanFeedSection["key"]): OffPlanFeedSection => ({
      key,
      title: key,
      projects: [project(key)],
    });
    const posts = Array.from({ length: 40 }, (_, i) => post(i + 1));
    const rows = mergeFeedWithSuggestions(posts, {
      contact_suggestions: [],
      connection_suggestions: [],
      job_suggestions: [],
      event_suggestions: [],
      offplan_sections: [section("top_overall"), section("top_dubai"), section("top_sharjah")],
    });

    expect(rows[0]).toMatchObject({ kind: "module", moduleType: "offplan_suggestions" });
    expect(rows[0].kind === "module" && rows[0].offPlanSection?.key).toBe("top_overall");

    // Post count before each mid-feed off-plan row, and which section it shows.
    const placed: Array<[number, string | undefined]> = [];
    let count = 0;
    for (const row of rows.slice(1)) {
      if (row.kind === "post") count += 1;
      else placed.push([count, row.offPlanSection?.key]);
    }
    expect(placed).toEqual([
      [13, "top_dubai"],
      [33, "top_sharjah"],
    ]);
  });

  it("keeps mobile slot priority when modules collide", () => {
    const person = { id: "p" } as never;
    const posts = Array.from({ length: 21 }, (_, i) => post(i + 1));
    const rows = mergeFeedWithSuggestions(posts, {
      contact_suggestions: [person],
      connection_suggestions: [person],
      job_suggestions: [{ id: "j" } as never],
      event_suggestions: [{ id: "e" } as never],
    });
    const placed: Array<[number, string]> = [];
    let count = 0;
    for (const row of rows) {
      if (row.kind === "post") count += 1;
      else placed.push([count, row.moduleType]);
    }
    // contacts 10, 20 · connections 7, 14, 21 · jobs 5 · events 3, 18
    expect(placed).toEqual([
      [3, "event_suggestions"],
      [5, "job_suggestions"],
      [7, "connection_suggestions"],
      [10, "contact_suggestions"],
      [14, "connection_suggestions"],
      [18, "event_suggestions"],
      [20, "contact_suggestions"],
      [21, "connection_suggestions"],
    ]);
  });
});

