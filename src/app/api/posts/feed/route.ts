import { feedListSchema } from "@/features/feed/validators/feed.validators";
import { fetchFeedPage } from "@/features/feed/services/posts.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json().catch(() => ({}));
    const input = feedListSchema.parse(body);
    const page = await fetchFeedPage(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
