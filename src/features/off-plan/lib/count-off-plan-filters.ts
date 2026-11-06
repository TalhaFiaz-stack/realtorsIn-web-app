import type { OffPlanFilterDraft } from "@/features/off-plan/services/off-plan.client";
import { EMPTY_PAYMENT_BREAKDOWN } from "@/features/off-plan/constants/off-plan-filters.constants";

export function countOffPlanActiveFilters(draft: OffPlanFilterDraft): number {
  let n = 0;
  if (draft.beds) n++;
  if (draft.minPrice && draft.minPrice !== "0") n++;
  if (draft.maxPrice && draft.maxPrice !== "0") n++;
  if (draft.minArea && draft.minArea !== "0" && draft.minArea !== "No min") n++;
  if (draft.maxArea && draft.maxArea !== "0" && draft.maxArea !== "No max") n++;
  if (draft.cityId) n++;
  if (draft.districtId) n++;
  if (draft.developerIds?.length) n++;
  if (draft.searchProjectIds?.length) n++;
  if (draft.searchText?.trim()) n++;
  if (draft.developmentStatus?.length) n++;
  if (draft.completionStatus?.length) n++;
  if (draft.propertyTypes?.length) n++;
  if (draft.completionDate && draft.completionDate !== "all") n++;
  if (draft.downPayment) n++;
  if (draft.postHandover) n++;
  if (draft.projectVisibility && draft.projectVisibility !== "all") n++;
  // Sort is controlled on the listings toolbar, not in More filters.
  const pb = draft.paymentBreakdown ?? EMPTY_PAYMENT_BREAKDOWN;
  if (Object.values(pb).some((v) => v && String(v).trim())) n++;
  return n;
}
