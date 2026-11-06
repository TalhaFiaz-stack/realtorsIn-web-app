import { deleteJob } from "@/features/jobs/services/jobs.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await requireCsrf(request);
    const { id } = await params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      return handleBffError(new Error("Invalid job id"));
    }
    await deleteJob(jobId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
