import { rsvpEvent } from "@/features/events/services/events.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    const status = String(body.status ?? "").trim();
    if (!status) {
      return handleBffError(new Error("RSVP status is required"));
    }
    const data = await rsvpEvent(Number(id), status);
    return jsonOk({ ok: true, data });
  } catch (error) {
    return handleBffError(error);
  }
}
