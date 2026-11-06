import { deleteAccountPermanently } from "@/features/settings/services/settings.server";
import { accountDeleteSchema } from "@/features/settings/validators/settings.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = accountDeleteSchema.parse(await request.json());
    const message = await deleteAccountPermanently(body.confirmation);
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
