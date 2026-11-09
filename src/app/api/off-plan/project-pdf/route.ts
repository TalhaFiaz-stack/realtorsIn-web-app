import { z } from "zod";
import { requestOffPlanProjectPdfUrl } from "@/features/off-plan/services/off-plan-presentation.server";
import {
  buildDefaultPresentationToggles,
  type OffPlanPresentationOptions,
  type OffPlanPresentationToggle,
} from "@/features/off-plan/lib/off-plan-presentation";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const toggleSchema = z.object({
  value: z.string(),
  isOn: z.boolean(),
});

const bodySchema = z.object({
  projectId: z.string().trim().regex(/^[A-Za-z0-9_-]{1,64}$/, "Invalid project id"),
  currency: z.string().default("AED"),
  language: z.string().default("en"),
  theme: z.enum(["light", "dark"]).default("light"),
  design: z.enum(["v1", "v2"]).default("v1"),
  area: z.enum(["sqft", "sqm"]).default("sqft"),
  toggles: z.array(toggleSchema).optional(),
  paymentPlanIds: z.array(z.string()).default([]),
  hasPaymentPlans: z.boolean().default(false),
});

function resolveOptions(input: z.infer<typeof bodySchema>): OffPlanPresentationOptions {
  const defaults = buildDefaultPresentationToggles(
    "pdf",
    input.hasPaymentPlans
  );
  const toggles: OffPlanPresentationToggle[] = input.toggles?.length
    ? defaults.map((d) => {
        const match = input.toggles?.find((t) => t.value === d.value);
        return match ? { ...d, isOn: match.isOn } : d;
      })
    : defaults;

  return {
    currency: input.currency,
    language: input.language,
    theme: input.theme,
    design: input.design,
    area: input.area,
    toggles,
    paymentPlanIds: input.paymentPlanIds,
  };
}

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError("Invalid PDF options", 400, "VALIDATION");
    }
    const url = await requestOffPlanProjectPdfUrl(
      parsed.data.projectId,
      resolveOptions(parsed.data)
    );
    return jsonOk({ ok: true, url });
  } catch (error) {
    return handleBffError(error);
  }
}
