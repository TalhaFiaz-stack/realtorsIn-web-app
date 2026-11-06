import { fetchPublishedPropertyDetail } from "@/features/off-plan/services/published-listings.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: raw } = await context.params;
    const id = Number(raw);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.trim() || "sale";
    if (!Number.isFinite(id) || id <= 0) {
      return handleBffError(new Error("Invalid property id"));
    }
    const property = await fetchPublishedPropertyDetail({ id, type });
    return jsonOk({ ok: true, property });
  } catch (error) {
    return handleBffError(error);
  }
}
