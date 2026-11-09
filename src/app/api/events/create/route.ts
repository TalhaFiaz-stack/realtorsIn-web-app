import { createEventMultipart } from "@/features/events/services/events.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const form = await readFormData(request, UPLOAD_LIMITS.listing);
    const event = await createEventMultipart(form);
    return jsonOk({ ok: true, event }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
