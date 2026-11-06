import { fetchReportReasons } from "@/features/feed/services/posts.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const reasons = await fetchReportReasons();
    return jsonOk({ ok: true, reasons });
  } catch (error) {
    return handleBffError(error);
  }
}
