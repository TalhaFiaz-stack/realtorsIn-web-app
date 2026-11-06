import { reactToStory } from "@/features/stories/services/stories.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  reaction: z.string().trim().min(1).max(40).default("heart"),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    const storyId = z.coerce.number().int().positive().parse(id);
    const body = schema.parse(await request.json().catch(() => ({})));
    const result = await reactToStory(storyId, body.reaction);
    return jsonOk({ ok: true, reacted: result.reacted });
  } catch (error) {
    return handleBffError(error);
  }
}
