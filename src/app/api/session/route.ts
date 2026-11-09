import { getValidatedSession } from "@/features/auth/services/auth.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

/**
 * Validates the HttpOnly cookie against SocialProfileREM check endpoint.
 * Never returns tokens. A backend outage returns an error (not "signed out")
 * so a temporary blip doesn't log the member out.
 */
export async function GET() {
  try {
    const session = await getValidatedSession();
    return jsonOk({
      authenticated: session.authenticated,
      hasSessionCookie: session.hasSessionCookie,
      member: session.member,
    });
  } catch (error) {
    return handleBffError(error);
  }
}
