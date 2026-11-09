import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  backendMessage,
  isBackendSuccess,
  mapComment,
  mapCommentsPage,
  mapFeedPage,
  mapFeedPost,
  mapPostLikersPage,
  mapReportReasons,
} from "@/features/feed/lib/map-post";
import type {
  CommentsPage,
  FeedPage,
  FeedPost,
  PostComment,
  PostLikersPage,
  ReportReason,
} from "@/features/feed/types/post.types";
import { FEED_LIST_PAGE_SIZE } from "@/features/feed/constants/feed.constants";
import type {
  CommentCreateInput,
  CommentDeleteInput,
  CommentReactionInput,
  FeedListInput,
  HidePostInput,
  NotInterestedInput,
  PinPostInput,
  ReportPostInput,
  RepostStoreInput,
} from "@/features/feed/validators/feed.validators";
import {
  normalizePostReactionType,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";

function formFromRecord(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  return form;
}

export async function fetchFeedPage(
  input: FeedListInput
): Promise<FeedPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/list",
    method: "POST",
    auth: true,
    data: {
      page: input.page,
      per_page: input.perPage ?? FEED_LIST_PAGE_SIZE,
      ...(input.refreshFeed ? { refresh_feed: true } : {}),
      ...(input.searchText ? { search_text: input.searchText } : {}),
      ...(input.feedType ? { feed_type: input.feedType } : {}),
      ...(input.searchType && input.searchType !== "foryou"
        ? { type: input.searchType }
        : {}),
      ...(input.propertyCategory
        ? { property_category: input.propertyCategory }
        : {}),
      ...(input.listingTransaction
        ? { listing_transaction: input.listingTransaction }
        : {}),
      ...(input.inquiryType ? { inquiry_type: input.inquiryType } : {}),
    },
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load feed"),
      502
    );
  }
  return mapFeedPage(payload);
}

export async function fetchPostDetails(postId: number): Promise<FeedPost> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/details",
    method: "POST",
    auth: true,
    data: { post_id: postId },
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "NOT_FOUND",
      backendMessage(payload, "Post not found"),
      404
    );
  }

  const root = payload as { data?: unknown };
  const post = mapFeedPost(root.data);
  if (!post) {
    throw new ApiError("NOT_FOUND", "Post not found", 404);
  }
  return post;
}

export async function togglePostLike(
  postId: number,
  options?: { reactionType?: string | null }
): Promise<{
  isLiked: boolean;
  userReaction: PostReactionType | null;
}> {
  const fields: Record<string, string> = { post_id: String(postId) };
  if (options?.reactionType) {
    fields.reaction_type = options.reactionType;
  }

  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: {
      is_liked?: boolean | string;
      user_reaction?: string | null;
    };
  }>({
    path: "/api/posts/like/store",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord(fields),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update like"),
      502
    );
  }

  const isLiked =
    payload.data?.is_liked === true || payload.data?.is_liked === "true";
  const reactionRaw = payload.data?.user_reaction;
  return {
    isLiked,
    userReaction:
      normalizePostReactionType(
        reactionRaw != null ? String(reactionRaw) : null
      ) ?? (isLiked ? "like" : null),
  };
}

export async function togglePostSave(postId: number): Promise<{
  isSaved: boolean;
}> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: { is_saved?: boolean | string };
  }>({
    path: "/api/posts/save/toggle",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({ post_id: String(postId) }),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update save"),
      502
    );
  }

  return {
    isSaved:
      payload.data?.is_saved === true || payload.data?.is_saved === "true",
  };
}

export async function fetchPostLikers(input: {
  postId: number;
  page?: number;
  limit?: number;
}): Promise<PostLikersPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/like/users",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({
      post_id: String(input.postId),
      page: String(input.page ?? 1),
      limit: String(input.limit ?? 20),
    }),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load reactions"),
      502
    );
  }

  return mapPostLikersPage(payload);
}

export async function fetchCommentReactions(input: {
  commentId: number;
  page?: number;
  limit?: number;
}): Promise<PostLikersPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/comment/reaction/users",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({
      comment_id: String(input.commentId),
      page: String(input.page ?? 1),
      limit: String(input.limit ?? 20),
    }),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load comment reactions"),
      502
    );
  }

  return mapPostLikersPage(payload);
}

export async function fetchPostComments(input: {
  postId: number;
  page?: number;
  limit?: number;
}): Promise<CommentsPage> {
  const payload = await socialApiRequest<unknown>({
    path: `/api/posts/${input.postId}/comments`,
    method: "GET",
    auth: true,
    params: {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      sort: "newest",
    },
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load comments"),
      502
    );
  }
  return mapCommentsPage(payload);
}

export async function createPostComment(
  input: CommentCreateInput
): Promise<PostComment> {
  const fields: Record<string, string> = {
    post_id: String(input.postId),
    comment: input.comment,
  };
  if (input.mentionedUserIds?.length) {
    fields.mentioned_user_ids = JSON.stringify(input.mentionedUserIds);
  }
  if (input.mentionedUsers?.length) {
    fields.mentioned_users = JSON.stringify(input.mentionedUsers);
  }

  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    comment?: unknown;
  }>({
    path: "/api/posts/comment/store",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord(fields),
  });

  if (!isBackendSuccess(payload) || !payload.comment) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to add comment"),
      502
    );
  }

  const comment = mapComment(payload.comment);
  if (!comment) {
    throw new ApiError("SERVER", "Invalid comment response", 502);
  }
  return comment;
}

export async function toggleCommentReaction(
  input: CommentReactionInput
): Promise<{ isLiked: boolean; userReaction: PostReactionType | null }> {
  const fields: Record<string, string> = {
    comment_id: String(input.commentId),
  };
  const reactionType = input.isTapToggle
    ? null
    : (input.reactionType ?? null);
  if (reactionType) {
    fields.reaction_type = reactionType;
  }

  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: {
      is_liked?: boolean | string;
      user_reaction?: string | null;
    };
  }>({
    path: "/api/posts/comment/reaction/store",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord(fields),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update comment reaction"),
      502
    );
  }

  const isLiked =
    payload.data?.is_liked === true || payload.data?.is_liked === "true";
  const reactionRaw = payload.data?.user_reaction;
  return {
    isLiked,
    userReaction:
      normalizePostReactionType(
        reactionRaw != null ? String(reactionRaw) : null
      ) ?? (isLiked ? "like" : null),
  };
}

export async function createPostMultipart(
  form: FormData
): Promise<{
  id: number;
  influencerChallenge: unknown;
}> {
  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: { id?: number | string; influencer_challenge?: unknown };
  }>({
    path: "/api/posts/store",
    method: "POST",
    auth: true,
    isFormData: true,
    data: form,
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to publish post"),
      502
    );
  }

  const id = Number(payload.data?.id);
  if (!Number.isFinite(id)) {
    throw new ApiError("SERVER", "Post created without id", 502);
  }
  return {
    id,
    influencerChallenge: payload.data?.influencer_challenge ?? null,
  };
}

export async function fetchReportReasons(): Promise<ReportReason[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/report_reasons",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({}),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load report reasons"),
      502
    );
  }
  return mapReportReasons(payload);
}

export async function reportPost(input: ReportPostInput): Promise<void> {
  const fields: Record<string, string> = {
    type: "post",
    post_id: String(input.postId),
    report_reason: input.reportReason,
  };
  if (input.reportMessage) fields.report_message = input.reportMessage;

  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/block/post_visibility",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord(fields),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to submit report"),
      502
    );
  }
}

/** Hide post from feed — same endpoint as report without reason (mobile hide). */
export async function hidePost(input: HidePostInput): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/block/post_visibility",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({
      type: "post",
      post_id: String(input.postId),
    }),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to hide post"),
      502
    );
  }
}

export async function toggleNotInterested(
  input: NotInterestedInput
): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/not-interested/toggle",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({ post_id: String(input.postId) }),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to update preference"),
      502
    );
  }
}

export async function storeRepost(
  input: RepostStoreInput
): Promise<{ id: number | null; message: string }> {
  const fields: Record<string, string> = {
    fk_post_id: String(input.postId),
  };
  if (input.repostText?.trim()) {
    fields.repost_text = input.repostText.trim();
  }

  const payload = await socialApiRequest<{
    status?: boolean | string;
    message?: string;
    data?: {
      id?: number | string;
      repost_id?: number | string;
      post_id?: number | string;
    };
  }>({
    path: "/api/posts/repost/store",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord(fields),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to repost"),
      502
    );
  }

  const rawId =
    payload.data?.repost_id ??
    payload.data?.post_id ??
    payload.data?.id;
  const id = Number(rawId);
  return {
    id: Number.isFinite(id) ? id : null,
    message: backendMessage(payload, "Post reposted successfully"),
  };
}

export async function deletePost(postId: number): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/delete",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({ fk_post_id: String(postId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to delete post"),
      502
    );
  }
}

export async function deleteRepost(
  postId: number
): Promise<{ message: string }> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/repost/delete",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({ fk_post_id: String(postId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to undo repost"),
      502
    );
  }

  return {
    message: backendMessage(payload, "Repost removed successfully"),
  };
}

export async function deleteComment(
  input: CommentDeleteInput
): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/comment/delete",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({ comment_id: String(input.commentId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to delete comment"),
      502
    );
  }
}

export async function setPostPinned(input: PinPostInput): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: input.pinned ? "/api/posts/pin/store" : "/api/posts/pin/remove",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({ post_id: String(input.postId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(
        payload,
        input.pinned ? "Unable to pin post" : "Unable to unpin post"
      ),
      502
    );
  }
}

/**
 * Block a member from their profile — mobile `SocialProfile` ⋮ → Block
 * (`posts/block/post_visibility`, type "user"). The backend also blocks chat,
 * removes any connection and hides their posts; they show in
 * Settings → Blocked users.
 */
export async function blockUserProfile(input: { blockedProfileId: number }): Promise<string> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/block/post_visibility",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFromRecord({
      type: "user",
      blocked_user_id: String(input.blockedProfileId),
    }),
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to block this user"),
      502
    );
  }
  return backendMessage(payload, "User blocked");
}
