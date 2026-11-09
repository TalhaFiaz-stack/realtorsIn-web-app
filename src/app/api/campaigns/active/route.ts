import { fetchActiveCampaigns } from "@/features/campaigns/services/campaigns.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    return jsonOk({ ok: true, campaigns: await fetchActiveCampaigns() });
  } catch (error) {
    return handleBffError(error);
  }
}
