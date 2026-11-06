import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import {
  fetchPropertyListingDetail,
  updatePropertyListingStatus,
} from "@/features/properties/services/properties.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

function parseListingRef(
  listingRowId: number,
  searchParams: URLSearchParams
) {
  return {
    listingRowId,
    type: searchParams.get("type")?.trim() || undefined,
    remPropertyId: normalizeRemPropertyId(searchParams.get("remPropertyId")),
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ listingRowId: string }> }
) {
  try {
    const { listingRowId: idRaw } = await context.params;
    const listingRowId = Number(idRaw);
    if (!Number.isFinite(listingRowId) || listingRowId <= 0) {
      return handleBffError(new Error("Invalid listing id"));
    }
    const { searchParams } = new URL(request.url);
    const ref = parseListingRef(listingRowId, searchParams);
    const body = (await request.json()) as { propertyStatusId?: number };
    const propertyStatusId = Number(body.propertyStatusId);
    if (!Number.isFinite(propertyStatusId)) {
      return handleBffError(new Error("propertyStatusId is required"));
    }

    await updatePropertyListingStatus({
      ...ref,
      propertyStatusId,
    });

    const listing = await fetchPropertyListingDetail(ref);
    return jsonOk({ ok: true, listing });
  } catch (error) {
    return handleBffError(error);
  }
}
