import { applyForJob } from "@/features/jobs/services/jobs.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      cover_letter?: string;
      contact_email?: string;
      contact_phone?: string;
    };
    await applyForJob(Number(id), body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
