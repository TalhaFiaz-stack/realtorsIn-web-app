/**
 * Off-plan activity tracking — parity with mobile `trackEvents` (REM catalog
 * `rn/tracking/events/track`) and `recordAnalyticsApi` (social `analytics/record`).
 */

/** Event names used by mobile `trackEvents` for off-plan projects. */
export const OFF_PLAN_TRACK_EVENTS = [
  "project_detail_open",
  "unit_list_open",
  "unit_detail_open",
  "developer_popup_open",
  "sales_agency_popup_open",
  "quick_pdf_download",
  "unit_quick_pdf_download",
  "copy_offer_link",
  "unit_copy_offer_link",
  "sales_exec_call",
  "sales_exec_whatsapp",
  "sales_exec_email",
] as const;

export type OffPlanTrackEvent = (typeof OFF_PLAN_TRACK_EVENTS)[number];

/** Action types accepted by social `POST /api/analytics/record` for projects. */
export const OFF_PLAN_ANALYTICS_ACTIONS = [
  "project_view",
  "project_unit_list_view",
  "project_unit_detail_view",
  "project_share",
  "project_pdf_link_copy",
  "project_pdf_generate",
] as const;

export type OffPlanAnalyticsAction = (typeof OFF_PLAN_ANALYTICS_ACTIONS)[number];

/** Same-tab dedupe window so strict-mode remounts / refetches do not double count. */
export const OFF_PLAN_TRACK_DEDUPE_MS = 30_000;

export function offPlanTrackDedupeKey(parts: Array<string | null | undefined>) {
  return parts.map((p) => p ?? "").join("|");
}

export function buildAnalyticsRecordBody(input: {
  action: OffPlanAnalyticsAction;
  projectId: string;
  projectName?: string | null;
  unitId?: string | null;
}) {
  const body: Record<string, unknown> = {
    action_type: input.action,
    project_id: input.projectId,
  };
  const metadata: Record<string, string> = {};
  if (input.projectName) metadata.project_name = input.projectName;
  if (input.unitId) metadata.unit_id = input.unitId;
  if (Object.keys(metadata).length > 0) body.metadata = metadata;
  return body;
}
