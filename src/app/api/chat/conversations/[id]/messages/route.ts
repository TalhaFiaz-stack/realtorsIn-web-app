import { listMessages } from "@/features/chat/services/chat.server";
import { getValidatedSession } from "@/features/auth/services/auth.server";
import { handleBffError, jsonError, jsonOk } from "@/lib/auth/bff";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    const conversationId = Number(id);
    if (!Number.isFinite(conversationId) || conversationId <= 0) {
      return jsonError("Valid conversation id required", 400, "VALIDATION");
    }
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const before = url.searchParams.get("beforeMessageId");
    const session = await getValidatedSession();
    const currentUserId = session.member?.socialProfileId ?? null;
    const result = await listMessages({
      conversationId,
      page: Number.isFinite(page) ? page : 1,
      beforeMessageId: before ? Number(before) : undefined,
      currentUserId,
    });
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
