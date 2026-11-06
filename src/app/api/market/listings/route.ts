import { fetchPublishedListingsPage } from "@/features/off-plan/services/published-listings.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get("mode") ?? "secondary";
    const mode = modeParam === "rental" ? "rental" : "secondary";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const neighbourhoodIdRaw = searchParams.get("neighbourhoodId");
    const buildingIdRaw = searchParams.get("buildingId");
    const neighbourhoodId =
      neighbourhoodIdRaw != null && neighbourhoodIdRaw !== ""
        ? Number(neighbourhoodIdRaw)
        : undefined;
    const buildingId =
      buildingIdRaw != null && buildingIdRaw !== ""
        ? Number(buildingIdRaw)
        : undefined;

    const availabilityRaw = searchParams.get("availability")?.trim();
    const availability =
      availabilityRaw === "ready" || availabilityRaw === "offplan"
        ? availabilityRaw
        : undefined;

    const mainListingTypeRaw = searchParams.get("mainListingType")?.trim();
    const mainListingType =
      mainListingTypeRaw === "buy" ||
      mainListingTypeRaw === "sell" ||
      mainListingTypeRaw === "rent_in" ||
      mainListingTypeRaw === "rent_out"
        ? mainListingTypeRaw
        : undefined;

    const distressDealRaw = searchParams.get("distressDeal")?.trim();
    const distressDeal =
      distressDealRaw === "yes" || distressDealRaw === "no"
        ? distressDealRaw
        : undefined;

    const pageData = await fetchPublishedListingsPage({
      page,
      mode,
      searchText: searchParams.get("search")?.trim() || undefined,
      sortBy: searchParams.get("sortBy")?.trim() || undefined,
      minPrice: searchParams.get("minPrice")?.trim() || undefined,
      maxPrice: searchParams.get("maxPrice")?.trim() || undefined,
      minArea: searchParams.get("minArea")?.trim() || undefined,
      maxArea: searchParams.get("maxArea")?.trim() || undefined,
      beds: searchParams.get("beds")?.trim() || undefined,
      baths: searchParams.get("baths")?.trim() || undefined,
      availability,
      mainListingType,
      distressDeal,
      propertyCategory: searchParams.get("propertyCategory")?.trim() || undefined,
      filterPropertyTypes:
        searchParams.get("filterPropertyTypes")?.trim() || undefined,
      city: searchParams.get("city")?.trim() || undefined,
      community: searchParams.get("community")?.trim() || undefined,
      subCommunity: searchParams.get("subCommunity")?.trim() || undefined,
      neighbourhoodId:
        neighbourhoodId != null && Number.isFinite(neighbourhoodId)
          ? neighbourhoodId
          : undefined,
      buildingId:
        buildingId != null && Number.isFinite(buildingId) ? buildingId : undefined,
    });
    return jsonOk({ ok: true, ...pageData });
  } catch (error) {
    return handleBffError(error);
  }
}
