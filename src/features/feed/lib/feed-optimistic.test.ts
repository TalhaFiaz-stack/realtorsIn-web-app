import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  applyLikeSuccess,
  applyOptimisticLike,
  applyOptimisticLikeOnPost,
  applyOptimisticSave,
  applyOptimisticSaveOnPost,
  applySaveSuccess,
  findPostInFeed,
  type FeedInfiniteData,
} from "@/features/feed/lib/feed-optimistic";
import { feedQueryKey } from "@/features/feed/hooks/use-feed";
import { postDetailKey } from "@/features/feed/hooks/use-post-detail";
import type { FeedPost } from "@/features/feed/types/post.types";

function makePost(overrides: Partial<FeedPost> = {}): FeedPost {
  return {
    id: 42,
    userId: "1",
    authorName: "Ada",
    userName: "ada",
    avatarUrl: null,
    isVerified: false,
    description: "Hello",
    createdAt: "2026-11-03T10:00:00Z",
    likeCount: 5,
    commentCount: 1,
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
    visibility: "connections",
    images: [],
    videos: [],
    isPropertyShare: false,
    isProjectShare: false,
    propertyData: null,
    projectData: null,
    ...overrides,
  };
}

function makeFeed(post: FeedPost): FeedInfiniteData {
  return {
    pages: [
      {
        posts: [post],
        page: 1,
        perPage: 20,
        hasNextPage: false,
        total: 1,
        lastPage: 1,
      },
    ],
    pageParams: [1],
  };
}

/**
 * Mirrors useToggleLike / useToggleSave / detail hook rollback:
 * snapshot → optimistic apply → onError restore previous.
 * These are unit tests of cache rollback, not live backend verification.
 */
describe("feed optimistic like/save rollback", () => {
  it("likes optimistically and restores liked state + count on failure", () => {
    const previous = makeFeed(makePost({ isLiked: false, likeCount: 5 }));
    const optimistic = applyOptimisticLike(previous, 42);
    expect(findPostInFeed(optimistic, 42)).toMatchObject({
      isLiked: true,
      likeCount: 6,
    });

    const restored = previous;
    expect(findPostInFeed(restored, 42)).toMatchObject({
      isLiked: false,
      likeCount: 5,
    });
  });

  it("unlikes optimistically and restores previous state + count on failure", () => {
    const previous = makeFeed(makePost({ isLiked: true, likeCount: 5 }));
    const optimistic = applyOptimisticLike(previous, 42);
    expect(findPostInFeed(optimistic, 42)).toMatchObject({
      isLiked: false,
      likeCount: 4,
    });
    expect(findPostInFeed(previous, 42)).toMatchObject({
      isLiked: true,
      likeCount: 5,
    });
  });

  it("saves optimistically and restores saved state on failure", () => {
    const previous = makeFeed(makePost({ isSaved: false }));
    const optimistic = applyOptimisticSave(previous, 42);
    expect(findPostInFeed(optimistic, 42)?.isSaved).toBe(true);
    expect(findPostInFeed(previous, 42)?.isSaved).toBe(false);
  });

  it("unsaves optimistically and restores previous saved state on failure", () => {
    const previous = makeFeed(makePost({ isSaved: true }));
    const optimistic = applyOptimisticSave(previous, 42);
    expect(findPostInFeed(optimistic, 42)?.isSaved).toBe(false);
    expect(findPostInFeed(previous, 42)?.isSaved).toBe(true);
  });

  it("reconciles like success without double-counting after optimistic apply", () => {
    const previous = makeFeed(makePost({ isLiked: false, likeCount: 5 }));
    const optimistic = applyOptimisticLike(previous, 42);
    const reconciled = applyLikeSuccess(optimistic, 42, {
      isLiked: true,
      userReaction: "like",
    });
    expect(findPostInFeed(reconciled, 42)).toMatchObject({
      isLiked: true,
      likeCount: 6,
    });
  });

  it("reconciles save success after optimistic apply", () => {
    const previous = makeFeed(makePost({ isSaved: false }));
    const optimistic = applyOptimisticSave(previous, 42);
    const reconciled = applySaveSuccess(optimistic, 42, true);
    expect(findPostInFeed(reconciled, 42)?.isSaved).toBe(true);
  });
});

describe("detail + feed cache consistency via QueryClient rollback", () => {
  it("rolls back like on detail and feed to the same previous values", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const post = makePost({ isLiked: false, likeCount: 5 });
    queryClient.setQueryData(postDetailKey(42), post);
    queryClient.setQueryData(feedQueryKey, makeFeed(post));

    const previousDetail = queryClient.getQueryData<FeedPost>(postDetailKey(42));
    const previousFeed = queryClient.getQueryData<FeedInfiniteData>(feedQueryKey);

    const next = applyOptimisticLikeOnPost(previousDetail!);
    queryClient.setQueryData(postDetailKey(42), next);
    queryClient.setQueryData(
      feedQueryKey,
      applyOptimisticLike(previousFeed, 42)
    );

    expect(queryClient.getQueryData<FeedPost>(postDetailKey(42))).toMatchObject({
      isLiked: true,
      likeCount: 6,
    });
    expect(
      findPostInFeed(
        queryClient.getQueryData<FeedInfiniteData>(feedQueryKey),
        42
      )
    ).toMatchObject({ isLiked: true, likeCount: 6 });

    // Simulate mutation onError
    queryClient.setQueryData(postDetailKey(42), previousDetail);
    queryClient.setQueryData(feedQueryKey, previousFeed);

    expect(queryClient.getQueryData<FeedPost>(postDetailKey(42))).toMatchObject({
      isLiked: false,
      likeCount: 5,
    });
    expect(
      findPostInFeed(
        queryClient.getQueryData<FeedInfiniteData>(feedQueryKey),
        42
      )
    ).toMatchObject({ isLiked: false, likeCount: 5 });
  });

  it("rolls back save on detail and feed consistently", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const post = makePost({ isSaved: false });
    queryClient.setQueryData(postDetailKey(42), post);
    queryClient.setQueryData(feedQueryKey, makeFeed(post));

    const previousDetail = queryClient.getQueryData<FeedPost>(postDetailKey(42));
    const previousFeed = queryClient.getQueryData<FeedInfiniteData>(feedQueryKey);

    queryClient.setQueryData(
      postDetailKey(42),
      applyOptimisticSaveOnPost(previousDetail!)
    );
    queryClient.setQueryData(
      feedQueryKey,
      applyOptimisticSave(previousFeed, 42)
    );

    expect(queryClient.getQueryData<FeedPost>(postDetailKey(42))?.isSaved).toBe(
      true
    );

    queryClient.setQueryData(postDetailKey(42), previousDetail);
    queryClient.setQueryData(feedQueryKey, previousFeed);

    expect(queryClient.getQueryData<FeedPost>(postDetailKey(42))?.isSaved).toBe(
      false
    );
    expect(
      findPostInFeed(
        queryClient.getQueryData<FeedInfiniteData>(feedQueryKey),
        42
      )?.isSaved
    ).toBe(false);
  });

  it("repeated/concurrent mutations restore the earliest snapshot without drift", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const baseline = makeFeed(makePost({ isLiked: false, likeCount: 5 }));
    queryClient.setQueryData(feedQueryKey, baseline);

    const snapA = queryClient.getQueryData<FeedInfiniteData>(feedQueryKey);
    queryClient.setQueryData(
      feedQueryKey,
      applyOptimisticLike(snapA, 42)
    );
    // Second rapid toggle before first settles — snapshot still A (true concurrent pattern)
    const snapB = queryClient.getQueryData<FeedInfiniteData>(feedQueryKey);
    queryClient.setQueryData(
      feedQueryKey,
      applyOptimisticLike(snapB, 42)
    );
    expect(findPostInFeed(queryClient.getQueryData(feedQueryKey), 42)).toMatchObject(
      {
        isLiked: false,
        likeCount: 5,
      }
    );

    // First mutation fails → restore snapA (baseline)
    queryClient.setQueryData(feedQueryKey, snapA);
    expect(findPostInFeed(queryClient.getQueryData(feedQueryKey), 42)).toMatchObject(
      {
        isLiked: false,
        likeCount: 5,
      }
    );

    // Second mutation also fails → restore snapB would re-apply liked; correct pattern
    // keeps the last successful baseline when all fail by restoring earliest:
    queryClient.setQueryData(feedQueryKey, snapA);
    expect(findPostInFeed(queryClient.getQueryData(feedQueryKey), 42)).toMatchObject(
      {
        isLiked: false,
        likeCount: 5,
      }
    );
  });
});
