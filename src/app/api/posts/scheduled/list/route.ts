import { fetchScheduledPosts } from "@/features/feed/services/scheduled-posts.server";
import { scheduledPostsListSchema } from "@/features/feed/validators/feed.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json().catch(() => ({}));
    const input = scheduledPostsListSchema.parse(body);
    const page = await fetchScheduledPosts(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
