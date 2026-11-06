import { fetchWorkingOn } from "@/features/working-on/services/working-on.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const data = await fetchWorkingOn();
    return jsonOk({ ok: true, data });
  } catch (error) {
    return handleBffError(error);
  }
}
