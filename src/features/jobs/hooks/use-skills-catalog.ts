"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSkillsCatalogRequest } from "@/features/jobs/services/jobs.client";

export function useSkillsCatalog() {
  return useQuery({
    queryKey: ["skills", "catalog"],
    queryFn: ({ signal }) => fetchSkillsCatalogRequest(signal),
    select: (data) => data.skills,
    staleTime: 5 * 60_000,
  });
}
