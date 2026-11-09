import { updateJobMultipart } from "@/features/jobs/services/jobs.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

export const maxDuration = 120;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      return handleBffError(new Error("Invalid job id"));
    }
    const form = await readFormData(request, UPLOAD_LIMITS.listing);
    const job = await updateJobMultipart(jobId, form);
    return jsonOk({ ok: true, job });
  } catch (error) {
    return handleBffError(error);
  }
}
