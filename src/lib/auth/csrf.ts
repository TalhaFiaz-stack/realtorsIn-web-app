import { getPublicAppUrl } from "@/lib/env";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Same-origin CSRF guard for state-changing BFF routes.
 * Validates Origin (preferred) or Referer against NEXT_PUBLIC_APP_URL / Host.
 *
 * Decision (Phase 1–4 remediation): Origin/Referer is sufficient for this
 * same-site BFF + HttpOnly cookie model. A double-submit CSRF cookie is
 * deferred unless threat modeling requires non-browser clients.
 */
export function assertSameOrigin(request: Request): void {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  const appUrl = getPublicAppUrl();

  const allowed = new Set<string>([appUrl]);
  if (host) {
    allowed.add(`http://${host}`);
    allowed.add(`https://${host}`);
  }

  const candidate = origin || (referer ? new URL(referer).origin : null);
  if (!candidate) {
    throw new CsrfError("Missing Origin/Referer for state-changing request");
  }

  if (![...allowed].some((base) => candidate === base || candidate.startsWith(base))) {
    throw new CsrfError("Cross-origin request blocked");
  }
}

export class CsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsrfError";
  }
}
