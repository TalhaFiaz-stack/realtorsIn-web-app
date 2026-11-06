import { storeRepost } from "@/features/feed/services/posts.server";
import { repostStoreSchema } from "@/features/feed/validators/feed.validators";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = repostStoreSchema.parse(await request.json());
    const result = await storeRepost(input);
    return jsonOk(
      { ok: true, id: result.id, message: result.message },
      { status: 201 }
    );
  } catch (error) {
    return handleBffError(error);
  }
}
