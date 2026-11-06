import { bffRequest } from "@/lib/api/client";
import type { InfluencerStatus } from "@/features/influencer/types/influencer.types";

export async function fetchInfluencerStatusRequest(signal?: AbortSignal) {
  const result = await bffRequest<{ ok: true; status: InfluencerStatus }>({
    path: "influencer/status",
    method: "GET",
    signal,
  });
  return result.status;
}

export async function startInfluencerChallengeRequest(input?: {
  fromFirstVideoPopup?: boolean;
}) {
  const result = await bffRequest<{ ok: true; status: InfluencerStatus }>({
    path: "influencer/start",
    method: "POST",
    data: {
      fromFirstVideoPopup: input?.fromFirstVideoPopup ?? false,
    },
  });
  return result.status;
}

export async function dismissInfluencerFirstPopupRequest() {
  return bffRequest<{ ok: true }>({
    path: "influencer/dismiss-first-popup",
    method: "POST",
    data: {},
  });
}

export async function markInfluencerModalShownRequest() {
  return bffRequest<{ ok: true }>({
    path: "influencer/modal-shown",
    method: "POST",
    data: {},
  });
}

export async function skipInfluencerModalRequest() {
  return bffRequest<{ ok: true }>({
    path: "influencer/skip",
    method: "POST",
    data: {},
  });
}
