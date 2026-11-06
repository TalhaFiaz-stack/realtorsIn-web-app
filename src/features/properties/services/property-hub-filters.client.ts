import { bffRequest } from "@/lib/api/client";
import type { PropertyHubFilterOptions } from "@/features/properties/types/property-hub-filter.types";

export async function fetchPropertyHubFilterOptionsRequest(
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; options: PropertyHubFilterOptions }>({
    path: "properties/filter-options",
    method: "GET",
    signal,
  });
}
