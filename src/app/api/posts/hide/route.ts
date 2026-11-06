import { hidePost } from "@/features/feed/services/posts.server";
import { hidePostSchema } from "@/features/feed/validators/feed.validators";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = hidePostSchema.parse(await request.json());
    await hidePost(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
