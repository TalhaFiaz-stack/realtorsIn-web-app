import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import {
  fetchPropertyListingDetail,
  updatePropertyListingMultipart,
} from "@/features/properties/services/properties.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

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
    await requireCsrf(request);
    const { listingRowId: idRaw } = await context.params;
    const listingRowId = Number(idRaw);
    if (!Number.isFinite(listingRowId) || listingRowId <= 0) {
      return handleBffError(new Error("Invalid listing id"));
    }
    const { searchParams } = new URL(request.url);
    const ref = parseListingRef(listingRowId, searchParams);
    const incoming = await readFormData(request, UPLOAD_LIMITS.listing);
    const rowIdFromForm = Number(incoming.get("listing_row_id"));
    if (rowIdFromForm !== listingRowId) {
      incoming.set("listing_row_id", String(listingRowId));
    }

    await updatePropertyListingMultipart(incoming);
    const listing = await fetchPropertyListingDetail(ref);
    return jsonOk({ ok: true, listing });
  } catch (error) {
    return handleBffError(error);
  }
}
