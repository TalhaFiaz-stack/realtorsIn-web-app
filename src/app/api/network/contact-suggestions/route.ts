import { listContactSuggestions } from "@/features/network/services/network.server";
import { suggestionsSchema } from "@/features/network/validators/network.validators";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = suggestionsSchema.parse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 10,
    });
    const page = await listContactSuggestions(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
