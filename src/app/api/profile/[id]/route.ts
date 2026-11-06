import { fetchProfileById } from "@/features/profile/services/profile.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";
import { ApiError } from "@/lib/api/errors";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const socialProfileId = Number(id);
    if (!Number.isFinite(socialProfileId) || socialProfileId <= 0) {
      throw new ApiError("VALIDATION", "Invalid profile id", 400);
    }
    const profile = await fetchProfileById(socialProfileId);
    return jsonOk({ ok: true, profile });
  } catch (error) {
    return handleBffError(error);
  }
}
