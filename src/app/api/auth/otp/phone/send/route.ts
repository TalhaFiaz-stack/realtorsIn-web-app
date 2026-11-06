import { phoneSendOtpSchema } from "@/features/auth/validators/auth.validators";
import { sendPhoneOtp } from "@/features/auth/services/auth.server";
import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json();
    const input = phoneSendOtpSchema.parse(body);
    const result = await sendPhoneOtp(input);
    if (!result.ok) {
      return jsonError(result.message, 400, result.code);
    }
    return jsonOk({ ok: true, message: result.message });
  } catch (error) {
    return handleBffError(error);
  }
}
