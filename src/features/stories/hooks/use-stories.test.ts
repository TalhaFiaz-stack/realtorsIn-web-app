import { describe, expect, it } from "vitest";
import { markStoryViewedInFeed, removeStoryFromFeed } from "@/features/stories/hooks/use-stories";
import type { StoriesFeed, StoryItem } from "@/features/stories/types/story.types";

const story = (id: number, hasViewed: boolean): StoryItem => ({
  id,
  mediaUrl: "x",
  thumbnailUrl: null,
  mediaType: "image",
  durationMs: 5000,
  caption: null,
  visibility: "public",
  createdAt: null,
  expiresAt: null,
  viewCount: 0,
  reactionCount: 0,
  hasViewed,
  hasReacted: false,
  isOwn: false,
});

const feed: StoriesFeed = {
  groups: [
    { userId: 1, name: "A", userName: null, avatarUrl: null, hasUnseen: true, isOwn: false, stories: [story(10, false), story(11, false)] },
    { userId: 2, name: "B", userName: null, avatarUrl: null, hasUnseen: true, isOwn: false, stories: [story(20, false)] },
  ],
};

describe("markStoryViewedInFeed", () => {
  it("marks one story and keeps the group unseen while others remain", () => {
    const next = markStoryViewedInFeed(feed, 10);
    expect(next.groups[0]!.stories.map((s) => s.hasViewed)).toEqual([true, false]);
    expect(next.groups[0]!.hasUnseen).toBe(true);
    expect(next.groups[1]).toBe(feed.groups[1]);
  });

  it("clears hasUnseen when the last unseen story is viewed", () => {
    const next = markStoryViewedInFeed(markStoryViewedInFeed(feed, 10), 11);
    expect(next.groups[0]!.hasUnseen).toBe(false);
  });

  it("returns the same object when nothing changes", () => {
    const viewed = markStoryViewedInFeed(feed, 20);
    expect(markStoryViewedInFeed(viewed, 20)).toBe(viewed);
  });
});

describe("removeStoryFromFeed", () => {
  it("removes the story and keeps the rest of the group", () => {
    const next = removeStoryFromFeed(feed, 10);
    expect(next.groups[0]!.stories.map((s) => s.id)).toEqual([11]);
    expect(next.groups[1]).toBe(feed.groups[1]);
  });

  it("drops a group left with no stories", () => {
    const next = removeStoryFromFeed(feed, 20);
    expect(next.groups.map((g) => g.userId)).toEqual([1]);
  });

  it("returns the same object for an unknown story", () => {
    expect(removeStoryFromFeed(feed, 999)).toBe(feed);
  });
});
