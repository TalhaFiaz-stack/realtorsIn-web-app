import { z } from "zod";
import { markCampaignRead } from "@/features/campaigns/services/campaigns.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireCsrf(request);
    const { id } = await context.params;
    await markCampaignRead(z.coerce.number().int().positive().parse(id));
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
