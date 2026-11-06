import { updateOpenTo } from "@/features/profile/services/profile-mutations.server";
import { openToSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = openToSchema.parse(await request.json());
    await updateOpenTo(body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
