import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import type { CampaignDesign, InAppCampaign } from "@/features/campaigns/types";

type Payload = { status?: boolean; message?: string; data?: unknown };

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}
function asNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

/** Mobile `fetchActiveCampaigns` — unread, targeted in-app campaigns. */
export async function fetchActiveCampaigns(): Promise<InAppCampaign[]> {
  const payload = await socialApiRequest<Payload>({
    path: "/api/campaigns/active",
    method: "GET",
    auth: true,
  });
  if (!payload?.status || !Array.isArray(payload.data)) return [];
  return payload.data
    .map((raw): InAppCampaign | null => {
      const row = asRecord(raw);
      const id = asNumber(row?.id);
      if (!row || id == null) return null;
      return {
        id,
        title: asString(row.title) ?? asString(row.notification_title) ?? "Announcement",
        designId: asNumber(row.design_id),
        htmlContent: asString(row.html_content),
      };
    })
    .filter((c): c is InAppCampaign => c != null);
}

export async function markCampaignRead(id: number): Promise<void> {
  await socialApiRequest<Payload>({
    path: `/api/campaigns/${id}/read`,
    method: "POST",
    auth: true,
    data: {},
  });
}

/** Design behind a `view_content` push (mobile `CampaignPreviewBTSheet.open(designId)`). */
export async function fetchCampaignDesign(id: number): Promise<CampaignDesign> {
  const payload = await socialApiRequest<Payload>({
    path: `/api/campaigns/designs/${id}`,
    method: "GET",
    auth: true,
  });
  const data = asRecord(payload?.data);
  const html = asString(data?.html_content);
  if (!payload?.status || !data || !html) {
    throw new ApiError("NOT_FOUND", payload?.message || "Content not found", 404);
  }
  return { id, title: asString(data.title) ?? "Announcement", htmlContent: html };
}
