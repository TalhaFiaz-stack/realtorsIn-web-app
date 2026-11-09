import { z } from "zod";
import { buildUnitPdfPath } from "@/features/off-plan/lib/off-plan-unit";
import { parseOffPlanRouteId } from "@/features/off-plan/lib/parse-off-plan-route-id";
import { requestOffPlanUnitPdfUrl } from "@/features/off-plan/services/off-plan-presentation.server";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const bodySchema = z.object({
  kind: z.enum(["presentation", "quotation"]),
  projectId: z.string().min(1),
  unitId: z.string().min(1),
  currency: z.string().min(3).max(5).default("AED"),
  language: z.string().min(2).max(5).default("en"),
  area: z.enum(["sqft", "sqm"]).default("sqft"),
  theme: z.enum(["light", "dark"]).optional(),
  design: z.enum(["v1", "v2"]).optional(),
  toggles: z
    .object({
      watermark: z.boolean(),
      full_description: z.boolean(),
      developer: z.boolean(),
      map: z.boolean(),
    })
    .optional(),
  notes: z.string().max(2000).optional(),
  customFields: z
    .array(z.object({ key: z.string().max(60), value: z.string().max(300) }))
    .max(20)
    .optional(),
});

/** Generate a unit presentation or quotation PDF → `{ url }` to open. */
export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Invalid PDF options", 400, "VALIDATION");
    const { kind, projectId: rawProject, unitId: rawUnit, ...options } = parsed.data;
    const projectId = parseOffPlanRouteId(rawProject);
    const unitId = parseOffPlanRouteId(rawUnit);
    if (!projectId || !unitId) return jsonError("Invalid unit", 400, "VALIDATION");
    const url = await requestOffPlanUnitPdfUrl(buildUnitPdfPath(kind, projectId, unitId, options));
    return jsonOk({ ok: true, url });
  } catch (error) {
    return handleBffError(error);
  }
}
