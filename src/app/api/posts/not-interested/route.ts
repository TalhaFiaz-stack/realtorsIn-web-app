import { toggleNotInterested } from "@/features/feed/services/posts.server";
import { notInterestedSchema } from "@/features/feed/validators/feed.validators";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = notInterestedSchema.parse(await request.json());
    await toggleNotInterested(input);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
