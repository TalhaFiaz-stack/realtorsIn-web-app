"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPropertyHubFilterOptionsRequest } from "@/features/properties/services/property-hub-filters.client";
export function usePropertyHubFilterOptions() {
  return useQuery({
    queryKey: ["properties", "hub", "filter-options"],
    queryFn: ({ signal }) => fetchPropertyHubFilterOptionsRequest(signal),
    staleTime: 1000 * 60 * 30,
    select: (data) => data.options,
  });
}
