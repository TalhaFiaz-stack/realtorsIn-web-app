import { fetchPropertyHubFilterOptions } from "@/features/properties/services/property-hub-filters.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const options = await fetchPropertyHubFilterOptions();
    return jsonOk({ ok: true, options });
  } catch (error) {
    return handleBffError(error);
  }
}
