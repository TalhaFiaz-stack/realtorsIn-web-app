import { changeJobStatus } from "@/features/jobs/services/jobs.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { id?: number; status?: string };
    const jobId = Number(body.id);
    const status = String(body.status ?? "").trim();
    if (!Number.isFinite(jobId) || !status) {
      return handleBffError(new Error("Job id and status are required"));
    }
    await changeJobStatus(jobId, status);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
