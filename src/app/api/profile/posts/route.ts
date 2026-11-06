import { z } from "zod";
import { fetchUserPostsPage } from "@/features/profile/services/profile.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

const schema = z.object({
  userProfileId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = schema.parse({
      userProfileId: url.searchParams.get("userProfileId"),
      page: url.searchParams.get("page") ?? 1,
      perPage: url.searchParams.get("perPage") ?? 20,
    });
    const page = await fetchUserPostsPage(input);
    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
