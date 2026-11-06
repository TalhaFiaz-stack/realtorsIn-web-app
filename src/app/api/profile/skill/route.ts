import {
  deleteSkill,
  upsertSkill,
} from "@/features/profile/services/profile-mutations.server";
import {
  sectionDeleteSchema,
  skillUpsertSchema,
} from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const json = await request.json();
    if (json?.action === "delete") {
      const body = sectionDeleteSchema.parse(json);
      await deleteSkill(body.id);
      return jsonOk({ ok: true });
    }
    const body = skillUpsertSchema.parse(json);
    await upsertSkill(body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
