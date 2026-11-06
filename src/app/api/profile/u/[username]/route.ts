import { fetchProfileByUsername } from "@/features/profile/services/profile.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { ApiError } from "@/lib/api/errors";

type Props = { params: Promise<{ username: string }> };

export async function GET(_request: Request, { params }: Props) {
  try {
    const { username } = await params;
    const decoded = decodeURIComponent(username || "").trim();
    if (!decoded) {
      throw new ApiError("VALIDATION", "Username required", 400);
    }
    const profile = await fetchProfileByUsername(decoded);
    return jsonOk({ ok: true, profile });
  } catch (error) {
    return handleBffError(error);
  }
}
