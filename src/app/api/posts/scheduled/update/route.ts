import { updateScheduledPost } from "@/features/feed/services/scheduled-posts.server";
import { scheduledPostUpdateSchema } from "@/features/feed/validators/feed.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = scheduledPostUpdateSchema.parse(await request.json());
    const message = await updateScheduledPost({
      postId: input.postId,
      scheduledAt: input.scheduledAt,
    });
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
