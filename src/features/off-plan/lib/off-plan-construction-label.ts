import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";

export function offPlanConstructionLabel(
  project: Pick<
    OffPlanProjectSummary,
    "completionStatusName" | "projectCompleted"
  >
): string | null {
  const status = project.completionStatusName?.trim();
  if (status) return status;
  if (project.projectCompleted) return "Completed";
  return null;
}
