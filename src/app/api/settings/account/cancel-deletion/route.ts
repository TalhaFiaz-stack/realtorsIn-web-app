import { cancelAccountDeletionRequest } from "@/features/settings/services/settings.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const message = await cancelAccountDeletionRequest();
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
