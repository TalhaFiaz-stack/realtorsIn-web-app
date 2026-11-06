import { fetchEventAttendeesPage } from "@/features/events/services/events.server";
import { mapEventAttendeesPage } from "@/features/events/lib/map-event-attendees";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") ?? "going";
    const status = statusParam === "invited" ? "invited" : "going";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const payload = await fetchEventAttendeesPage(Number(id), status, page);
    const pageData = mapEventAttendeesPage(payload);
    return jsonOk({ ok: true, ...pageData });
  } catch (error) {
    return handleBffError(error);
  }
}
