import { dismissInfluencerFirstPopup } from "@/features/influencer/services/influencer.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    await dismissInfluencerFirstPopup();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
