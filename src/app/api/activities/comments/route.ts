import { fetchActivityCommentsPage } from "@/features/activities/services/activities.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { page } = schema.parse({ page: url.searchParams.get("page") ?? 1 });
    const result = await fetchActivityCommentsPage(page);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return handleBffError(error);
  }
}
