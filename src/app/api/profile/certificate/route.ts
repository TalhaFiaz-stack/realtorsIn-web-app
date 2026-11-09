import {
  deleteCertificate,
  upsertCertificate,
} from "@/features/profile/services/profile-mutations.server";
import { parseCertificateUpsertForm } from "@/features/profile/lib/parse-section-upsert-form";
import { sectionDeleteSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      if (json?.action === "delete") {
        const body = sectionDeleteSchema.parse(json);
        await deleteCertificate(body.id);
        return jsonOk({ ok: true });
      }
    }

    const form = await readFormData(request, UPLOAD_LIMITS.profileSection);
    if (form.get("action") === "delete") {
      const body = sectionDeleteSchema.parse({
        id: Number(form.get("id")),
      });
      await deleteCertificate(body.id);
      return jsonOk({ ok: true });
    }

    const { body, certificateImage } = parseCertificateUpsertForm(form);
    await upsertCertificate(body, certificateImage);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
