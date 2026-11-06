import { DEFAULT_STORY_IMAGE_DURATION_MS } from "@/features/stories/constants/story.constants";
import type {
  StoriesFeed,
  StoryItem,
  StoryMediaType,
  StoryUserGroup,
  StoryViewerRow,
  StoryViewersResult,
} from "@/features/stories/types/story.types";

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
  return asString(asRecord(payload)?.message) ?? fallback;
}

function mapMediaType(value: unknown): StoryMediaType {
  return asString(value)?.toLowerCase() === "video" ? "video" : "image";
}

export function mapStoryItem(raw: unknown): StoryItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id, NaN);
  const mediaUrl = asString(row.media_url);
  if (!Number.isFinite(id) || !mediaUrl) return null;
  const mediaType = mapMediaType(row.media_type);
  const durationMs = asNumber(
    row.duration_ms,
    mediaType === "image" ? DEFAULT_STORY_IMAGE_DURATION_MS : 0
  );
  return {
    id,
    mediaUrl,
    thumbnailUrl: asString(row.thumbnail_url),
    mediaType,
    durationMs:
      durationMs > 0
        ? durationMs
        : mediaType === "image"
          ? DEFAULT_STORY_IMAGE_DURATION_MS
          : DEFAULT_STORY_IMAGE_DURATION_MS,
    caption: asString(row.caption),
    visibility: asString(row.visibility) ?? "connections",
    createdAt: asString(row.created_at),
    expiresAt: asString(row.expires_at),
    viewCount: asNumber(row.view_count),
    reactionCount: asNumber(row.reaction_count),
    hasViewed: asBool(row.has_viewed),
    hasReacted: asBool(row.has_reacted),
    isOwn: asBool(row.is_own),
  };
}

export function mapStoryUserGroup(raw: unknown): StoryUserGroup | null {
  const row = asRecord(raw);
  if (!row) return null;
  const userId = asNumber(row.user_id, NaN);
  if (!Number.isFinite(userId)) return null;
  const storiesRaw = Array.isArray(row.stories) ? row.stories : [];
  const stories = storiesRaw
    .map(mapStoryItem)
    .filter((item): item is StoryItem => Boolean(item));
  if (stories.length === 0) return null;
  return {
    userId,
    name:
      asString(row.name) ??
      asString(row.full_name) ??
      asString(row.user_name) ??
      "Member",
    userName: asString(row.user_name),
    avatarUrl: asString(row.avatar_url),
    hasUnseen: asBool(row.has_unseen),
    isOwn: asBool(row.is_own),
    stories,
  };
}

export function mapStoriesFeed(payload: unknown): StoriesFeed {
  const root = asRecord(payload);
  const data = root?.data;
  const list = Array.isArray(data) ? data : [];
  return {
    groups: list
      .map(mapStoryUserGroup)
      .filter((group): group is StoryUserGroup => Boolean(group)),
  };
}

export function mapStoryViewers(payload: unknown): StoryViewersResult {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.viewers) ? data.viewers : [];
  const viewers = list
    .map((raw): StoryViewerRow | null => {
      const row = asRecord(raw);
      if (!row) return null;
      const userId = asNumber(row.user_id, NaN);
      if (!Number.isFinite(userId)) return null;
      return {
        userId,
        name: asString(row.name) ?? asString(row.user_name) ?? "Member",
        userName: asString(row.user_name),
        avatarUrl: asString(row.avatar_url),
        viewedAt: asString(row.viewed_at),
        hasReacted: asBool(row.has_reacted),
      };
    })
    .filter((row): row is StoryViewerRow => Boolean(row));
  return {
    viewers,
    total: asNumber(data?.total, viewers.length),
    reactionCount: asNumber(data?.reaction_count, 0),
  };
}
