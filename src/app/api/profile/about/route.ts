import { upsertAbout } from "@/features/profile/services/profile-mutations.server";
import { aboutUpdateSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = aboutUpdateSchema.parse(await request.json());
    await upsertAbout(body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
