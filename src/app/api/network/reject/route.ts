import { connectionIdSchema } from "@/features/network/validators/network.validators";
import { rejectConnection } from "@/features/network/services/network.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { connectionId } = connectionIdSchema.parse(await request.json());
    await rejectConnection(connectionId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
