"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPropertiesPageRequest } from "@/features/properties/services/properties.client";
import type { PropertyHubListFilters } from "@/features/properties/types/property-hub.types";
import { ApiError } from "@/lib/api/errors";

export function propertyHubQueryKey(filters: PropertyHubListFilters) {
  return [
    "properties",
    "hub",
    filters.tab,
    filters.search ?? "",
    filters.sortBy ?? "newest",
    filters.beds ?? "",
    filters.baths ?? "",
    filters.minPrice ?? "",
    filters.maxPrice ?? "",
    filters.minArea ?? "",
    filters.maxArea ?? "",
    filters.availability ?? "all",
    filters.propertyCategory ?? "",
    filters.filterPropertyTypes ?? "",
    filters.filterPropertyStatusId ?? "",
    filters.city ?? "",
    filters.neighbourhoodId ?? "",
    filters.buildingId ?? "",
  ] as const;
}

export function propertiesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function usePropertyHubList(filters: PropertyHubListFilters) {
  return useInfiniteQuery({
    queryKey: propertyHubQueryKey(filters),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const res = await fetchPropertiesPageRequest(pageParam, filters, signal);
      return {
        listings: res.listings ?? [],
        page: res.page ?? pageParam,
        totalPages: res.totalPages ?? 1,
        total: res.total ?? 0,
      };
    },
    getNextPageParam: (last) => {
      if (!last.listings.length) return undefined;
      return last.page < last.totalPages ? last.page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      listings: data.pages.flatMap((p) => p.listings),
      total: data.pages[0]?.total ?? 0,
      loadedCount: data.pages.reduce((n, p) => n + p.listings.length, 0),
    }),
  });
}
