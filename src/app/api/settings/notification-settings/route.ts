import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from "@/features/settings/services/settings.server";
import {
  notificationSettingPatchSchema,
  notificationSettingsBatchSchema,
} from "@/features/settings/validators/settings.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

export async function GET() {
  try {
    const settings = await fetchNotificationSettings();
    return jsonOk({ ok: true, settings });
  } catch (error) {
    return handleBffError(error);
  }
}

const postBodySchema = z.union([
  notificationSettingsBatchSchema,
  notificationSettingPatchSchema,
]);

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = postBodySchema.parse(await request.json());
    const settings = await updateNotificationSettings(
      "settings" in body
        ? body.settings
        : [{ key: body.key, value: body.value }]
    );
    return jsonOk({ ok: true, settings });
  } catch (error) {
    return handleBffError(error);
  }
}
