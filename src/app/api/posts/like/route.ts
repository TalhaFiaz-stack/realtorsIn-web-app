import { togglePostLike } from "@/features/feed/services/posts.server";
import { postLikeSchema } from "@/features/feed/validators/feed.validators";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = postLikeSchema.parse(await request.json());
    const result = await togglePostLike(body.postId, {
      reactionType: body.isTapToggle
        ? null
        : (body.reactionType ?? null),
    });
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
