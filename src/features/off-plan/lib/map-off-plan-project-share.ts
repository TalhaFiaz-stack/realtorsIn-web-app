import type { OffPlanProjectDetail } from "@/features/off-plan/types/off-plan.types";

/** Shape stored in `project_data` for feed shares (mobile off-plan list item). */
export function mapOffPlanProjectForShare(
  project: OffPlanProjectDetail
): Record<string, unknown> {
  return {
    id: project.id,
    title: project.title,
    developer_name: project.developerName,
    developer_id: project.developerId,
    location: project.location ?? project.address,
    project_location: project.location ?? project.address,
    price_start: project.priceStart,
    price_end: project.priceEnd,
    currency: project.currency ?? "AED",
    expected_completion_date: project.completionDate,
    completion_date: project.completionDate,
    banner_image: project.bannerImage,
    images: project.images,
    project_status: project.projectStatus,
    types: project.propertyTypes,
  };
}
