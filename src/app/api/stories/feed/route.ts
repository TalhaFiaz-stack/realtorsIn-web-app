import { fetchStoriesFeed } from "@/features/stories/services/stories.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const feed = await fetchStoriesFeed();
    return jsonOk({ ok: true, ...feed });
  } catch (error) {
    return handleBffError(error);
  }
}
