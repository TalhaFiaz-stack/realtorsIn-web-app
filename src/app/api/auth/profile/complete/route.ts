import { completeProfileSchema } from "@/features/auth/validators/auth.validators";
import {
  completeMemberProfile,
  getValidatedSession,
} from "@/features/auth/services/auth.server";
import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const session = await getValidatedSession();
    if (!session.authenticated || !session.member) {
      return jsonError("Session required", 401, "SESSION_EXPIRED");
    }
    if (session.member.isInactive) {
      return jsonError("Account is inactive", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const input = completeProfileSchema.parse({
      ...body,
      password: body.password || undefined,
    });

    const result = await completeMemberProfile(input, session.member);
    if (!result.ok) {
      return jsonError(result.message, 400, result.code);
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
