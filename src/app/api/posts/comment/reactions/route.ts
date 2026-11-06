import { fetchCommentReactions } from "@/features/feed/services/posts.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  commentId: z.number().int().positive(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await fetchCommentReactions(body);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
