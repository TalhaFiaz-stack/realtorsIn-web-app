import { setPostPinned } from "@/features/feed/services/posts.server";
import { pinPostSchema } from "@/features/feed/validators/feed.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = pinPostSchema.parse(await request.json());
    await setPostPinned(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
