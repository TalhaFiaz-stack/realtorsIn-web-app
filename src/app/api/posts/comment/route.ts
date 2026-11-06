import { commentCreateSchema } from "@/features/feed/validators/feed.validators";
import { createPostComment } from "@/features/feed/services/posts.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json();
    const input = commentCreateSchema.parse(body);
    const comment = await createPostComment(input);
    return jsonOk({ ok: true, comment }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
