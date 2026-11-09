import { z } from "zod";
import { fetchOffPlanProjectDetail } from "@/features/off-plan/services/off-plan.server";
import { mapOffPlanProjectForShare } from "@/features/off-plan/lib/map-off-plan-project-share";
import { createPostMultipart } from "@/features/feed/services/posts.server";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { getSessionToken } from "@/lib/auth/session";

const bodySchema = z.object({
  projectId: z.string().min(1),
  description: z.string().max(5000).optional(),
  visibility: z.enum(["public", "connections"]).default("connections"),
  /** Optional — same fields the regular composer sends. */
  scheduledAt: z.string().datetime().optional(),
  mentionedUserIds: z.array(z.number().int().positive()).max(50).optional(),
  mentionedUsers: z
    .array(
      z.object({
        user_id: z.number().int().positive(),
        display_name: z.string().max(200),
        user_name: z.string().max(200),
      })
    )
    .max(50)
    .optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const token = await getSessionToken();
    if (!token) {
      return jsonError("Sign in to share this project", 401, "UNAUTHORIZED");
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError("Invalid share request", 400, "VALIDATION");
    }

    const project = await fetchOffPlanProjectDetail(parsed.data.projectId);
    const projectData = mapOffPlanProjectForShare(project);

    const form = new FormData();
    form.append("description", parsed.data.description?.trim() ?? "");
    form.append("visibility", parsed.data.visibility);
    form.append("project", JSON.stringify(projectData));
    if (parsed.data.scheduledAt) form.append("scheduled_at", parsed.data.scheduledAt);
    if (parsed.data.mentionedUserIds?.length) {
      form.append("mentioned_user_ids", JSON.stringify(parsed.data.mentionedUserIds));
    }
    if (parsed.data.mentionedUsers?.length) {
      form.append("mentioned_users", JSON.stringify(parsed.data.mentionedUsers));
    }

    const created = await createPostMultipart(form);
    return jsonOk({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}
