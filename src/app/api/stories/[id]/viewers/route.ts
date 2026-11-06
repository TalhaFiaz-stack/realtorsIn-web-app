import { fetchStoryViewers } from "@/features/stories/services/stories.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { z } from "zod";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const storyId = z.coerce.number().int().positive().parse(id);
    const { searchParams } = new URL(request.url);
    const page = z.coerce.number().int().min(1).catch(1).parse(
      searchParams.get("page") ?? 1
    );
    const data = await fetchStoryViewers(storyId, page);
    return jsonOk({ ok: true, ...data });
  } catch (error) {
    return handleBffError(error);
  }
}
