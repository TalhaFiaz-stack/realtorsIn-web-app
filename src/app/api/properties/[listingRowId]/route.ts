import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import { fetchPropertyListingDetail } from "@/features/properties/services/properties.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(
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
    const listing = await fetchPropertyListingDetail({
      listingRowId,
      type: searchParams.get("type")?.trim() || undefined,
      remPropertyId: normalizeRemPropertyId(
        searchParams.get("remPropertyId")
      ),
    });
    return jsonOk({ ok: true, listing });
  } catch (error) {
    return handleBffError(error);
  }
}
