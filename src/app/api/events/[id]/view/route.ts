import { recordEventView } from "@/features/events/services/events.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    await recordEventView(Number(id));
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
