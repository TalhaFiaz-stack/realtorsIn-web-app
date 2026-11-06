import { fetchPostLikers } from "@/features/feed/services/posts.server";
import { handleBffError, jsonError, jsonOk } from "@/lib/auth/bff";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) {
      return jsonError("Valid post id is required", 400, "VALIDATION");
    }
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const result = await fetchPostLikers({
      postId,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
    });
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
