import { generateCvPdf } from "@/features/profile/services/profile-mutations.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const pdf = await generateCvPdf();
    return jsonOk({ ok: true, pdf });
  } catch (error) {
    return handleBffError(error);
  }
}
