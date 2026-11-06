import { fetchConnectionStatus } from "@/features/network/services/network.server";
import { connectionStatusSchema } from "@/features/network/validators/network.validators";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = connectionStatusSchema.parse({
      socialProfileId: url.searchParams.get("socialProfileId"),
    });
    const status = await fetchConnectionStatus(input);
    return jsonOk({ ok: true, status });
  } catch (error) {
    return handleBffError(error);
  }
}
