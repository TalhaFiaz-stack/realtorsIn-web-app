import type { PropertyHubFilterDraft } from "@/components/properties/property-hub-filters-dialog";

/** Counts active refine filters for Secondary/Rental browse (mobile Property Hub parity). */
export function countMarketListingActiveFilters(
  draft: PropertyHubFilterDraft
): number {
  let n = 0;
  if (draft.mainListingType && draft.mainListingType !== "all") n++;
  if (draft.distressDeal === "yes" || draft.distressDeal === "no") n++;
  if (draft.availability && draft.availability !== "all") n++;
  if (draft.filterPropertyStatusId != null) n++;
  if (draft.minPrice?.trim()) n++;
  if (draft.maxPrice?.trim()) n++;
  if (draft.minArea?.trim()) n++;
  if (draft.maxArea?.trim()) n++;
  if (draft.beds) n++;
  if (draft.baths) n++;
  if (draft.propertyCategory?.trim()) n++;
  if (draft.filterPropertyTypes?.trim()) n++;
  if (
    draft.locationLabel?.trim() ||
    draft.city?.trim() ||
    draft.neighbourhoodId != null ||
    draft.buildingId != null
  ) {
    n++;
  }
  return n;
}
