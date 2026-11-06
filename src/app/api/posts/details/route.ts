import { postIdSchema } from "@/features/feed/validators/feed.validators";
import { fetchPostDetails } from "@/features/feed/services/posts.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json();
    const { postId } = postIdSchema.parse(body);
    const post = await fetchPostDetails(postId);
    return jsonOk({ ok: true, post });
  } catch (error) {
    return handleBffError(error);
  }
}
