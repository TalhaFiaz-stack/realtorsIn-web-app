import { z } from "zod";
import { fetchOffPlanProjectsPage } from "@/features/off-plan/services/off-plan.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

const schema = z.object({
  page: z.coerce.number().int().positive().optional(),
  searchText: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minArea: z.string().optional(),
  maxArea: z.string().optional(),
  beds: z.string().optional(),
  cityId: z.string().optional(),
  districtId: z.string().optional(),
  developerIds: z.array(z.string()).optional(),
  searchProjectIds: z.array(z.string()).optional(),
  developmentStatus: z.array(z.string()).optional(),
  completionStatus: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  completionDate: z.string().optional(),
  downPayment: z.string().optional(),
  postHandover: z.string().optional(),
  paymentBreakdown: z
    .object({
      pbBooking: z.string().optional(),
      pbConstruction: z.string().optional(),
      pbHandover: z.string().optional(),
      pbPostHandover: z.string().optional(),
    })
    .optional(),
  projectVisibility: z.enum(["all", "public", "private"]).optional(),
  sortBy: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = schema.parse(await request.json());
    const pageData = await fetchOffPlanProjectsPage(body);
    return jsonOk({ ok: true, ...pageData });
  } catch (error) {
    return handleBffError(error);
  }
}
