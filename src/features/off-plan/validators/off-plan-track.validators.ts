import { z } from "zod";
import {
  OFF_PLAN_ANALYTICS_ACTIONS,
  OFF_PLAN_TRACK_EVENTS,
} from "@/features/off-plan/lib/off-plan-tracking";

export const offPlanTrackBodySchema = z.object({
  eventType: z.enum(OFF_PLAN_TRACK_EVENTS).optional(),
  analyticsAction: z.enum(OFF_PLAN_ANALYTICS_ACTIONS).optional(),
  projectId: z.string().trim().min(1).max(64),
  projectName: z.string().trim().max(300).optional(),
  unitId: z.string().trim().max(64).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).optional(),
});

export type OffPlanTrackBody = z.infer<typeof offPlanTrackBodySchema>;
