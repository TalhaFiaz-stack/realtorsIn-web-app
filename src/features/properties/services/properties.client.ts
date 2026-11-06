import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import { bffRequest } from "@/lib/api/client";
import type {
  PropertiesListPage,
  PropertyHubListFilters,
  PropertyListing,
} from "@/features/properties/types/property-hub.types";

export async function fetchPropertiesPageRequest(
  page: number,
  filters: PropertyHubListFilters,
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("tab", filters.tab);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.beds) params.set("beds", filters.beds);
  if (filters.baths) params.set("baths", filters.baths);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.minArea) params.set("minArea", filters.minArea);
  if (filters.maxArea) params.set("maxArea", filters.maxArea);
  if (filters.availability && filters.availability !== "all") {
    params.set("availability", filters.availability);
  }
  if (filters.propertyCategory) {
    params.set("propertyCategory", filters.propertyCategory);
  }
  if (filters.filterPropertyTypes) {
    params.set("filterPropertyTypes", filters.filterPropertyTypes);
  }
  if (filters.filterPropertyStatusId != null) {
    params.set(
      "filterPropertyStatusId",
      String(filters.filterPropertyStatusId)
    );
  }
  if (filters.locationLabel) params.set("locationLabel", filters.locationLabel);
  if (filters.city) params.set("city", filters.city);
  if (filters.neighbourhoodId != null) {
    params.set("neighbourhoodId", String(filters.neighbourhoodId));
  }
  if (filters.buildingId != null) {
    params.set("buildingId", String(filters.buildingId));
  }

  return bffRequest<{ ok: true } & PropertiesListPage>({
    path: `properties?${params.toString()}`,
    method: "GET",
    signal,
  });
}

export async function fetchPropertyDetailRequest(
  listingRowId: number,
  options: { type?: string; remPropertyId?: number | null } = {},
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  if (options.type) params.set("type", options.type);
  const remId = normalizeRemPropertyId(options.remPropertyId);
  if (remId != null) {
    params.set("remPropertyId", String(remId));
  }
  const qs = params.toString();
  return bffRequest<{ ok: true; listing: PropertyListing }>({
    path: `properties/${listingRowId}${qs ? `?${qs}` : ""}`,
    method: "GET",
    signal,
  });
}
