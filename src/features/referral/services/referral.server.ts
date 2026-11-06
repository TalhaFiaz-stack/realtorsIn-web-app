import "server-only";

import {
  mapReferralHistoryPayload,
  mapReferralStatus,
  mapReferralValidatePayload,
  mapVerifiedBrokersPayload,
} from "@/features/referral/lib/map-referral";
import type {
  ReferralHistoryPage,
  ReferralStatus,
  ReferralValidateResult,
  VerifiedBrokersResult,
} from "@/features/referral/types/referral.types";
import type { VerifiedBrokersListInput } from "@/features/referral/validators/referral.validators";
import {
  socialApiPublicRequest,
  socialApiRequest,
} from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export async function fetchReferralStatus(): Promise<ReferralStatus> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/referral/status",
    method: "GET",
    auth: true,
  });
  const root = asRecord(payload);
  if (!root || root.status !== true) {
    throw new ApiError(
      "SERVER",
      asString(root?.message) ?? "Unable to load referral status",
      502
    );
  }
  return mapReferralStatus(root.data);
}

export async function fetchReferralHistory(): Promise<ReferralHistoryPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/referral/history",
    method: "GET",
    auth: true,
  });
  const root = asRecord(payload);
  if (!root || root.status !== true) {
    throw new ApiError(
      "SERVER",
      asString(root?.message) ?? "Unable to load referral history",
      502
    );
  }
  return mapReferralHistoryPayload(payload);
}

export async function listVerifiedBrokers(
  input: VerifiedBrokersListInput
): Promise<VerifiedBrokersResult> {
  try {
    const payload = await socialApiRequest<unknown>({
      path: "/api/referral/verified-brokers",
      method: "GET",
      auth: true,
      params: {
        page: input.page,
        limit: input.limit,
        ...(input.search ? { search: input.search } : {}),
      },
    });
    const root = asRecord(payload);
    if (!root || root.status !== true) {
      throw new ApiError(
        "SERVER",
        asString(root?.message) ?? "Unable to load verified brokers",
        502
      );
    }
    return {
      ok: true,
      locked: false,
      page: mapVerifiedBrokersPayload(payload),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      const body = asRecord(error.details);
      if (body?.code === "CONNECTOR_BADGE_REQUIRED") {
        return {
          ok: false,
          locked: true,
          message:
            asString(body.message) ??
            "Refer broker friends to unlock the verified broker directory.",
          status: mapReferralStatus(body.data),
        };
      }
    }
    throw error;
  }
}

export async function markReferralModalShown(): Promise<void> {
  const payload = await socialApiRequest<{ status?: boolean }>({
    path: "/api/referral/modal-shown",
    method: "POST",
    auth: true,
    data: {},
  });
  if (payload?.status !== true) {
    throw new ApiError("SERVER", "Unable to update referral prompt", 502);
  }
}

export async function skipReferralModal(): Promise<void> {
  const payload = await socialApiRequest<{ status?: boolean }>({
    path: "/api/referral/skip",
    method: "POST",
    auth: true,
    data: {},
  });
  if (payload?.status !== true) {
    throw new ApiError("SERVER", "Unable to skip referral prompt", 502);
  }
}

export async function validateReferralCode(
  ref: string
): Promise<ReferralValidateResult> {
  const payload = await socialApiPublicRequest<unknown>({
    path: "/api/referral/validate",
    method: "GET",
    params: { ref },
  });
  return mapReferralValidatePayload(payload);
}
