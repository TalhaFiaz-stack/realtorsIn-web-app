import { bffRequest } from "@/lib/api/client";
import type {
  ReferralHistoryPage,
  ReferralStatus,
  ReferralValidateResult,
  VerifiedBrokersResult,
} from "@/features/referral/types/referral.types";

export async function fetchReferralStatusRequest(signal?: AbortSignal) {
  const result = await bffRequest<{ ok: true; status: ReferralStatus }>({
    path: "referral/status",
    method: "GET",
    signal,
  });
  return result.status;
}

export async function fetchReferralHistoryRequest(signal?: AbortSignal) {
  const result = await bffRequest<{ ok: true } & ReferralHistoryPage>({
    path: "referral/history",
    method: "GET",
    signal,
  });
  return {
    status: result.status,
    referrals: result.referrals,
  };
}

export async function fetchVerifiedBrokersRequest(input: {
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
}): Promise<VerifiedBrokersResult> {
  return bffRequest<VerifiedBrokersResult & { ok?: boolean }>({
    path: "referral/verified-brokers",
    method: "GET",
    params: {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      ...(input.search ? { search: input.search } : {}),
    },
    signal: input.signal,
  });
}

export async function markReferralModalShownRequest() {
  return bffRequest<{ ok: true }>({
    path: "referral/modal-shown",
    method: "POST",
    data: {},
  });
}

export async function skipReferralModalRequest() {
  return bffRequest<{ ok: true }>({
    path: "referral/skip",
    method: "POST",
    data: {},
  });
}

export async function validateReferralCodeRequest(ref: string) {
  const result = await bffRequest<{ ok: true } & ReferralValidateResult>({
    path: "referral/validate",
    method: "GET",
    params: { ref },
  });
  return result;
}
