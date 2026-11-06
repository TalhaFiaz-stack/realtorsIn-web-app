import { z } from "zod";
import { fetchRemAgentContact } from "@/features/off-plan/services/published-listings.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const schema = z.object({
  propertyId: z.coerce.number().int().positive(),
  type: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = schema.parse(await request.json());
    const contact = await fetchRemAgentContact(body);
    return jsonOk({ ok: true, contact });
  } catch (error) {
    return handleBffError(error);
  }
}
