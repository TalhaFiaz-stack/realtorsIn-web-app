import { updateCvTemplate } from "@/features/profile/services/profile-mutations.server";
import { cvTemplateSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = cvTemplateSchema.parse(await request.json());
    await updateCvTemplate(body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
