import { updateIntroFields } from "@/features/profile/services/profile-mutations.server";
import { editIntroSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = editIntroSchema.parse(await request.json());
    await updateIntroFields(body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
