"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchOffPlanProjectsClient,
  fetchPublishedListingsClient,
  type MarketListingMode,
} from "@/features/off-plan/services/off-plan.client";
import type { OffPlanListFilters } from "@/features/off-plan/types/off-plan.types";

export function useOffPlanProjects(
  filters: Omit<OffPlanListFilters, "page">,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["off-plan", "projects", filters],
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchOffPlanProjectsClient({ ...filters, page: pageParam }, signal),
    getNextPageParam: (last) =>
      last.hasMore ? last.currentPage + 1 : undefined,
  });
}

export function usePublishedListings(
  input: {
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
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ["market", "listings", input],
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchPublishedListingsClient({ ...input, page: pageParam }, signal),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}
