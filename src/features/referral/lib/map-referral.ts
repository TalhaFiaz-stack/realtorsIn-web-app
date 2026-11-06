import { mapNetworkPerson } from "@/features/network/lib/map-network";
import type {
  ReferralHistoryItem,
  ReferralHistoryPage,
  ReferralProgress,
  ReferralReferredUser,
  ReferralStatus,
  ReferralValidateResult,
  VerifiedBrokersPage,
} from "@/features/referral/types/referral.types";

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

function asNumber(value: unknown, fallback: number | null = null): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function mapReferralStatus(raw: unknown): ReferralStatus {
  const row = asRecord(raw) ?? {};
  return {
    referralCode: asString(row.referral_code),
    referralCount: asNumber(row.referral_count, 0) ?? 0,
    referralTarget: asNumber(row.referral_target, 2) ?? 2,
    hasConnectorBadge: asBool(row.has_connector_badge),
    canRefer: asBool(row.can_refer),
    shouldShowModal: asBool(row.should_show_modal),
    progressText: asString(row.progress_text),
  };
}

function mapReferralProgress(raw: unknown): ReferralProgress {
  const row = asRecord(raw) ?? {};
  const stepsRaw = Array.isArray(row.steps) ? row.steps : [];
  const steps = stepsRaw
    .map((item) => {
      const step = asRecord(item);
      if (!step) return null;
      const key = asString(step.key);
      const label = asString(step.label);
      if (!key || !label) return null;
      return { key, label, done: asBool(step.done) };
    })
    .filter((s): s is ReferralProgress["steps"][number] => Boolean(s));

  return {
    signupComplete: asBool(row.signup_complete),
    phoneAdded: asBool(row.phone_added),
    emailAdded: asBool(row.email_added),
    usernameCreated: asBool(row.username_created),
    allComplete: asBool(row.all_complete),
    steps,
  };
}

function mapReferredUser(raw: unknown): ReferralReferredUser {
  const row = asRecord(raw) ?? {};
  return {
    userId: asNumber(row.user_id, 0) ?? 0,
    name: asString(row.name) ?? "Member",
    shortName: asString(row.short_name) ?? asString(row.name) ?? "Member",
    userName: asString(row.user_name),
    avatarUrl: asString(row.profile_image),
    isDeleted: asBool(row.is_deleted),
  };
}

export function mapReferralHistoryItem(raw: unknown): ReferralHistoryItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;

  return {
    id,
    referredUser: mapReferredUser(row.referred_user),
    status: asString(row.status) ?? "pending",
    statusLabel: asString(row.status_label) ?? asString(row.status) ?? "Pending",
    invalidReason: asString(row.invalid_reason),
    completedAt: asString(row.completed_at),
    createdAt: asString(row.created_at),
    progress: mapReferralProgress(row.progress),
    isDeleted: asBool(row.is_deleted),
  };
}

export function mapReferralHistoryPayload(payload: unknown): ReferralHistoryPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.referrals) ? data.referrals : [];
  const referrals = list
    .map(mapReferralHistoryItem)
    .filter((item): item is ReferralHistoryItem => Boolean(item));

  return {
    status: mapReferralStatus(data),
    referrals,
  };
}

export function mapVerifiedBrokersPayload(payload: unknown): VerifiedBrokersPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.brokers) ? data.brokers : [];
  const pagination = asRecord(data?.pagination);

  const people = list
    .map((row) => {
      const person = mapNetworkPerson(row);
      if (!person) return null;
      const brokerRow = asRecord(row);
      return {
        ...person,
        isVerified: asBool(brokerRow?.broker_card_verified) || person.isVerified,
      };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const page = asNumber(pagination?.page, 1) ?? 1;
  const perPage = asNumber(pagination?.limit, 20) ?? 20;
  const total = asNumber(pagination?.total, people.length) ?? people.length;

  return {
    people,
    page,
    perPage,
    total,
    hasMore: asBool(pagination?.has_more),
  };
}

export function mapReferralValidatePayload(payload: unknown): ReferralValidateResult {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const ok = asBool(root?.status);
  if (!ok || !data) {
    return { valid: false, referralCode: null, referrerId: null };
  }
  return {
    valid: true,
    referralCode: asString(data.referral_code),
    referrerId: asNumber(data.referrer_id),
  };
}
