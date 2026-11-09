import { fetchPropertyAgentContact } from "@/features/properties/services/properties.server";
import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = (await request.json()) as {
      listingRowId?: number;
      type?: string;
      remPropertyId?: number | string | null;
    };
    const listingRowId = Number(body.listingRowId);
    if (!Number.isFinite(listingRowId) || listingRowId <= 0) {
      return handleBffError(new Error("Invalid listing id"));
    }
    const contact = await fetchPropertyAgentContact({
      listingRowId,
      type: typeof body.type === "string" ? body.type.trim() : undefined,
      remPropertyId: normalizeRemPropertyId(body.remPropertyId),
    });
    return jsonOk({ ok: true, contact });
  } catch (error) {
    return handleBffError(error);
  }
}
