import { z } from "zod";
import { blockUserProfile } from "@/features/feed/services/posts.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const blockProfileSchema = z.object({
  profileId: z.coerce.number().int().positive(),
});

/** POST /api/profile/block { profileId } — block a member from their profile. */
export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { profileId } = blockProfileSchema.parse(await request.json());
    const message = await blockUserProfile({ blockedProfileId: profileId });
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
