import { mapFeedPost } from "@/features/feed/lib/map-post";
import type {
  SearchHashtag,
  SearchPageResult,
  SearchTab,
} from "@/features/feed/types/search.types";
import { mapNetworkPerson } from "@/features/network/lib/map-network";
import type { FeedPost } from "@/features/feed/types/post.types";
import type { NetworkPerson } from "@/features/network/types/network.types";

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

function pagination(data: Record<string, unknown>, itemCount: number) {
  const page = asNumber(data.current_page, 1);
  const lastPage = asNumber(data.last_page, page);
  const next = asString(data.next_page_url);
  return {
    page,
    perPage: asNumber(data.per_page, itemCount || 20),
    total: asNumber(data.total, itemCount),
    lastPage,
    hasNextPage: Boolean(next) || page < lastPage,
  };
}

function mapHashtag(raw: unknown): SearchHashtag | null {
  const row = asRecord(raw);
  if (!row) return null;
  const tag =
    asString(row.tag) ??
    asString(row.hashtag) ??
    asString(row.name);
  if (!tag) return null;
  return {
    hashtagId: asNumber(row.hashtag_id ?? row.id, NaN) || null,
    tag: tag.startsWith("#") ? tag : `#${tag}`,
    count: asNumber(row.count ?? row.posts_count),
    isFollowing: asBool(row.is_following),
  };
}

export function mapSearchPage(
  payload: unknown,
  tab: SearchTab
): SearchPageResult {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.data) ? data.data : [];
  const pageMeta = pagination(data ?? {}, list.length);

  if (tab === "account") {
    const people = list
      .map(mapNetworkPerson)
      .filter((p): p is NetworkPerson => Boolean(p));
    return { kind: "accounts", people, ...pageMeta };
  }

  if (tab === "tags") {
    const tags = list
      .map(mapHashtag)
      .filter((t): t is SearchHashtag => Boolean(t));
    return { kind: "tags", tags, ...pageMeta };
  }

  const posts = list
    .map(mapFeedPost)
    .filter((p): p is FeedPost => Boolean(p));
  return { kind: "posts", posts, ...pageMeta };
}
