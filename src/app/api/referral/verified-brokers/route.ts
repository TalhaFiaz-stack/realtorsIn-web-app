import { listVerifiedBrokers } from "@/features/referral/services/referral.server";
import { verifiedBrokersListSchema } from "@/features/referral/validators/referral.validators";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = verifiedBrokersListSchema.parse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 20,
      search: url.searchParams.get("search") ?? undefined,
    });
    const result = await listVerifiedBrokers(input);
    return jsonOk(result);
  } catch (error) {
    return handleBffError(error);
  }
}
