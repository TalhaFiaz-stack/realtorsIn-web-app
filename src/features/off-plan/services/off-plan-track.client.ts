import { bffRequest } from "@/lib/api/client";
import {
  OFF_PLAN_TRACK_DEDUPE_MS,
  offPlanTrackDedupeKey,
  type OffPlanAnalyticsAction,
  type OffPlanTrackEvent,
} from "@/features/off-plan/lib/off-plan-tracking";

export type OffPlanActivityInput = {
  projectId: string;
  projectName?: string | null;
  eventType?: OffPlanTrackEvent;
  analyticsAction?: OffPlanAnalyticsAction;
  unitId?: string | null;
  metadata?: Record<string, string | number | null | undefined>;
  /** Skip repeats of the same activity within the dedupe window (views). */
  dedupe?: boolean;
};

const recent = new Map<string, number>();

/** Fire-and-forget; never throws and never blocks the UI. */
export function trackOffPlanActivity(input: OffPlanActivityInput): void {
  if (typeof window === "undefined") return;
  if (!input.projectId || (!input.eventType && !input.analyticsAction)) return;

  if (input.dedupe) {
    const key = offPlanTrackDedupeKey([
      input.eventType,
      input.analyticsAction,
      input.projectId,
      input.unitId,
    ]);
    const now = Date.now();
    const last = recent.get(key);
    if (last != null && now - last < OFF_PLAN_TRACK_DEDUPE_MS) return;
    recent.set(key, now);
  }

  const metadata: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(input.metadata ?? {})) {
    if (v !== undefined) metadata[k] = v;
  }

  void bffRequest({
    path: "off-plan/track",
    method: "POST",
    data: {
      eventType: input.eventType,
      analyticsAction: input.analyticsAction,
      projectId: String(input.projectId),
      projectName: input.projectName ?? undefined,
      unitId: input.unitId ?? undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    },
  }).catch(() => {
    /* telemetry is best-effort */
  });
}
