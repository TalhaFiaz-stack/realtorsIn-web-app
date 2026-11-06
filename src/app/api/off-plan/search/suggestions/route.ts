import { fetchOffPlanSearchSuggestions } from "@/features/off-plan/services/off-plan-search.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") ?? "";
    const sections = await fetchOffPlanSearchSuggestions(text);
    return jsonOk({ ok: true, sections });
  } catch (error) {
    return handleBffError(error);
  }
}
