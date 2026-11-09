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

  // Exact origin match only. `startsWith` let lookalikes such as
  // https://realtorsin.com.evil.net through.
  const allowed = new Set<string>();
  const appOrigin = originOf(getPublicAppUrl());
  if (appOrigin) allowed.add(appOrigin);
  if (host) {
    allowed.add(`https://${host}`);
    // Plain http only for local development hosts.
    if (isLocalHost(host)) allowed.add(`http://${host}`);
  }

  const candidate = origin ? originOf(origin) : referer ? originOf(referer) : null;
  if (!candidate) {
    throw new CsrfError("Missing Origin/Referer for state-changing request");
  }

  if (!allowed.has(candidate)) {
    throw new CsrfError("Cross-origin request blocked");
  }
}

function originOf(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalHost(host: string): boolean {
  const name = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  return name === "localhost" || name === "127.0.0.1" || name === "::1" || name.endsWith(".localhost");
}

export class CsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsrfError";
  }
}
