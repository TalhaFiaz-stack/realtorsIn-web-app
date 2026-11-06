import { markReferralModalShown } from "@/features/referral/services/referral.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    await markReferralModalShown();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
