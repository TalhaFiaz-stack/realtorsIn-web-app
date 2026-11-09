import { z } from "zod";
import { handleBffError, jsonError, jsonOk, requireCsrf } from "@/lib/auth/bff";
import { socialApiRequest } from "@/lib/api/server-client";
import { getSessionToken } from "@/lib/auth/session";

/** Social `POST /api/user-location` (mobile `useUserLocationSync` parity). */
const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  capturedAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    if (!(await getSessionToken())) {
      return jsonError("Sign in required", 401, "UNAUTHORIZED");
    }
    const input = schema.parse(await request.json());
    await socialApiRequest<unknown>({
      path: "/api/user-location",
      method: "POST",
      auth: true,
      data: {
        latitude: input.latitude,
        longitude: input.longitude,
        device_lat: input.latitude,
        device_lng: input.longitude,
        ...(input.accuracy != null ? { accuracy: input.accuracy } : {}),
        ...(input.capturedAt ? { captured_at: input.capturedAt } : {}),
      },
    }).catch(() => null); // backend rejects test users (403); never surface
    return jsonOk({ ok: true });
  } catch (error) {
    return handleBffError(error);
  }
}
