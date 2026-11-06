import { fetchEventById } from "@/features/events/services/events.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    const event = await fetchEventById(eventId);
    return jsonOk({ ok: true, event });
  } catch (error) {
    return handleBffError(error);
  }
}
