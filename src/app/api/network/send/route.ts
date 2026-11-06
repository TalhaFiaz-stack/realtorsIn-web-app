import { sendRequestSchema } from "@/features/network/validators/network.validators";
import { sendConnectionRequest } from "@/features/network/services/network.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = sendRequestSchema.parse(await request.json());
    await sendConnectionRequest(input);
    return jsonOk({ ok: true }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
