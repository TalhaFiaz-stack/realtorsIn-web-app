"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createCommentRequest,
  deleteCommentRequest,
  fetchCommentsRequest,
  fetchPostDetailsRequest,
  toggleCommentReactionRequest,
  toggleLikeRequest,
  toggleSaveRequest,
} from "@/features/feed/services/posts.client";
import {
  applyPostLikeOptimisticEverywhere,
  findPostInFeedCaches,
  patchPostInAllFeedCaches,
} from "@/features/feed/lib/patch-feed-caches";
import {
  applyLikeSuccessOnComment,
  applyLikeSuccessOnPost,
  applyOptimisticLikeOnComment,
  applyOptimisticLikeOnPost,
  applyOptimisticSaveOnPost,
} from "@/features/feed/lib/feed-optimistic";
import type {
  CommentsPage,
  FeedPost,
  PostComment,
} from "@/features/feed/types/post.types";
import type { PostReactionType } from "@/features/feed/constants/post-reactions";

export function postDetailKey(postId: number) {
  return ["post", postId] as const;
}

export function postCommentsKey(postId: number) {
  return ["post", postId, "comments"] as const;
}

type CommentsInfiniteData = {
  pages: CommentsPage[];
  pageParams: number[];
};

function patchFeedPost(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  updater: (post: FeedPost) => FeedPost
) {
  patchPostInAllFeedCaches(queryClient, postId, updater);
}

function patchCommentInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  commentId: number,
  updater: (comment: PostComment) => PostComment
) {
  queryClient.setQueryData<CommentsInfiniteData>(
    postCommentsKey(postId),
    (current) => {
      if (!current?.pages) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          comments: page.comments.map((comment) =>
            comment.id === commentId ? updater(comment) : comment
          ),
        })),
      };
    }
  );
}

export function usePostDetail(postId: number, enabled = true) {
  return useQuery({
    queryKey: postDetailKey(postId),
    queryFn: ({ signal }) => fetchPostDetailsRequest(postId, signal),
    enabled: enabled && postId > 0,
  });
}

export function usePostComments(postId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: postCommentsKey(postId),
    queryFn: ({ pageParam, signal }) =>
      fetchCommentsRequest({
        postId,
        page: pageParam,
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.hasNextPage ? last.page + 1 : undefined,
    enabled: enabled && postId > 0,
  });
}

export function useDetailToggleLike(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: {
      reactionType?: string | null;
      isTapToggle?: boolean;
    }) =>
      toggleLikeRequest({
        postId,
        reactionType: input?.reactionType,
        isTapToggle: input?.isTapToggle ?? input?.reactionType == null,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: postDetailKey(postId) });
      const optimisticInput = {
        reactionType: (input?.reactionType ?? null) as FeedPost["userReaction"],
        isTapToggle: input?.isTapToggle ?? input?.reactionType == null,
      };
      const previousDetail = queryClient.getQueryData<FeedPost>(
        postDetailKey(postId)
      );
      const snapshotBefore =
        previousDetail ?? findPostInFeedCaches(queryClient, postId);

      applyPostLikeOptimisticEverywhere(
        queryClient,
        postId,
        optimisticInput,
        (post, patch) => applyOptimisticLikeOnPost(post, patch)
      );

      return { previousDetail, snapshotBefore };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousDetail !== undefined) {
        queryClient.setQueryData(postDetailKey(postId), ctx.previousDetail);
      } else {
        queryClient.removeQueries({ queryKey: postDetailKey(postId) });
      }
      if (ctx?.snapshotBefore) {
        patchFeedPost(queryClient, postId, () => ctx.snapshotBefore!);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<FeedPost>(postDetailKey(postId), (current) => {
        if (!current) return current;
        const next = applyLikeSuccessOnPost(current, {
          isLiked: result.isLiked,
          userReaction: result.userReaction as FeedPost["userReaction"],
        });
        patchFeedPost(queryClient, postId, () => next);
        return next;
      });
    },
  });
}

export function useDetailToggleSave(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleSaveRequest(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postDetailKey(postId) });
      const previous = queryClient.getQueryData<FeedPost>(postDetailKey(postId));
      if (previous) {
        const next = applyOptimisticSaveOnPost(previous);
        queryClient.setQueryData(postDetailKey(postId), next);
        patchFeedPost(queryClient, postId, () => next);
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(postDetailKey(postId), ctx.previous);
        patchFeedPost(queryClient, postId, () => ctx.previous!);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<FeedPost>(postDetailKey(postId), (current) => {
        if (!current) return current;
        const next = { ...current, isSaved: result.isSaved };
        patchFeedPost(queryClient, postId, () => next);
        return next;
      });
    },
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      comment: string;
      mentionedUserIds?: number[];
      mentionedUsers?: Array<{
        user_id: number;
        display_name?: string;
        user_name?: string;
      }>;
    }) =>
      createCommentRequest({
        postId,
        comment: input.comment,
        mentionedUserIds: input.mentionedUserIds,
        mentionedUsers: input.mentionedUsers,
      }),
    onSuccess: (comment) => {
      queryClient.setQueryData<CommentsInfiniteData>(
        postCommentsKey(postId),
        (current) => {
          if (!current?.pages?.length) {
            return {
              pages: [
                {
                  comments: [comment],
                  page: 1,
                  limit: 20,
                  total: 1,
                  totalPages: 1,
                  hasNextPage: false,
                },
              ],
              pageParams: [1],
            };
          }
          const [first, ...rest] = current.pages;
          return {
            ...current,
            pages: [
              {
                ...first,
                comments: [comment, ...first.comments],
                total: first.total + 1,
              },
              ...rest,
            ],
          };
        }
      );
      queryClient.setQueryData<FeedPost>(postDetailKey(postId), (current) => {
        if (!current) return current;
        const next = {
          ...current,
          commentCount: current.commentCount + 1,
        };
        patchFeedPost(queryClient, postId, () => next);
        return next;
      });
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteCommentRequest(commentId),
    onSuccess: (_r, commentId) => {
      queryClient.setQueryData<CommentsInfiniteData>(
        postCommentsKey(postId),
        (current) => {
          if (!current?.pages) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              comments: page.comments.filter(
                (comment) => comment.id !== commentId
              ),
              total: Math.max(0, page.total - 1),
            })),
          };
        }
      );
      queryClient.setQueryData<FeedPost>(postDetailKey(postId), (current) => {
        if (!current) return current;
        const next = {
          ...current,
          commentCount: Math.max(0, current.commentCount - 1),
        };
        patchFeedPost(queryClient, postId, () => next);
        return next;
      });
    },
  });
}

export function useCommentReaction(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      commentId: number;
      reactionType?: PostReactionType | null;
      isTapToggle?: boolean;
    }) =>
      toggleCommentReactionRequest({
        commentId: input.commentId,
        reactionType: input.reactionType,
        isTapToggle: input.isTapToggle ?? input.reactionType == null,
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: postCommentsKey(postId) });
      const previous = queryClient.getQueryData<CommentsInfiniteData>(
        postCommentsKey(postId)
      );

      patchCommentInCache(queryClient, postId, input.commentId, (comment) =>
        applyOptimisticLikeOnComment(comment, {
          reactionType: input.reactionType,
          isTapToggle: input.isTapToggle,
        })
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(postCommentsKey(postId), ctx.previous);
      }
    },
    onSuccess: (result, vars) => {
      patchCommentInCache(queryClient, postId, vars.commentId, (comment) =>
        applyLikeSuccessOnComment(comment, {
          isLiked: result.isLiked,
          userReaction: result.userReaction,
        })
      );
    },
  });
}
