import {
  buildReactionSummaryPatch,
  computeReactionOptimisticState,
  normalizePostReactionType,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";
import type {
  FeedPage,
  FeedPost,
  PostComment,
} from "@/features/feed/types/post.types";

type ReactionPatchTarget = Pick<
  FeedPost,
  "isLiked" | "userReaction" | "likeCount" | "reactionSummary"
>;

function applyReactionPatchToTarget<T extends ReactionPatchTarget>(
  target: T,
  input: { reactionType?: PostReactionType | null; isTapToggle?: boolean }
): T {
  const isTapToggle = input.isTapToggle ?? input.reactionType == null;
  const next = computeReactionOptimisticState({
    currentReaction: target.userReaction,
    currentLikeStatus: target.isLiked,
    currentLikeCount: target.likeCount,
    nextReactionType: input.reactionType,
    isTapToggle,
  });
  return {
    ...target,
    isLiked: next.isLiked,
    userReaction: next.userReaction,
    likeCount: next.likeCount,
    reactionSummary: buildReactionSummaryPatch({
      isLiked: next.isLiked,
      userReaction: next.userReaction,
      likeCount: next.likeCount,
      previousSummary: target.reactionSummary,
      previousUserReaction: target.userReaction,
    }),
  };
}

function applyLikeSuccessToTarget<T extends ReactionPatchTarget>(
  target: T,
  result: { isLiked: boolean; userReaction?: PostReactionType | null }
): T {
  const wasLiked = target.isLiked;
  let likeCount = target.likeCount;
  if (wasLiked !== result.isLiked) {
    likeCount = Math.max(0, likeCount + (result.isLiked ? 1 : -1));
  }
  const userReaction = result.isLiked
    ? (normalizePostReactionType(result.userReaction) ??
      target.userReaction ??
      "like")
    : null;
  return {
    ...target,
    isLiked: result.isLiked,
    userReaction,
    likeCount,
    reactionSummary: buildReactionSummaryPatch({
      isLiked: result.isLiked,
      userReaction,
      likeCount,
      previousSummary: target.reactionSummary,
      previousUserReaction: target.userReaction,
    }),
  };
}

export type FeedInfiniteData = {
  pages: FeedPage[];
  pageParams?: unknown[];
};

export type ReactionMutationInput = {
  postId: number;
  /** When omitted, tap toggles like on/off. When set, applies that reaction. */
  reactionType?: PostReactionType | null;
  isTapToggle?: boolean;
};

export function patchPostInPages(
  pages: FeedPage[] | undefined,
  postId: number,
  updater: (post: FeedPost) => FeedPost
): FeedPage[] | undefined {
  if (!pages) return pages;
  return pages.map((page) => ({
    ...page,
    posts: page.posts.map((post) =>
      post.id === postId ? updater(post) : post
    ),
  }));
}

export function findPostInFeed(
  data: FeedInfiniteData | undefined,
  postId: number
): FeedPost | undefined {
  return data?.pages
    .flatMap((page) => page.posts)
    .find((post) => post.id === postId);
}

function applyReactionPatch(
  post: FeedPost,
  input: Omit<ReactionMutationInput, "postId">
): FeedPost {
  return applyReactionPatchToTarget(post, input);
}

/** Optimistic like / reaction for infinite feed cache. */
export function applyOptimisticLike(
  data: FeedInfiniteData | undefined,
  postId: number,
  input: Omit<ReactionMutationInput, "postId"> = {}
): FeedInfiniteData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages:
      patchPostInPages(data.pages, postId, (post) =>
        applyReactionPatch(post, input)
      ) ?? data.pages,
  };
}

/** Reconcile like flag from server without inventing counts blindly. */
export function applyLikeSuccess(
  data: FeedInfiniteData | undefined,
  postId: number,
  result: {
    isLiked: boolean;
    userReaction?: PostReactionType | null;
  }
): FeedInfiniteData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages:
      patchPostInPages(data.pages, postId, (post) => {
        const wasLiked = post.isLiked;
        let likeCount = post.likeCount;
        if (wasLiked !== result.isLiked) {
          likeCount = Math.max(0, likeCount + (result.isLiked ? 1 : -1));
        }
        const userReaction = result.isLiked
          ? (normalizePostReactionType(result.userReaction) ??
            post.userReaction ??
            "like")
          : null;
        return {
          ...post,
          isLiked: result.isLiked,
          userReaction,
          likeCount,
          reactionSummary: buildReactionSummaryPatch({
            isLiked: result.isLiked,
            userReaction,
            likeCount,
            previousSummary: post.reactionSummary,
            previousUserReaction: post.userReaction,
          }),
        };
      }) ?? data.pages,
  };
}

export function applyOptimisticSave(
  data: FeedInfiniteData | undefined,
  postId: number
): FeedInfiniteData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages:
      patchPostInPages(data.pages, postId, (post) => ({
        ...post,
        isSaved: !post.isSaved,
      })) ?? data.pages,
  };
}

export function applySaveSuccess(
  data: FeedInfiniteData | undefined,
  postId: number,
  isSaved: boolean
): FeedInfiniteData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages:
      patchPostInPages(data.pages, postId, (post) => ({
        ...post,
        isSaved,
      })) ?? data.pages,
  };
}

export function applyOptimisticLikeOnPost(
  post: FeedPost,
  input: Omit<ReactionMutationInput, "postId"> = {}
): FeedPost {
  return applyReactionPatch(post, input);
}

export function applyLikeSuccessOnPost(
  post: FeedPost,
  result: { isLiked: boolean; userReaction?: PostReactionType | null }
): FeedPost {
  return applyLikeSuccessToTarget(post, result);
}

export function applyOptimisticLikeOnComment(
  comment: PostComment,
  input: {
    reactionType?: PostReactionType | null;
    isTapToggle?: boolean;
  } = {}
): PostComment {
  return applyReactionPatchToTarget(comment, input);
}

export function applyLikeSuccessOnComment(
  comment: PostComment,
  result: { isLiked: boolean; userReaction?: PostReactionType | null }
): PostComment {
  return applyLikeSuccessToTarget(comment, result);
}

export function applyOptimisticSaveOnPost(post: FeedPost): FeedPost {
  return { ...post, isSaved: !post.isSaved };
}

/** Insert a newly created post at the top of every home feed cache (mobile refreshFeeds parity). */
export function prependPostToFeedCaches(
  current: FeedInfiniteData | undefined,
  post: FeedPost
): FeedInfiniteData | undefined {
  if (!current?.pages?.length) return current;

  const withoutDuplicate = (posts: FeedPost[]) =>
    posts.filter((item) => item.id !== post.id);

  const [first, ...rest] = current.pages;
  return {
    ...current,
    pages: [
      {
        ...first,
        posts: [post, ...withoutDuplicate(first.posts)],
      },
      ...rest.map((page) => ({
        ...page,
        posts: withoutDuplicate(page.posts),
      })),
    ],
  };
}
