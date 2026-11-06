import { z } from "zod";
import { fetchSearchPage } from "@/features/feed/services/search.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
  searchText: z.string().trim().max(200).optional().default(""),
  searchType: z.enum(["foryou", "account", "tags"]).default("foryou"),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json().catch(() => ({}));
    const input = searchSchema.parse(body);
    const page = await fetchSearchPage({
      page: input.page,
      perPage: input.perPage,
      searchText: input.searchText || undefined,
      searchType: input.searchType,
    });
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
