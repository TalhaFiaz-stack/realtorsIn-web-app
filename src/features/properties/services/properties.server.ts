import "server-only";

import {
  mapPropertiesListPage,
  mapPropertyDetail,
  mapPropertyMatches,
} from "@/features/properties/lib/map-social-property";
import type {
  PropertiesListPage,
  PropertyHubListFilters,
  PropertyListing,
  PropertyMatchResult,
} from "@/features/properties/types/property-hub.types";
import {
  PROPERTY_HUB_PAGE_SIZE,
  SOCIAL_BROWSE_ACTIVE_STATUS_ID,
} from "@/features/properties/constants/property-hub.constants";
import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import { buildSocialPropertyAgentContact } from "@/features/properties/lib/build-social-property-agent-contact";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function assertSuccess(payload: unknown, fallback: string) {
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
}

function buildListBody(
  page: number,
  filters: PropertyHubListFilters
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    page,
    limit: PROPERTY_HUB_PAGE_SIZE,
    own_listings: true,
    type: filters.tab,
  };

  if (filters.search?.trim()) {
    body.search_text = filters.search.trim();
  }
  if (filters.sortBy && filters.sortBy !== "newest") {
    body.sortBy = filters.sortBy;
  }
  if (filters.beds) body.beds = filters.beds;
  if (filters.baths) body.baths = filters.baths;
  if (filters.minPrice && filters.minPrice !== "0") {
    body.min_price = filters.minPrice;
  }
  if (filters.maxPrice) body.max_price = filters.maxPrice;
  if (filters.minArea && filters.minArea !== "0") {
    body.min_area = filters.minArea;
  }
  if (filters.maxArea && filters.maxArea !== "0") {
    body.max_area = filters.maxArea;
  }
  if (filters.propertyCategory) {
    body.property_category = filters.propertyCategory;
  }
  if (filters.filterPropertyTypes) {
    body.filter_property_types = filters.filterPropertyTypes;
  }
  if (filters.filterPropertyStatusId != null) {
    body.filter_property_status_id = filters.filterPropertyStatusId;
  }
  if (filters.availability === "ready") {
    body.availability = 1;
  } else if (filters.availability === "offplan") {
    body.availability = 0;
  }
  if (filters.city?.trim()) {
    body.city = filters.city.trim();
  }
  if (filters.neighbourhoodId != null) {
    body.neighbourhood_id = filters.neighbourhoodId;
  }
  if (filters.buildingId != null) {
    body.building_id = filters.buildingId;
  }

  return body;
}

export type BrowseSocialListingsFilters = {
  searchText?: string;
  sortBy?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  beds?: string;
  baths?: string;
  availability?: "all" | "ready" | "offplan";
  mainListingType?: "all" | "buy" | "sell" | "rent_in" | "rent_out";
  distressDeal?: "" | "yes" | "no";
  propertyCategory?: string;
  filterPropertyTypes?: string;
  city?: string;
  community?: string;
  subCommunity?: string;
  neighbourhoodId?: number;
  buildingId?: number;
};

function socialBrowseRequestType(
  mode: "secondary" | "rental",
  mainListingType: BrowseSocialListingsFilters["mainListingType"]
): string {
  const main = mainListingType && mainListingType !== "all" ? mainListingType : null;
  if (!main) return mode;
  if (mode === "secondary" && (main === "buy" || main === "sell")) {
    return main;
  }
  if (mode === "rental" && (main === "rent_in" || main === "rent_out")) {
    return main;
  }
  return mode;
}

/** Listings tab Secondary/Rental — same as mobile RealtorsIn (`fetchSocialProperties`). */
export async function fetchBrowseSocialListingsPage(
  input: {
    page: number;
    mode: "secondary" | "rental";
  } & BrowseSocialListingsFilters
): Promise<PropertiesListPage> {
  const body: Record<string, unknown> = {
    page: input.page,
    limit: PROPERTY_HUB_PAGE_SIZE,
    type: socialBrowseRequestType(input.mode, input.mainListingType),
    filter_property_status_id: SOCIAL_BROWSE_ACTIVE_STATUS_ID,
  };
  if (input.searchText?.trim()) {
    body.search_text = input.searchText.trim();
  }
  if (input.sortBy && input.sortBy !== "newest") {
    body.sortBy = input.sortBy;
  }
  if (input.beds) body.beds = input.beds;
  if (input.baths) body.baths = input.baths;
  if (input.minPrice && input.minPrice !== "0") {
    body.min_price = input.minPrice;
  }
  if (input.maxPrice && input.maxPrice !== "0") {
    body.max_price = input.maxPrice;
  }
  if (input.minArea && input.minArea !== "0") {
    body.min_area = input.minArea;
  }
  if (input.maxArea && input.maxArea !== "0") {
    body.max_area = input.maxArea;
  }
  if (input.propertyCategory) {
    body.property_category = input.propertyCategory;
  }
  if (input.filterPropertyTypes) {
    body.filter_property_types = input.filterPropertyTypes;
  }
  if (input.availability === "ready") {
    body.availability = 1;
  } else if (input.availability === "offplan") {
    body.availability = 0;
  }
  if (input.city?.trim()) {
    body.city = input.city.trim();
  }
  if (input.community?.trim()) {
    body.community = input.community.trim();
  }
  if (input.subCommunity?.trim()) {
    body.sub_community = input.subCommunity.trim();
  }
  if (input.neighbourhoodId != null) {
    body.neighbourhood_id = input.neighbourhoodId;
  }
  if (input.buildingId != null) {
    body.building_id = input.buildingId;
  }
  if (input.distressDeal === "yes" || input.distressDeal === "no") {
    body.distress_deal = input.distressDeal;
  }

  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/properties",
    method: "POST",
    auth: true,
    data: body,
  });
  assertSuccess(payload, "Unable to load listings");
  return mapPropertiesListPage(payload);
}

export async function fetchMyPropertiesPage(
  page: number,
  filters: PropertyHubListFilters
): Promise<PropertiesListPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/properties",
    method: "POST",
    auth: true,
    data: buildListBody(page, filters),
  });
  assertSuccess(payload, "Unable to load properties");
  return mapPropertiesListPage(payload);
}

export async function fetchPropertyListingDetail(input: {
  listingRowId: number;
  type?: string;
  remPropertyId?: number | null;
}): Promise<PropertyListing> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/property/details",
    method: "POST",
    auth: true,
    data: {
      ...listingIdentityBody(input),
    },
  });
  assertSuccess(payload, "Unable to load property");
  const mapped = mapPropertyDetail(payload);
  if (!mapped) {
    throw new ApiError("SERVER", "Invalid property response", 502);
  }
  return mapped;
}

function listingIdentityBody(input: {
  listingRowId: number;
  type?: string;
  remPropertyId?: number | null;
}) {
  const remId = normalizeRemPropertyId(input.remPropertyId);
  return {
    listing_row_id: input.listingRowId,
    id: input.listingRowId,
    ...(remId != null ? { rem_property_id: remId } : {}),
    ...(input.type ? { type: input.type } : {}),
  };
}

export async function updatePropertyListingStatus(input: {
  listingRowId: number;
  propertyStatusId: number;
  type?: string;
  remPropertyId?: number | null;
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/property/status",
    method: "POST",
    auth: true,
    data: {
      ...listingIdentityBody(input),
      property_status_id: input.propertyStatusId,
    },
  });
  assertSuccess(payload, "Unable to update status");
}

export async function deletePropertyListing(input: {
  listingRowId: number;
  type?: string;
  remPropertyId?: number | null;
}): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/property/delete",
    method: "POST",
    auth: true,
    data: listingIdentityBody(input),
  });
  assertSuccess(payload, "Unable to delete listing");
}

/** Update own listing fields (mobile `updateSocialPropertyListing`). */
export async function updatePropertyListingMultipart(form: FormData): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/property/update",
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
  });
  assertSuccess(payload, "Unable to update listing");
}

/** Opposite-type active listings (mobile `fetchSocialPropertyMatches`). */
export async function fetchPropertyListingMatches(input: {
  listingRowId: number;
  type?: string;
  remPropertyId?: number | null;
}): Promise<PropertyMatchResult[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/property/match",
    method: "POST",
    auth: true,
    data: listingIdentityBody(input),
  });
  assertSuccess(payload, "Unable to load matches");
  return mapPropertyMatches(payload);
}

/** Agent contact for a match row (native RealtorsIn listings — same as mobile buildRealtorsInAgentDetail). */
export async function fetchPropertyAgentContact(input: {
  listingRowId: number;
  type?: string;
  remPropertyId?: number | null;
}) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/property/details",
    method: "POST",
    auth: true,
    data: listingIdentityBody(input),
  });
  assertSuccess(payload, "Unable to load property");
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) {
    throw new ApiError("SERVER", "Invalid property response", 502);
  }
  return buildSocialPropertyAgentContact(data);
}
