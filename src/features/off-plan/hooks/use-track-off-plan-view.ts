"use client";

import { useEffect } from "react";
import {
  trackOffPlanActivity,
  type OffPlanActivityInput,
} from "@/features/off-plan/services/off-plan-track.client";

/** Record a view once `enabled` (e.g. data loaded). Deduped per project/unit. */
export function useTrackOffPlanView(
  input: OffPlanActivityInput | null,
  enabled: boolean
) {
  const key = input
    ? `${input.eventType}|${input.analyticsAction}|${input.projectId}|${input.unitId ?? ""}`
    : "";
  useEffect(() => {
    if (!enabled || !input) return;
    trackOffPlanActivity({ ...input, dedupe: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
}
