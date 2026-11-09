import type {
  OffPlanUnitDetail,
  UnitDocumentKind,
  UnitDocumentOptions,
} from "@/features/off-plan/lib/off-plan-unit";
import { bffRequest } from "@/lib/api/client";
import type { OffPlanFeedSection } from "@/features/off-plan/lib/off-plan-feed-sections";
import type { OffPlanSearchSections } from "@/features/off-plan/types/off-plan-search.types";
import type {
  OffPlanDistrict,
  OffPlanFilterMeta,
  OffPlanInventoryUnit,
  OffPlanListFilters,
  OffPlanProjectDetail,
  OffPlanProjectSummary,
  OffPlanProjectsPage,
  PublishedListingsPage,
  PublishedPropertyDetail,
  RemAgentContact,
} from "@/features/off-plan/types/off-plan.types";

export type OffPlanFilterDraft = Omit<
  OffPlanListFilters,
  "page" | "perPageAll"
>;

export async function fetchOffPlanProjectsClient(
  filters: OffPlanListFilters,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true } & OffPlanProjectsPage>({
    path: "off-plan/projects",
    method: "POST",
    data: filters,
    signal,
  });
}

export async function fetchOffPlanProjectDetailClient(
  projectId: string,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; project: OffPlanProjectDetail }>({
    path: `off-plan/projects/${encodeURIComponent(projectId)}`,
    method: "GET",
    signal,
  });
}

export async function fetchOffPlanDistrictsClient(signal?: AbortSignal) {
  return bffRequest<{ ok: true; districts: OffPlanDistrict[] }>({
    path: "off-plan/districts",
    method: "GET",
    signal,
  });
}

export async function fetchOffPlanFiltersMetaClient(signal?: AbortSignal) {
  return bffRequest<{ ok: true; filters: OffPlanFilterMeta }>({
    path: "off-plan/filters",
    method: "GET",
    signal,
  });
}

export async function fetchOffPlanMapProjectsClient(
  filters: OffPlanFilterDraft,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; projects: OffPlanProjectSummary[] }>({
    path: "off-plan/map-projects",
    method: "POST",
    data: filters,
    signal,
  });
}

export async function fetchOffPlanPopularSearchClient(signal?: AbortSignal) {
  return bffRequest<{ ok: true; sections: OffPlanSearchSections }>({
    path: "off-plan/search/popular",
    method: "GET",
    signal,
  });
}

export async function fetchOffPlanSearchSuggestionsClient(
  text: string,
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  params.set("text", text);
  return bffRequest<{ ok: true; sections: OffPlanSearchSections }>({
    path: `off-plan/search/suggestions?${params.toString()}`,
    method: "GET",
    signal,
  });
}

export async function fetchOffPlanInventoryClient(
  projectId: string,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; units: OffPlanInventoryUnit[] }>({
    path: `off-plan/inventory/${encodeURIComponent(projectId)}`,
    method: "GET",
    signal,
  });
}

export type MarketListingMode = "secondary" | "rental";

export async function fetchPublishedListingsClient(
  input: {
    page: number;
    mode: MarketListingMode;
    searchText?: string;
    sortBy?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    maxArea?: string;
    beds?: string;
    baths?: string;
    availability?: "ready" | "offplan";
    mainListingType?: "buy" | "sell" | "rent_in" | "rent_out";
    distressDeal?: "yes" | "no";
    propertyCategory?: string;
    filterPropertyTypes?: string;
    city?: string;
    community?: string;
    subCommunity?: string;
    neighbourhoodId?: number;
    buildingId?: number;
  },
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  params.set("page", String(input.page));
  params.set("mode", input.mode);
  if (input.searchText) params.set("search", input.searchText);
  if (input.sortBy) params.set("sortBy", input.sortBy);
  if (input.minPrice) params.set("minPrice", input.minPrice);
  if (input.maxPrice) params.set("maxPrice", input.maxPrice);
  if (input.minArea) params.set("minArea", input.minArea);
  if (input.maxArea) params.set("maxArea", input.maxArea);
  if (input.beds) params.set("beds", input.beds);
  if (input.baths) params.set("baths", input.baths);
  if (input.availability) params.set("availability", input.availability);
  if (input.mainListingType) params.set("mainListingType", input.mainListingType);
  if (input.distressDeal) params.set("distressDeal", input.distressDeal);
  if (input.propertyCategory) params.set("propertyCategory", input.propertyCategory);
  if (input.filterPropertyTypes)
    params.set("filterPropertyTypes", input.filterPropertyTypes);
  if (input.city) params.set("city", input.city);
  if (input.community) params.set("community", input.community);
  if (input.subCommunity) params.set("subCommunity", input.subCommunity);
  if (input.neighbourhoodId != null) {
    params.set("neighbourhoodId", String(input.neighbourhoodId));
  }
  if (input.buildingId != null) {
    params.set("buildingId", String(input.buildingId));
  }
  return bffRequest<{ ok: true } & PublishedListingsPage>({
    path: `market/listings?${params.toString()}`,
    method: "GET",
    signal,
  });
}

export async function fetchPublishedPropertyDetailClient(
  id: number,
  type: string,
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  params.set("type", type);
  return bffRequest<{ ok: true; property: PublishedPropertyDetail }>({
    path: `market/listings/${id}?${params.toString()}`,
    method: "GET",
    signal,
  });
}

export async function fetchRemAgentContactClient(input: {
  propertyId: number;
  type: string;
}) {
  return bffRequest<{ ok: true; contact: RemAgentContact }>({
    path: "market/contact-agent",
    method: "POST",
    data: input,
  });
}

export async function fetchOffPlanUnitDetailClient(unitId: string, signal?: AbortSignal) {
  return bffRequest<{ ok: true; unit: OffPlanUnitDetail }>({
    path: `off-plan/unit/${encodeURIComponent(unitId)}`,
    method: "GET",
    signal,
  });
}

/** Generate a unit presentation / quotation PDF; resolves to the file URL. */
export async function requestOffPlanUnitDocumentClient(
  input: { kind: UnitDocumentKind; projectId: string; unitId: string } & UnitDocumentOptions
) {
  return bffRequest<{ ok: true; url: string }>({
    path: "off-plan/unit-document",
    method: "POST",
    data: input,
  });
}

export type OffPlanPresentationContext = {
  encryptId: string;
  remOfferApiBase: string;
  defaultCurrency: string;
};

export async function fetchOffPlanPresentationContextClient(signal?: AbortSignal) {
  return bffRequest<{ ok: true; context: OffPlanPresentationContext }>({
    path: "off-plan/presentation/context",
    method: "GET",
    signal,
  });
}

export async function requestOffPlanProjectPdfClient(input: {
  projectId: string;
  currency: string;
  language: string;
  theme: "light" | "dark";
  design: "v1" | "v2";
  area: "sqft" | "sqm";
  toggles: { value: string; isOn: boolean }[];
  paymentPlanIds: string[];
  hasPaymentPlans: boolean;
}) {
  return bffRequest<{ ok: true; url: string }>({
    path: "off-plan/project-pdf",
    method: "POST",
    data: input,
  });
}

export async function shareOffPlanProjectPostClient(input: {
  projectId: string;
  description?: string;
  visibility?: "public" | "connections";
  scheduledAt?: string;
  mentionedUserIds?: number[];
  mentionedUsers?: Array<{ user_id: number; display_name: string; user_name: string }>;
}) {
  return bffRequest<{ ok: true; id: number }>({
    path: "off-plan/share-post",
    method: "POST",
    data: input,
  });
}

export async function fetchOffPlanFeedSectionsClient(
  coords: { lat: number; lng: number } | null,
  signal?: AbortSignal
) {
  const qs = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
  return bffRequest<{ ok: true; sections: OffPlanFeedSection[] }>({
    path: `off-plan/top${qs}`,
    method: "GET",
    signal,
  });
}
