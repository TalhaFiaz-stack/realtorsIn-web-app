import { fetchJobById } from "@/features/jobs/services/jobs.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const job = await fetchJobById(Number(id));
    return jsonOk({ ok: true, job });
  } catch (error) {
    return handleBffError(error);
  }
}
