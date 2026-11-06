import { fetchAccountDeletionPreview } from "@/features/settings/services/settings.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const preview = await fetchAccountDeletionPreview();
    return jsonOk({ ok: true, preview });
  } catch (error) {
    return handleBffError(error);
  }
}
