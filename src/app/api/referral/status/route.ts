import { fetchReferralStatus } from "@/features/referral/services/referral.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const status = await fetchReferralStatus();
    return jsonOk({ ok: true, status });
  } catch (error) {
    return handleBffError(error);
  }
}
