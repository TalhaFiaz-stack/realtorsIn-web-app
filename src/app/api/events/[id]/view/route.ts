import { recordEventView } from "@/features/events/services/events.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await recordEventView(Number(id));
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
