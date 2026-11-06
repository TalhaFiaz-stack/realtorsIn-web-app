import { fetchSkillsCatalog } from "@/features/skills/services/skills.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const skills = await fetchSkillsCatalog();
    return jsonOk({ ok: true, skills });
  } catch (error) {
    return handleBffError(error);
  }
}
