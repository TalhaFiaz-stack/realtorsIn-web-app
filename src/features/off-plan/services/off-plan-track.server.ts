import "server-only";

import {
  buildAnalyticsRecordBody,
} from "@/features/off-plan/lib/off-plan-tracking";
import type { OffPlanTrackBody } from "@/features/off-plan/validators/off-plan-track.validators";
import { offplanRequest } from "@/lib/api/offplan.server";
import { socialApiRequest } from "@/lib/api/server-client";

/**
 * Fire both mobile tracking channels. Never throws — telemetry must not break UX.
 * - REM catalog: POST rn/tracking/events/track (JSON, node_token Bearer)
 * - Social API:  POST /api/analytics/record   (JSON, session Bearer)
 */
export async function recordOffPlanActivity(body: OffPlanTrackBody) {
  const jobs: Promise<unknown>[] = [];

  if (body.eventType) {
    const payload: Record<string, unknown> = {
      eventType: body.eventType,
      entityId: body.projectId,
      entityName: body.projectName ?? "",
      source: "web",
    };
    if (body.metadata && Object.keys(body.metadata).length > 0) {
      payload.metadata = body.metadata;
    }
    jobs.push(
      offplanRequest<unknown>({
        path: "rn/tracking/events/track",
        method: "POST",
        data: payload,
      })
    );
  }

  if (body.analyticsAction) {
    jobs.push(
      socialApiRequest<unknown>({
        path: "/api/analytics/record",
        method: "POST",
        auth: true,
        data: buildAnalyticsRecordBody({
          action: body.analyticsAction,
          projectId: body.projectId,
          projectName: body.projectName,
          unitId: body.unitId,
        }),
      })
    );
  }

  await Promise.allSettled(jobs);
}
