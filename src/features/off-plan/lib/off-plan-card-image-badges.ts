import { offPlanConstructionLabel } from "@/features/off-plan/lib/off-plan-construction-label";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";

export type OffPlanCardImageBadges = {
  /** Sale/listing status (e.g. Announced, On Sale) — top-left on image. */
  saleStatus: string | null;
  /** Construction phase stacked under sale status (mobile `OffPlanComp`). */
  secondaryStatus: string | null;
  /** Green “Completed” pill top-right when applicable. */
  completedLabel: string | null;
  completedOnRight: boolean;
};

function norm(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

/** Mobile-aligned: sale + construction on the left stack; Completed on the right. */
export function getOffPlanCardImageBadges(
  project: Pick<
    OffPlanProjectSummary,
    | "projectStatus"
    | "completionStatusName"
    | "projectCompleted"
  >
): OffPlanCardImageBadges {
  const saleStatus = project.projectStatus?.trim() || null;
  const construction = offPlanConstructionLabel(project);
  const saleLower = norm(saleStatus);
  const constructionLower = norm(construction);

  const hasCompletedInTags =
    constructionLower === "completed" || saleLower === "completed";

  let completedLabel: string | null = null;

  if (constructionLower === "completed" && saleLower !== "completed") {
    completedLabel = "Completed";
  } else if (project.projectCompleted && !hasCompletedInTags) {
    completedLabel = "Completed";
  }

  const completedOnRight = completedLabel != null;

  let secondaryStatus: string | null = null;
  if (
    !completedOnRight &&
    construction &&
    constructionLower !== saleLower
  ) {
    secondaryStatus = construction;
  }

  return {
    saleStatus,
    secondaryStatus,
    completedLabel,
    completedOnRight,
  };
}
