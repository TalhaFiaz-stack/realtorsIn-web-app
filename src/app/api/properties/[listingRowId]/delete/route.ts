import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import { deletePropertyListing } from "@/features/properties/services/properties.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

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
    await deletePropertyListing({
      listingRowId,
      type: searchParams.get("type")?.trim() || undefined,
      remPropertyId: normalizeRemPropertyId(
        searchParams.get("remPropertyId")
      ),
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
