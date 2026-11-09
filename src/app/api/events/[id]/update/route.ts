import { updateEventMultipart } from "@/features/events/services/events.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

type Params = { params: Promise<{ id: string }> };

export const maxDuration = 120;

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    const form = await readFormData(request, UPLOAD_LIMITS.listing);
    const event = await updateEventMultipart(Number(id), form);
    return jsonOk({ ok: true, event });
  } catch (error) {
    return handleBffError(error);
  }
}
