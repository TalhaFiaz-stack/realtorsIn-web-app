import { fetchInfluencerStatus } from "@/features/influencer/services/influencer.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const status = await fetchInfluencerStatus();
    return jsonOk({ ok: true, status });
  } catch (error) {
    return handleBffError(error);
  }
}
