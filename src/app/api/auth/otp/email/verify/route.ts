import { emailVerifyOtpSchema } from "@/features/auth/validators/auth.validators";
import { verifyEmailOtp } from "@/features/auth/services/auth.server";
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
    const input = emailVerifyOtpSchema.parse(body);
    const next =
      typeof body.next === "string" ? (body.next as string) : undefined;
    const result = await verifyEmailOtp(input, next);
    if (!result.ok) {
      return jsonError(result.message, 401, result.code);
    }
    return jsonOk({
      ok: true,
      member: result.member,
      redirectTo: result.redirectTo,
    });
  } catch (error) {
    return handleBffError(error);
  }
}
