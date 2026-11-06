import { inviteToEvent } from "@/features/events/services/events.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    const body = (await request.json()) as { invitee_ids?: number[] };
    const ids = Array.isArray(body.invitee_ids)
      ? body.invitee_ids.map(Number).filter((n) => Number.isFinite(n))
      : [];
    const data = await inviteToEvent(Number(id), ids);
    return jsonOk({ ok: true, data });
  } catch (error) {
    return handleBffError(error);
  }
}
