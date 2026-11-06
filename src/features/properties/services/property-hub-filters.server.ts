import "server-only";

import {
  fallbackPropertyHubFilterOptions,
  mergePropertyHubFilterOptions,
} from "@/features/properties/lib/map-rem-filter-options";
import type { PropertyHubFilterOptions } from "@/features/properties/types/property-hub-filter.types";
import {
  isRemCrmSuccess,
  remCrmRequest,
} from "@/lib/api/rem-crm.server";

async function fetchRemList(path: string): Promise<unknown> {
  try {
    const payload = await remCrmRequest<unknown>({ path, method: "GET" });
    if (!isRemCrmSuccess(payload)) return null;
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data: unknown }).data;
    }
    return null;
  } catch {
    return null;
  }
}

/** Same REM endpoints as mobile (`Utils.js` / `useInitialApis.js`). */
export async function fetchPropertyHubFilterOptions(): Promise<PropertyHubFilterOptions> {
  const [propertyTypesRaw, statusesRaw] = await Promise.all([
    fetchRemList("property/property_types/list"),
    fetchRemList("property/statuses/list"),
  ]);

  if (propertyTypesRaw == null && statusesRaw == null) {
    return fallbackPropertyHubFilterOptions();
  }

  return mergePropertyHubFilterOptions({ propertyTypesRaw, statusesRaw });
}
