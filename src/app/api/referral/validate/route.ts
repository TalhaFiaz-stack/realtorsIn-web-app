import { validateReferralCode } from "@/features/referral/services/referral.server";
import { referralValidateSchema } from "@/features/referral/validators/referral.validators";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { ref } = referralValidateSchema.parse({
      ref: url.searchParams.get("ref") ?? "",
    });
    const result = await validateReferralCode(ref);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
