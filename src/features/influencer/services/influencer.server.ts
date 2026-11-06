import "server-only";

import {
  mapInfluencerStatus,
  mapInfluencerStatusPayload,
} from "@/features/influencer/lib/map-influencer";
import type { InfluencerStatus } from "@/features/influencer/types/influencer.types";
import { socialApiRequest } from "@/lib/api/server-client";
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

function assertSuccess(payload: unknown, fallback: string): InfluencerStatus {
  const root = asRecord(payload);
  if (!root || root.status !== true) {
    throw new ApiError(
      "SERVER",
      asString(root?.message) ?? fallback,
      root?.status === false ? 400 : 502
    );
  }
  return mapInfluencerStatusPayload(payload);
}

export async function fetchInfluencerStatus(): Promise<InfluencerStatus> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/influencer/status",
    method: "GET",
    auth: true,
  });
  return assertSuccess(payload, "Unable to load influencer challenge");
}

export async function startInfluencerChallenge(input: {
  fromFirstVideoPopup?: boolean;
}): Promise<InfluencerStatus> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/influencer/start",
    method: "POST",
    auth: true,
    data: {
      from_first_video_popup: Boolean(input.fromFirstVideoPopup),
    },
  });
  return assertSuccess(payload, "Unable to start challenge");
}

export async function dismissInfluencerFirstPopup(): Promise<void> {
  const payload = await socialApiRequest<{ status?: boolean; message?: string }>(
    {
      path: "/api/influencer/dismiss-first-popup",
      method: "POST",
      auth: true,
      data: {},
    }
  );
  if (payload?.status !== true) {
    throw new ApiError(
      "SERVER",
      payload?.message ?? "Unable to dismiss popup",
      502
    );
  }
}

export async function markInfluencerModalShown(): Promise<void> {
  const payload = await socialApiRequest<{ status?: boolean }>({
    path: "/api/influencer/modal-shown",
    method: "POST",
    auth: true,
    data: {},
  });
  if (payload?.status !== true) {
    throw new ApiError("SERVER", "Unable to update modal state", 502);
  }
}

export async function skipInfluencerModal(): Promise<void> {
  const payload = await socialApiRequest<{ status?: boolean }>({
    path: "/api/influencer/skip",
    method: "POST",
    auth: true,
    data: {},
  });
  if (payload?.status !== true) {
    throw new ApiError("SERVER", "Unable to skip modal", 502);
  }
}
