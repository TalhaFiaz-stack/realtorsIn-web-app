import {
  normalizePostReactionType,
  normalizeReactionSummary,
} from "@/features/feed/constants/post-reactions";
import type {
  CommentsPage,
  FeedPage,
  FeedPost,
  PostComment,
  PostLiker,
  PostLikersPage,
  PostMediaImage,
  PostMediaVideo,
  PostMention,
  PostRepostInfo,
  PostRepostUser,
  ReportReason,
} from "@/features/feed/types/post.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function mapImages(raw: unknown): PostMediaImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = asRecord(item);
      const url = asString(row?.image_url) ?? asString(row?.url);
      if (!url) return null;
      return { id: (row?.id as string | number | null) ?? null, url };
    })
    .filter(Boolean) as PostMediaImage[];
}

function mapVideos(raw: unknown): PostMediaVideo[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = asRecord(item);
      const url = asString(row?.video_url) ?? asString(row?.url);
      if (!url) return null;
      return { id: (row?.id as string | number | null) ?? null, url };
    })
    .filter(Boolean) as PostMediaVideo[];
}

/** Resolves author avatar from feed / activity post payloads (mobile uses `user.avatar` too). */
export function resolvePostAuthorAvatarUrl(
  row: Record<string, unknown>
): string | null {
  const direct =
    asString(row.user_image) ??
    asString(row.profile_image) ??
    asString(row.avatar) ??
    asString(row.user_avatar);
  if (direct) return direct;

  const user = asRecord(row.user);
  if (user) {
    return (
      asString(user.avatar) ??
      asString(user.profile_image) ??
      asString(user.user_image) ??
      asString(user.profile_image_url)
    );
  }

  return null;
}

function mapRepostUser(raw: unknown): PostRepostUser | null {
  const row = asRecord(raw);
  if (!row) return null;
  const reposterId =
    asString(row.reposter_id) ?? asString(row.reposterId) ?? asString(row.id);
  if (!reposterId) return null;
  return {
    reposterId,
    reposterName:
      asString(row.reposter_name) ??
      asString(row.reposterName) ??
      "Member",
    reposterUserName:
      asString(row.reposter_user_name) ?? asString(row.reposterUserName),
    reposterImage:
      asString(row.reposter_image) ?? asString(row.reposterImage),
    repostText: asString(row.repost_text) ?? asString(row.repostText),
    repostedAt:
      asString(row.reposted_at) ??
      asString(row.repostedAt) ??
      asString(row.created_at),
  };
}

function mapRepostInfo(raw: unknown): PostRepostInfo | null {
  const row = asRecord(raw);
  if (!row) return null;
  const allReposters = Array.isArray(row.all_reposters)
    ? row.all_reposters
        .map(mapRepostUser)
        .filter((r): r is PostRepostUser => Boolean(r))
    : [];
  return {
    isRepost: asBool(row.is_repost),
    totalReposts: asNumber(row.total_reposts),
    allReposters,
  };
}

/** First non-empty repost commentary on a connection repost feed item. */
export function getConnectionRepostThoughts(
  info: PostRepostInfo | null | undefined
): string | null {
  if (!info?.isRepost) return null;
  for (const reposter of info.allReposters) {
    const text = reposter.repostText?.trim();
    if (text) return text;
  }
  return null;
}

function mapMentions(raw: unknown): PostMention[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      return {
        userId: asString(row.user_id) ?? asString(row.id),
        displayName: asString(row.display_name) ?? asString(row.name),
        userName: asString(row.user_name),
      };
    })
    .filter(Boolean) as PostMention[];
}

export function mapFeedPost(raw: unknown, depth = 0): FeedPost | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id, NaN);
  if (!Number.isFinite(id)) return null;
  if (depth > 2) return null;

  const first = asString(row.first_name) ?? "";
  const last = asString(row.last_name) ?? "";
  const composed = `${first} ${last}`.trim();
  const authorName =
    asString(row.full_name) ??
    asString(row.name) ??
    (composed || asString(row.user_name) || "Member");

  const userReaction =
    normalizePostReactionType(asString(row.user_reaction)) ??
    normalizePostReactionType(asString(row.liked_reaction));
  const isLiked =
    asBool(row.is_liked) ||
    asBool(row.liked) ||
    userReaction != null;

  const repostDataRaw = row.repost_data;
  const repostData = repostDataRaw
    ? mapFeedPost(repostDataRaw, depth + 1)
    : null;
  const repostInfo = mapRepostInfo(row.repost_info);

  return {
    id,
    userId: asString(row.user_id),
    authorName,
    userName: asString(row.user_name),
    avatarUrl: resolvePostAuthorAvatarUrl(row),
    isVerified: asBool(row.is_verified),
    description: asString(row.description) ?? "",
    createdAt:
      asString(row.created_at) ??
      asString(row.createdAt) ??
      asString(row.format_created_at),
    likeCount: asNumber(row.like_counts),
    commentCount: asNumber(row.comment_counts),
    isLiked,
    userReaction: userReaction ?? (isLiked ? "like" : null),
    reactionSummary: normalizeReactionSummary(row.reaction_summary),
    mentions: mapMentions(row.mentions),
    isSaved: asBool(row.is_saved),
    isOwn: asBool(row.is_own),
    isReposted: asBool(row.is_reposted),
    repostCount: asNumber(row.repost_count),
    repostInfo,
    repostData,
    isRepostWithThoughts:
      asBool(row.is_repost_with_thoughts) || repostData != null,
    isPinned: asBool(row.is_pinned),
    visibility:
      asString(row.visibility)?.toLowerCase() === "public"
        ? "public"
        : "connections",
    images: mapImages(row.images),
    videos: mapVideos(row.videos),
    isPropertyShare:
      asBool(row.is_property_share) || asRecord(row.property_data) != null,
    isProjectShare:
      asBool(row.is_project_share) || asRecord(row.project_data) != null,
    propertyData: asRecord(row.property_data),
    projectData: asRecord(row.project_data),
  };
}

export function mapFeedPage(payload: unknown): FeedPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.data) ? data.data : [];
  const posts = list
    .map(mapFeedPost)
    .filter((p): p is FeedPost => Boolean(p));

  const page = asNumber(data?.current_page, 1);
  const lastPage = asNumber(data?.last_page, page);
  const next = asString(data?.next_page_url);

  return {
    posts,
    page,
    perPage: asNumber(data?.per_page, posts.length || 20),
    total: asNumber(data?.total, posts.length),
    lastPage,
    hasNextPage: Boolean(next) || page < lastPage,
  };
}

export function mapComment(raw: unknown): PostComment | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id, NaN);
  if (!Number.isFinite(id)) return null;
  const isLiked = asBool(row.is_liked);
  const userReaction =
    normalizePostReactionType(asString(row.user_reaction)) ??
    (isLiked ? "like" : null);
  return {
    id,
    userId: asString(row.user_id),
    authorName:
      asString(row.name) ?? asString(row.user_name) ?? "Member",
    userName: asString(row.user_name),
    avatarUrl: asString(row.user_image),
    comment: asString(row.comment) ?? "",
    createdAt:
      asString(row.created_at) ??
      asString(row.createdAt) ??
      asString(row.format_created_at),
    isOwn: asBool(row.is_own),
    likeCount: asNumber(row.like_counts ?? row.likes_count),
    isLiked,
    userReaction,
    reactionSummary: normalizeReactionSummary(row.reaction_summary),
    mentions: mapMentions(row.mentions),
  };
}

export function mapCommentsPage(payload: unknown): CommentsPage {
  const root = asRecord(payload);
  // Backend: { data: { comments, pagination } } — BFF may also flatten.
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.comments)
    ? data.comments
    : Array.isArray(root?.comments)
      ? root.comments
      : [];
  const pagination =
    asRecord(data?.pagination) ?? asRecord(root?.pagination) ?? data;
  const page = asNumber(pagination?.page, 1);
  const totalPages = asNumber(pagination?.totalPages, 1);
  const hasNextPage =
    asBool(pagination?.hasNextPage) || page < totalPages;
  return {
    comments: list
      .map(mapComment)
      .filter((c): c is PostComment => Boolean(c)),
    page,
    limit: asNumber(pagination?.limit, 20),
    total: asNumber(pagination?.total, list.length),
    totalPages,
    hasNextPage,
  };
}

export function mapPostLiker(raw: unknown): PostLiker | null {
  const row = asRecord(raw);
  if (!row) return null;
  const userId = asNumber(row.user_id, NaN);
  if (!Number.isFinite(userId) || userId <= 0) return null;
  return {
    userId,
    name: asString(row.name) ?? asString(row.user_name) ?? "Member",
    userName: asString(row.user_name),
    avatarUrl: asString(row.user_image),
    company: asString(row.company),
    role: asString(row.user_role),
    isVerified: asBool(row.is_verified),
    reactionType: normalizePostReactionType(asString(row.reaction_type)) ?? "like",
    likedAt: asString(row.liked_at),
  };
}

export function mapPostLikersPage(payload: unknown): PostLikersPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.likers)
    ? data.likers
    : Array.isArray(root?.likers)
      ? root.likers
      : [];
  const pagination =
    asRecord(data?.pagination) ?? asRecord(root?.pagination) ?? data;
  const page = asNumber(pagination?.page, 1);
  const totalPages = asNumber(pagination?.totalPages, 1);
  const hasNextPage =
    asBool(pagination?.hasNextPage) || page < totalPages;
  return {
    likers: list
      .map(mapPostLiker)
      .filter((item): item is PostLiker => Boolean(item)),
    page,
    limit: asNumber(pagination?.limit, 20),
    total: asNumber(pagination?.total, list.length),
    totalPages,
    hasNextPage,
  };
}

export function mapReportReasons(payload: unknown): ReportReason[] {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data) ? root.data : [];
  return list
    .map((item) => {
      const row = asRecord(item);
      const key = asString(row?.key);
      const title = asString(row?.title);
      if (!key || !title) return null;
      return {
        key,
        title,
        message: asString(row?.message) ?? "",
      };
    })
    .filter(Boolean) as ReportReason[];
}

export function isBackendSuccess(payload: unknown): boolean {
  const p = asRecord(payload);
  if (!p) return false;
  return (
    p.status === true ||
    p.status === "true" ||
    p.success === true ||
    p.success === "true"
  );
}

export function backendMessage(payload: unknown, fallback: string): string {
  const p = asRecord(payload);
  return asString(p?.message) ?? fallback;
}

export { formatRelativeTime } from "@/lib/format-relative-time";
