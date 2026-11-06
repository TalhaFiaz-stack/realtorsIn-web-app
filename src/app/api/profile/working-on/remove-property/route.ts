import { removeWorkingOnProperty } from "@/features/working-on/services/working-on.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  propertyId: z.coerce.number().int().positive(),
  type: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const input = schema.parse(await request.json());
    const message = await removeWorkingOnProperty({
      propertyId: input.propertyId,
      type: input.type,
    });
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
