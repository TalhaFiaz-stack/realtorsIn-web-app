import { networkListSchema } from "@/features/network/validators/network.validators";
import { listConnections } from "@/features/network/services/network.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = networkListSchema.parse({
      type: url.searchParams.get("type") ?? "all",
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 20,
      search: url.searchParams.get("search") ?? undefined,
    });
    const page = await listConnections(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
