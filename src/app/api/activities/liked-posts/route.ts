import { fetchLikedPostsPage } from "@/features/activities/services/activities.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { z } from "zod";

const filterSchema = z.enum(["all", "photos", "text"]);

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  type: filterSchema.default("all"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { page, type } = schema.parse({
      page: url.searchParams.get("page") ?? 1,
      type: url.searchParams.get("type") ?? "all",
    });
    const result = await fetchLikedPostsPage(page, type);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
