import { deleteRepost } from "@/features/feed/services/posts.server";
import { postIdSchema } from "@/features/feed/validators/feed.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { postId } = postIdSchema.parse(await request.json());
    const result = await deleteRepost(postId);
    return jsonOk({ ok: true, message: result.message });
  } catch (error) {
    return handleBffError(error);
  }
}
