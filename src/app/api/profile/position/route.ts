import {
  deletePosition,
  upsertPosition,
} from "@/features/profile/services/profile-mutations.server";
import { parsePositionUpsertForm } from "@/features/profile/lib/parse-section-upsert-form";
import { sectionDeleteSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      if (json?.action === "delete") {
        const body = sectionDeleteSchema.parse(json);
        await deletePosition(body.id);
        return jsonOk({ ok: true });
      }
    }

    const form = await request.formData();
    if (form.get("action") === "delete") {
      const body = sectionDeleteSchema.parse({
        id: Number(form.get("id")),
      });
      await deletePosition(body.id);
      return jsonOk({ ok: true });
    }

    const { body, imageFiles } = parsePositionUpsertForm(form);
    await upsertPosition(body, imageFiles);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
