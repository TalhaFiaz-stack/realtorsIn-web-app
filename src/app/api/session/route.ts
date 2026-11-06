import { getValidatedSession } from "@/features/auth/services/auth.server";
import { jsonOk } from "@/lib/auth/bff";

/**
 * Validates the HttpOnly cookie against SocialProfileREM check endpoint.
 * Never returns tokens.
 */
export async function GET() {
  const session = await getValidatedSession();
  return jsonOk({
    authenticated: session.authenticated,
    hasSessionCookie: session.hasSessionCookie,
    member: session.member,
  });
}
