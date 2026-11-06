import { FEED_LIST_PAGE_SIZE } from "@/features/feed/constants/feed.constants";
import type { PostReactionType } from "@/features/feed/constants/post-reactions";
import { bffRequest } from "@/lib/api/client";
import type {
  CommentsPage,
  FeedPage,
  FeedPost,
  PostComment,
  PostLikersPage,
  ReportReason,
} from "@/features/feed/types/post.types";

export async function fetchFeedPageRequest(input: {
  page: number;
  perPage?: number;
  refreshFeed?: boolean;
  searchText?: string;
  feedType?: "off_plan" | "properties" | "inquiries" | "video";
  propertyCategory?: "apartment" | "villa" | "townhouse" | "penthouse";
  listingTransaction?: "sale" | "rent";
  inquiryType?: "buy" | "rent";
  signal?: AbortSignal;
}): Promise<FeedPage> {
  const result = await bffRequest<{ ok: true } & FeedPage>({
    path: "posts/feed",
    method: "POST",
    data: {
      page: input.page,
      perPage: input.perPage ?? FEED_LIST_PAGE_SIZE,
      refreshFeed: input.refreshFeed,
      searchText: input.searchText,
      feedType: input.feedType,
      propertyCategory: input.propertyCategory,
      listingTransaction: input.listingTransaction,
      inquiryType: input.inquiryType,
    },
    signal: input.signal,
  });
  return {
    posts: result.posts,
    page: result.page,
    perPage: result.perPage,
    total: result.total,
    lastPage: result.lastPage,
    hasNextPage: result.hasNextPage,
  };
}

export async function fetchPostDetailsRequest(
  postId: number,
  signal?: AbortSignal
): Promise<FeedPost> {
  const result = await bffRequest<{ ok: true; post: FeedPost }>({
    path: "posts/details",
    method: "POST",
    data: { postId },
    signal,
  });
  return result.post;
}

export async function toggleLikeRequest(input: {
  postId: number;
  reactionType?: string | null;
  isTapToggle?: boolean;
}) {
  return bffRequest<{
    ok: true;
    isLiked: boolean;
    userReaction: PostReactionType | null;
  }>({
    path: "posts/like",
    method: "POST",
    data: input,
  });
}

export async function toggleSaveRequest(postId: number) {
  return bffRequest<{ ok: true; isSaved: boolean }>({
    path: "posts/save",
    method: "POST",
    data: { postId },
  });
}

export async function fetchCommentsRequest(input: {
  postId: number;
  page?: number;
  signal?: AbortSignal;
}): Promise<CommentsPage> {
  const result = await bffRequest<{ ok: true } & CommentsPage>({
    path: `posts/${input.postId}/comments`,
    method: "GET",
    params: { page: input.page ?? 1, limit: 20 },
    signal: input.signal,
  });
  return {
    comments: result.comments,
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
  };
}

export async function fetchPostLikersRequest(input: {
  postId: number;
  page?: number;
  signal?: AbortSignal;
}): Promise<PostLikersPage> {
  const result = await bffRequest<{ ok: true } & PostLikersPage>({
    path: `posts/${input.postId}/likers`,
    method: "GET",
    params: { page: input.page ?? 1, limit: 20 },
    signal: input.signal,
  });
  return {
    likers: result.likers,
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
  };
}

export async function createCommentRequest(input: {
  postId: number;
  comment: string;
  mentionedUserIds?: number[];
  mentionedUsers?: Array<{
    user_id: number;
    display_name?: string;
    user_name?: string;
  }>;
}): Promise<PostComment> {
  const result = await bffRequest<{ ok: true; comment: PostComment }>({
    path: "posts/comment",
    method: "POST",
    data: input,
  });
  return result.comment;
}

export async function fetchCommentReactionsRequest(input: {
  commentId: number;
  page?: number;
  signal?: AbortSignal;
}): Promise<PostLikersPage> {
  const result = await bffRequest<{ ok: true } & PostLikersPage>({
    path: "posts/comment/reactions",
    method: "POST",
    data: { commentId: input.commentId, page: input.page ?? 1 },
    signal: input.signal,
  });
  return {
    likers: result.likers,
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
  };
}

export async function toggleCommentReactionRequest(input: {
  commentId: number;
  reactionType?: string | null;
  isTapToggle?: boolean;
}) {
  return bffRequest<{
    ok: true;
    isLiked: boolean;
    userReaction: PostReactionType | null;
  }>({
    path: "posts/comment/reaction",
    method: "POST",
    data: input,
  });
}

export async function createPostRequest(form: FormData): Promise<{
  id: number;
  influencerChallenge: unknown;
}> {
  const result = await bffRequest<{
    ok: true;
    id: number;
    influencerChallenge?: unknown;
  }>({
    path: "posts/create",
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
  return {
    id: result.id,
    influencerChallenge: result.influencerChallenge ?? null,
  };
}

export async function fetchReportReasonsRequest(
  signal?: AbortSignal
): Promise<ReportReason[]> {
  const result = await bffRequest<{ ok: true; reasons: ReportReason[] }>({
    path: "posts/report-reasons",
    method: "GET",
    signal,
  });
  return result.reasons;
}

export async function reportPostRequest(input: {
  postId: number;
  reportReason: string;
  reportMessage?: string;
}) {
  return bffRequest<{ ok: true }>({
    path: "posts/report",
    method: "POST",
    data: input,
  });
}

export async function hidePostRequest(postId: number) {
  return bffRequest<{ ok: true }>({
    path: "posts/hide",
    method: "POST",
    data: { postId },
  });
}

export async function notInterestedRequest(postId: number) {
  return bffRequest<{ ok: true }>({
    path: "posts/not-interested",
    method: "POST",
    data: { postId },
  });
}

export async function storeRepostRequest(input: {
  postId: number;
  repostText?: string;
}) {
  return bffRequest<{ ok: true; id: number | null; message: string }>({
    path: "posts/repost",
    method: "POST",
    data: input,
  });
}

export async function deletePostRequest(postId: number) {
  return bffRequest<{ ok: true }>({
    path: "posts/delete",
    method: "POST",
    data: { postId },
  });
}

export async function deleteRepostRequest(postId: number) {
  return bffRequest<{ ok: true; message: string }>({
    path: "posts/repost/delete",
    method: "POST",
    data: { postId },
  });
}

export async function deleteCommentRequest(commentId: number) {
  return bffRequest<{ ok: true }>({
    path: "posts/comment/delete",
    method: "POST",
    data: { commentId },
  });
}

export async function pinPostRequest(input: {
  postId: number;
  pinned: boolean;
}) {
  return bffRequest<{ ok: true }>({
    path: "posts/pin",
    method: "POST",
    data: input,
  });
}
