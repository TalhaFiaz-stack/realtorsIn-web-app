import { fetchReferralHistory } from "@/features/referral/services/referral.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const history = await fetchReferralHistory();
    return jsonOk({ ok: true, ...history });
  } catch (error) {
    return handleBffError(error);
  }
}
