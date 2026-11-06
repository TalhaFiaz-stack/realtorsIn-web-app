import { fetchActivitySummary } from "@/features/activities/services/activities.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const summary = await fetchActivitySummary();
    return jsonOk({ ok: true, summary });
  } catch (error) {
    return handleBffError(error);
  }
}
