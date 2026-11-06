import { fetchOwnSocialProfile } from "@/features/profile/services/profile.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const profile = await fetchOwnSocialProfile();
    return jsonOk({ ok: true, profile });
  } catch (error) {
    return handleBffError(error);
  }
}
