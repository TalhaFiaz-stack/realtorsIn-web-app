import { unfollowHashtag } from "@/features/hashtag/services/hashtag.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  hashtagId: z.coerce.number().int().positive().optional(),
  hashtag: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    if (!input.hashtagId && !input.hashtag) {
      throw new Error("Hashtag required");
    }
    const message = await unfollowHashtag({
      hashtagId: input.hashtagId,
      hashtag: input.hashtag,
    });
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
