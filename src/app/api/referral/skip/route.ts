import { skipReferralModal } from "@/features/referral/services/referral.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    await skipReferralModal();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
