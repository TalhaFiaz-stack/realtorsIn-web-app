import { removeWorkingOnProject } from "@/features/working-on/services/working-on.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { z } from "zod";

const schema = z.object({
  projectId: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const { projectId } = schema.parse(await request.json());
    const message = await removeWorkingOnProject(projectId);
    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
