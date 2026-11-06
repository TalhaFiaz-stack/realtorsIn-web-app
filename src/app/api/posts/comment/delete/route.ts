import { deleteComment } from "@/features/feed/services/posts.server";
import { commentDeleteSchema } from "@/features/feed/validators/feed.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = commentDeleteSchema.parse(await request.json());
    await deleteComment(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
