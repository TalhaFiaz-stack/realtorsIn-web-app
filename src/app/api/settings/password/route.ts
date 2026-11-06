import { updateSocialPassword } from "@/features/settings/services/settings.server";
import { passwordUpdateSchema } from "@/features/settings/validators/settings.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = passwordUpdateSchema.parse(await request.json());
    const message = await updateSocialPassword(body.password);
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
