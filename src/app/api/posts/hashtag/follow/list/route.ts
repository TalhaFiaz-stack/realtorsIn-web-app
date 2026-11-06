import { fetchFollowedHashtags } from "@/features/hashtag/services/hashtag.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json().catch(() => ({}));
    const input = schema.parse(body);
    const page = await fetchFollowedHashtags(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
