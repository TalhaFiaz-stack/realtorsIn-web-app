import { logoutMember } from "@/features/auth/services/auth.server";
import {
  handleBffError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    await logoutMember();
    return jsonOk({ ok: true as const });
  } catch (error) {
    return handleBffError(error);
  }
}
