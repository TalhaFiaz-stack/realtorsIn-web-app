import { createJobMultipart } from "@/features/jobs/services/jobs.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const form = await request.formData();
    const job = await createJobMultipart(form);
    return jsonOk({ ok: true, job }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
