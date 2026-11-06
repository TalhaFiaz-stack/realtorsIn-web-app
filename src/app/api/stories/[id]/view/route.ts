import { markStoryViewed } from "@/features/stories/services/stories.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    const storyId = z.coerce.number().int().positive().parse(id);
    await markStoryViewed(storyId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
