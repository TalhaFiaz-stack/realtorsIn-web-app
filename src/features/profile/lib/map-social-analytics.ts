import type {
  AnalyticsMetric,
  ProfileViewerRow,
  SocialAnalyticsDetail,
} from "@/features/profile/types/social-analytics.types";

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

function mapMetric(raw: unknown): AnalyticsMetric {
  const row = asRecord(raw);
  return {
    value: asNumber(row?.value) ?? 0,
    period: asString(row?.period),
    delta7dPercent: asNumber(row?.delta_7d_percent),
  };
}

function mapViewer(raw: unknown): ProfileViewerRow | null {
  const row = asRecord(raw);
  if (!row) return null;
  const viewerId =
    asNumber(row.viewer_id) ?? asNumber(row.viewerId) ?? asNumber(row.id);
  if (viewerId == null) return null;
  return {
    viewerId,
    name: asString(row.name),
    lastName: asString(row.last_name) ?? asString(row.lastName),
    userName: asString(row.user_name) ?? asString(row.userName),
    profileImage:
      asString(row.profile_image) ?? asString(row.profileImage),
    company: asString(row.company),
    userRole: asString(row.user_role) ?? asString(row.userRole),
    location: asString(row.location),
    lastViewedAt:
      asString(row.last_viewed_at) ?? asString(row.lastViewedAt),
  };
}

export function isSocialAnalyticsSuccess(payload: unknown): boolean {
  const root = asRecord(payload);
  return root?.status === true || root?.status === "true";
}

export function socialAnalyticsMessage(payload: unknown, fallback: string) {
  const root = asRecord(payload);
  return asString(root?.message) ?? fallback;
}

export function mapSocialAnalyticsDetail(
  payload: unknown
): SocialAnalyticsDetail | null {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) return null;
  const analytics = asRecord(data.analytics) ?? asRecord(data);
  if (!analytics) return null;

  const viewersRaw =
    asRecord(analytics.profile_viewers)?.viewers_list ??
    asRecord(analytics.profile_viewers)?.viewersList;
  const viewers = Array.isArray(viewersRaw)
    ? viewersRaw.map(mapViewer).filter((v): v is ProfileViewerRow => Boolean(v))
    : [];

  const profileViewersMetric = mapMetric(analytics.profile_viewers);
  const content = asRecord(data.content_summary) ?? asRecord(data.content);
  const weekly = asRecord(data.weekly_sharing_tracker);

  return {
    postImpressions: mapMetric(analytics.post_impressions),
    profileViewers: { ...profileViewersMetric, viewers },
    searchAppearances: mapMetric(analytics.search_appearances),
    connections: mapMetric(analytics.connections),
    contentSummary: {
      totalPosts: asNumber(content?.total_posts) ?? 0,
      totalLikesReceived: asNumber(content?.total_likes_received) ?? 0,
      totalCommentsReceived: asNumber(content?.total_comments_received) ?? 0,
    },
    weeklySharing: {
      suggestedActions: asNumber(weekly?.suggested_actions) ?? 0,
      completedActions: asNumber(weekly?.completed_actions) ?? 0,
      breakdown: {
        posts: asNumber(asRecord(weekly?.breakdown)?.posts) ?? 0,
        likes: asNumber(asRecord(weekly?.breakdown)?.likes) ?? 0,
        comments: asNumber(asRecord(weekly?.breakdown)?.comments) ?? 0,
      },
    },
    lastUpdated:
      asString(data.last_updated) ?? asString(data.updated_at),
  };
}
