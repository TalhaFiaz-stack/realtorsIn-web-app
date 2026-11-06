import type {
  BrokerVerificationRequestSummary,
  BrokerVerificationStatus,
} from "@/features/broker-verification/types/broker-verification.types";

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

function mapRequest(raw: unknown): BrokerVerificationRequestSummary | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  return {
    id,
    status: asString(row.status) ?? "pending",
    requestMessage: asString(row.request_message),
    adminNotes: asString(row.admin_notes),
    createdAt: asString(row.created_at),
    approvedAt: asString(row.approved_at),
    rejectedAt: asString(row.rejected_at),
  };
}

export function isBrokerVerificationSuccess(payload: unknown): boolean {
  const root = asRecord(payload);
  return root?.status === true || root?.status === "true";
}

export function brokerVerificationMessage(payload: unknown, fallback: string) {
  const root = asRecord(payload);
  return asString(root?.message) ?? fallback;
}

export function mapBrokerVerificationStatus(
  payload: unknown
): BrokerVerificationStatus | null {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) return null;

  const linksRaw = data.social_profile_links;
  const socialProfileLinks = Array.isArray(linksRaw)
    ? linksRaw.map((l) => asString(l)).filter((l): l is string => Boolean(l))
    : asString(linksRaw)
      ? [asString(linksRaw)!]
      : [];

  return {
    brokerCardVerified: Boolean(data.broker_card_verified),
    brokerCardVerifiedAt: asString(data.broker_card_verified_at),
    nicDocumentUrl: asString(data.nic_document),
    brokerCardDocumentUrl: asString(data.broker_card_document),
    socialProfileLinks,
    verificationStatus: asString(data.verification_status) ?? "none",
    latestRequest: mapRequest(data.latest_request),
  };
}
