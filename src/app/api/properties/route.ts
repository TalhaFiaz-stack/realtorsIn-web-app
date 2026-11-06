import { fetchMyPropertiesPage } from "@/features/properties/services/properties.server";
import type { PropertyHubTabId } from "@/features/properties/constants/property-hub.constants";
import { PROPERTY_HUB_TABS } from "@/features/properties/constants/property-hub.constants";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

const TAB_IDS = PROPERTY_HUB_TABS.map((t) => t.id);

function parseOptionalInt(raw: string | null): number | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabParam = searchParams.get("tab") ?? "buy";
    const tab = TAB_IDS.includes(tabParam as PropertyHubTabId)
      ? (tabParam as PropertyHubTabId)
      : "buy";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const availability = searchParams.get("availability");
    const statusRaw = searchParams.get("filterPropertyStatusId");

    const pageData = await fetchMyPropertiesPage(page, {
      tab,
      search: searchParams.get("search")?.trim() || undefined,
      sortBy: searchParams.get("sortBy")?.trim() || undefined,
      beds: searchParams.get("beds")?.trim() || undefined,
      baths: searchParams.get("baths")?.trim() || undefined,
      minPrice: searchParams.get("minPrice")?.trim() || undefined,
      maxPrice: searchParams.get("maxPrice")?.trim() || undefined,
      minArea: searchParams.get("minArea")?.trim() || undefined,
      maxArea: searchParams.get("maxArea")?.trim() || undefined,
      availability:
        availability === "ready" || availability === "offplan"
          ? availability
          : "all",
      propertyCategory:
        searchParams.get("propertyCategory")?.trim() || undefined,
      filterPropertyTypes:
        searchParams.get("filterPropertyTypes")?.trim() || undefined,
      filterPropertyStatusId:
        statusRaw != null && statusRaw !== ""
          ? Number(statusRaw)
          : undefined,
      locationLabel:
        searchParams.get("locationLabel")?.trim() || undefined,
      city: searchParams.get("city")?.trim() || undefined,
      neighbourhoodId: parseOptionalInt(searchParams.get("neighbourhoodId")),
      buildingId: parseOptionalInt(searchParams.get("buildingId")),
    });

    return jsonOk({ ok: true, ...pageData });
  } catch (error) {
    return handleBffError(error);
  }
}
