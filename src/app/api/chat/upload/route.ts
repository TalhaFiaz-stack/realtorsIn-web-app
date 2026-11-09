import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";
import { uploadChatFile } from "@/features/chat/services/chat.server";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const form = await readFormData(request, UPLOAD_LIMITS.chat);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      return jsonError("File is required", 400, "VALIDATION");
    }
    if (file.size > MAX_BYTES) {
      return jsonError("File must be 50MB or smaller", 400, "VALIDATION");
    }
    const uploaded = await uploadChatFile(file);
    return jsonOk({ ok: true, ...uploaded }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
