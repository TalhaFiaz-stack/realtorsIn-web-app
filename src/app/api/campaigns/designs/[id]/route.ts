import { z } from "zod";
import { fetchCampaignDesign } from "@/features/campaigns/services/campaigns.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const design = await fetchCampaignDesign(z.coerce.number().int().positive().parse(id));
    return jsonOk({ ok: true, design });
  } catch (error) {
    return handleBffError(error);
  }
}
