import "server-only";

import { cookies } from "next/headers";
import { getAuthCookieName } from "@/lib/env";
import { SESSION_COOKIE_MAX_AGE } from "@/lib/auth/session-cookie.constants";
import { isSecureCookieContext } from "@/lib/env";

export const SESSION_COOKIE_PATH = "/";

export type SessionSnapshot = {
  /** Cookie is present. Not proof the backend token is valid. */
  hasSessionCookie: boolean;
};

/**
 * Reads the HttpOnly session cookie value (realtorsin_token).
 * Never log or return this to the browser.
 */
export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(getAuthCookieName())?.value;
  if (!value || value.trim().length === 0) {
    return null;
  }
  return value;
}

export async function getSessionSnapshot(): Promise<SessionSnapshot> {
  const token = await getSessionToken();
  return { hasSessionCookie: Boolean(token) };
}

export async function setSessionCookie(token: string): Promise<void> {
  if (!token || token.trim().length === 0) {
    throw new Error("Cannot set empty session token");
  }

  const jar = await cookies();
  jar.set(getAuthCookieName(), token, {
    httpOnly: true,
    secure: isSecureCookieContext(),
    sameSite: "lax",
    path: SESSION_COOKIE_PATH,
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(getAuthCookieName(), "", {
    httpOnly: true,
    secure: isSecureCookieContext(),
    sameSite: "lax",
    path: SESSION_COOKIE_PATH,
    maxAge: 0,
  });
}
