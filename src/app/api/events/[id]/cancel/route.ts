import { cancelEvent } from "@/features/events/services/events.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    const body = (await request.json()) as { cancel_note?: string | null };
    const event = await cancelEvent(Number(id), body.cancel_note ?? undefined);
    return jsonOk({ ok: true, event });
  } catch (error) {
    return handleBffError(error);
  }
}
