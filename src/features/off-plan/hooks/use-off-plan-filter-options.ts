"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchOffPlanDistrictsClient,
  fetchOffPlanFiltersMetaClient,
} from "@/features/off-plan/services/off-plan.client";
import { emptyOffPlanFilterMeta } from "@/features/off-plan/lib/map-off-plan-filter-meta";
import { offPlanCityOptions } from "@/features/off-plan/lib/off-plan-location-filters";
import { useMemo } from "react";
import type { OffPlanDistrict } from "@/features/off-plan/types/off-plan.types";

/** Stable empty list so the memo below does not recompute every render. */
const NO_DISTRICTS: OffPlanDistrict[] = [];

export function useOffPlanFilterOptions() {
  const metaQuery = useQuery({
    queryKey: ["off-plan", "filters"],
    queryFn: ({ signal }) => fetchOffPlanFiltersMetaClient(signal),
    staleTime: 60 * 60 * 1000,
  });

  const districtsQuery = useQuery({
    queryKey: ["off-plan", "districts"],
    queryFn: ({ signal }) => fetchOffPlanDistrictsClient(signal),
    staleTime: 60 * 60 * 1000,
  });

  const districts = districtsQuery.data?.districts ?? NO_DISTRICTS;
  const filters = useMemo(() => {
    const base = metaQuery.data?.filters ?? emptyOffPlanFilterMeta();
    return {
      ...base,
      cities: offPlanCityOptions(districts, base.cities),
    };
  }, [metaQuery.data?.filters, districts]);

  return {
    filters,
    districts,
    isLoading: metaQuery.isLoading || districtsQuery.isLoading,
    error: metaQuery.isError || districtsQuery.isError,
    refetch: () => {
      metaQuery.refetch();
      districtsQuery.refetch();
    },
  };
}
