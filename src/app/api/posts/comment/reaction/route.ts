import { commentReactionSchema } from "@/features/feed/validators/feed.validators";
import { toggleCommentReaction } from "@/features/feed/services/posts.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json();
    const input = commentReactionSchema.parse(body);
    const result = await toggleCommentReaction(input);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
