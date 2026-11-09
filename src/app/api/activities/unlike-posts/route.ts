import { unlikeActivityPosts } from "@/features/activities/services/activities.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  postIds: z.array(z.number().int().positive()).min(1),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = schema.parse(await request.json());
    await unlikeActivityPosts(body.postIds);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
