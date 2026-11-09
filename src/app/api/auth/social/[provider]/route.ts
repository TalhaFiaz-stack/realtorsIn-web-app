import { z } from "zod";
import { loginWithSocialProvider } from "@/features/auth/services/auth.server";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const bodySchema = z.object({
  credential: z.string().min(10).optional(),
  accessToken: z.string().min(10).optional(),
  next: z.string().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    await requireCsrf(request);
    const { provider } = await context.params;
    const body = bodySchema.parse(await request.json());

    const input =
      provider === "google" && body.credential
        ? ({ provider, credential: body.credential } as const)
        : provider === "facebook" && body.accessToken
          ? ({ provider, accessToken: body.accessToken } as const)
          : null;
    if (!input) {
      return jsonError("Unsupported sign-in request", 400, "VALIDATION");
    }

    const result = await loginWithSocialProvider(input, body.next);
    if (!result.ok) {
      return jsonError(result.message, 401, result.code);
    }
    return jsonOk({ ok: true, member: result.member, redirectTo: result.redirectTo });
  } catch (error) {
    return handleBffError(error);
  }
}
