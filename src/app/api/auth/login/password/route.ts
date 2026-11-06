import { passwordLoginSchema } from "@/features/auth/validators/auth.validators";
import { loginWithPassword } from "@/features/auth/services/auth.server";
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
    const input = passwordLoginSchema.parse(body);
    const next =
      typeof body.next === "string" ? (body.next as string) : undefined;
    const result = await loginWithPassword(input, next);
    if (!result.ok) {
      const status =
        result.code === "NETWORK" || result.code === "SERVER"
          ? 503
          : result.code === "VALIDATION"
            ? 400
            : 401;
      return jsonError(result.message, status, result.code);
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
