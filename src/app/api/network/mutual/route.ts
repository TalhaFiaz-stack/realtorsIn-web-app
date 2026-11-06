import { listMutualConnections } from "@/features/network/services/network.server";
import { handleBffError, jsonError, jsonOk } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const remUserId = Number(searchParams.get("remUserId"));
    const socialProfileId = Number(searchParams.get("socialProfileId"));

    if (
      (!Number.isFinite(remUserId) || remUserId <= 0) &&
      (!Number.isFinite(socialProfileId) || socialProfileId <= 0)
    ) {
      return jsonError("remUserId or socialProfileId is required", 400, "VALIDATION");
    }

    const page = await listMutualConnections({
      remUserId: Number.isFinite(remUserId) && remUserId > 0 ? remUserId : undefined,
      socialProfileId:
        Number.isFinite(socialProfileId) && socialProfileId > 0
          ? socialProfileId
          : undefined,
    });

    return jsonOk({ ok: true, ...page });
  } catch (error) {
    return handleBffError(error);
  }
}
