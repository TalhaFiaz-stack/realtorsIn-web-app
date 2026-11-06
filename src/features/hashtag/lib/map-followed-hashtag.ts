import type {
  FollowedHashtag,
  FollowedHashtagsPage,
} from "@/features/hashtag/types/hashtag.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function mapFollowedHashtag(raw: unknown): FollowedHashtag | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.hashtag_id) ?? asNumber(row.id);
  const title = asString(row.title) ?? asString(row.hashtag)?.replace(/^#/, "");
  if (id == null || !title) return null;
  return {
    id,
    title,
    label: asString(row.hashtag) ?? `#${title}`,
    usageCount: asNumber(row.usage_count) ?? 0,
    followedAt: asString(row.followed_at),
  };
}

export function mapFollowedHashtagsPage(payload: unknown): FollowedHashtagsPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.tags) ? data.tags : [];
  const tags = list
    .map(mapFollowedHashtag)
    .filter((t): t is FollowedHashtag => Boolean(t));
  const pagination = asRecord(data?.pagination);
  return {
    tags,
    page: asNumber(pagination?.page) ?? 1,
    total: asNumber(pagination?.total) ?? tags.length,
  };
}

export function isHashtagSuccess(payload: unknown): boolean {
  const root = asRecord(payload);
  return root?.status === true || root?.status === "true";
}

export function hashtagMessage(payload: unknown, fallback: string) {
  const root = asRecord(payload);
  return asString(root?.message) ?? fallback;
}
