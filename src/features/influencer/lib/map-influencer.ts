import type {
  InfluencerPostCreateChallenge,
  InfluencerStatus,
} from "@/features/influencer/types/influencer.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function mapInfluencerStatus(raw: unknown): InfluencerStatus {
  const row = asRecord(raw) ?? {};
  return {
    challengeStatus: asString(row.challenge_status) ?? "not_started",
    hasInfluencerBadge: asBool(row.has_influencer_badge),
    influencerBadgeEarnedAt: asString(row.influencer_badge_earned_at),
    videoCount: asNumber(row.video_count, 0),
    targetVideos: asNumber(row.target_videos, 30),
    dailyCap: asNumber(row.daily_cap, 2),
    windowDays: asNumber(row.window_days, 45),
    daysRemaining: asNumber(row.days_remaining, 0),
    challengeStartedAt: asString(row.challenge_started_at),
    challengeEndsAt: asString(row.challenge_ends_at),
    progressText:
      asString(row.progress_text) ?? "Post videos to earn the Influencer Badge.",
    progressRatio: Math.min(1, Math.max(0, asNumber(row.progress_ratio, 0))),
    featureEnabled: row.feature_enabled !== false,
    shouldShowModal: asBool(row.should_show_modal),
    popupVariant: asString(row.popup_variant),
    modalHeadline: asString(row.modal_headline),
    modalBody: asString(row.modal_body),
  };
}

export function mapInfluencerStatusPayload(payload: unknown): InfluencerStatus {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  return mapInfluencerStatus(data);
}

export function mapInfluencerPostCreateChallenge(
  raw: unknown
): InfluencerPostCreateChallenge | null {
  const row = asRecord(raw);
  if (!row) return null;
  const status = mapInfluencerStatus(row);
  return {
    ...status,
    shouldShowStartPopup: asBool(row.should_show_start_popup),
    countedTowardChallenge: asBool(row.counted_toward_challenge),
  };
}
