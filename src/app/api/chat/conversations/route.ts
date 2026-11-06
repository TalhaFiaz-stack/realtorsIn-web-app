import { listConversations } from "@/features/chat/services/chat.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = schema.parse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 20,
      search: url.searchParams.get("search") ?? undefined,
    });
    const page = await listConversations(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
