import { reportPostSchema } from "@/features/feed/validators/feed.validators";
import { reportPost } from "@/features/feed/services/posts.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json();
    const input = reportPostSchema.parse(body);
    await reportPost(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
