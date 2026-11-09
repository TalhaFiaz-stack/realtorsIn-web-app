import {
  normalizePostReactionType,
  normalizeReactionSummary,
} from "@/features/feed/constants/post-reactions";
import { mapFeedPage, mapFeedPost } from "@/features/feed/lib/map-post";
import type { FeedPage } from "@/features/feed/types/post.types";
import type {
  ActivityCommentItem,
  ActivityCommentsPage,
  ActivityRepostItem,
  ActivityRepostsPage,
  ActivitySummary,
} from "@/features/activities/types/activity.types";

type Raw = Record<string, unknown>;

function asRecord(value: unknown): Raw | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Raw)
    : null;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function mapActivitySummary(payload: unknown): ActivitySummary {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  return {
    likedPostsCount: asNumber(data?.liked_posts_count),
    commentsCount: asNumber(data?.comments_count),
    repostsCount: asNumber(data?.reposts_count),
    postsCount: asNumber(data?.posts_count),
    savedPostsCount: asNumber(data?.saved_posts_count),
  };
}

export function mapActivityPostsPage(payload: unknown): FeedPage {
  return mapFeedPage(payload);
}

function mapActivityRepost(raw: unknown): ActivityRepostItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id, NaN);
  if (!Number.isFinite(id)) return null;
  const post = mapFeedPost(row.post);
  if (!post) return null;
  return {
    id,
    postId: asNumber(row.post_id, post.id),
    repostText: asString(row.repost_text),
    repostedAt:
      asString(row.reposted_at) ??
      asString(row.repostedAt) ??
      asString(row.created_at),
    post,
  };
}

/** Reposts API returns `{ post, repost_text, reposted_at }` rows — not flat posts. */
export function mapRepostsPage(payload: unknown): ActivityRepostsPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.data) ? data.data : [];
  const reposts = list
    .map(mapActivityRepost)
    .filter((r): r is ActivityRepostItem => Boolean(r));
  const page = asNumber(data?.current_page, 1);
  const lastPage = asNumber(data?.last_page, page);
  const next = asString(data?.next_page_url);

  return {
    reposts,
    page,
    lastPage,
    hasNextPage: Boolean(next) || page < lastPage,
    total: asNumber(data?.total, reposts.length),
  };
}

export function mapSavedPostsPage(payload: unknown): FeedPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const list = Array.isArray(data?.posts) ? data.posts : [];
  const posts = list
    .map((raw) => mapFeedPost(raw))
    .filter((p): p is NonNullable<ReturnType<typeof mapFeedPost>> => Boolean(p))
    .map((post) => ({ ...post, isSaved: true }));
  const pagination = asRecord(data?.pagination) ?? {};
  const page = asNumber(pagination.page, 1);
  const totalPages = asNumber(pagination.totalPages, page);
  const hasNextPage =
    pagination.hasNextPage === true ||
    pagination.hasNextPage === "true" ||
    page < totalPages;

  return {
    posts,
    page,
    perPage: asNumber(pagination.limit, 20),
    total: asNumber(pagination.total, posts.length),
    lastPage: totalPages || page,
    hasNextPage,
  };
}

function mapCommentMentions(raw: unknown): ActivityCommentItem["mentions"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;
      return {
        userId: asString(row.user_id) ?? asString(row.userId),
        displayName: asString(row.name) ?? asString(row.display_name),
        userName: asString(row.user_name) ?? asString(row.username),
      };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
}

function mapActivityComment(raw: unknown): ActivityCommentItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id, NaN);
  if (!Number.isFinite(id)) return null;
  const postRaw = row.post ?? row.post_data;
  const user = asRecord(row.user);
  const avatar =
    asString(user?.avatar) ??
    asString(user?.profile_image) ??
    asString(user?.profile_image_url) ??
    asString(row.user_image) ??
    asString(row.profile_image);
  return {
    id,
    comment:
      asString(row.comment) ??
      asString(row.comment_text) ??
      asString(row.text) ??
      "",
    createdAt:
      asString(row.created_at) ??
      asString(row.format_created_at) ??
      asString(row.createdAt),
    timeAgo: asString(row.time_ago) ?? asString(row.timeAgo),
    likeCount: asNumber(
      row.likes ??
        row.like_counts ??
        row.likes_count ??
        row.like_count
    ),
    isLiked: asBool(row.is_liked),
    userReaction:
      normalizePostReactionType(asString(row.user_reaction)) ??
      (asBool(row.is_liked) ? "like" : null),
    reactionSummary: normalizeReactionSummary(row.reaction_summary),
    authorName: asString(user?.name) ?? asString(user?.full_name) ?? "You",
    avatarUrl: avatar,
    mentions: mapCommentMentions(row.mentions),
    post: mapFeedPost(postRaw),
  };
}

export function mapActivityCommentsPage(payload: unknown): ActivityCommentsPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.data) ? data.data : [];
  const comments = list
    .map(mapActivityComment)
    .filter((c): c is ActivityCommentItem => Boolean(c));
  const page = asNumber(data?.current_page, 1);
  const lastPage = asNumber(data?.last_page, page);
  const next = asString(data?.next_page_url);

  return {
    comments,
    page,
    lastPage,
    hasNextPage: Boolean(next) || page < lastPage,
    total: asNumber(data?.total, comments.length),
  };
}
