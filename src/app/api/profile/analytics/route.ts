import { fetchSocialAnalytics } from "@/features/profile/services/social-analytics.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    await request.json().catch(() => ({}));
    const analytics = await fetchSocialAnalytics();
    return jsonOk({ ok: true, analytics });
  } catch (error) {
    return handleBffError(error);
  }
}
