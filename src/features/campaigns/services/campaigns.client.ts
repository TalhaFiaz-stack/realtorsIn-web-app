import { bffRequest } from "@/lib/api/client";
import type { CampaignDesign, InAppCampaign } from "@/features/campaigns/types";

export async function fetchActiveCampaignsRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; campaigns: InAppCampaign[] }>({
    path: "campaigns/active",
    method: "GET",
    signal,
  });
}

export async function fetchCampaignDesignRequest(id: number, signal?: AbortSignal) {
  return bffRequest<{ ok: true; design: CampaignDesign }>({
    path: `campaigns/designs/${id}`,
    method: "GET",
    signal,
  });
}

export async function markCampaignReadRequest(id: number) {
  return bffRequest<{ ok: true }>({
    path: `campaigns/${id}/read`,
    method: "POST",
    data: {},
  });
}
