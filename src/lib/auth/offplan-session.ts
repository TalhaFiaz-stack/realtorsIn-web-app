import "server-only";

import { cookies } from "next/headers";
import { getBaseEnv } from "@/lib/env";

export const OFFPLAN_TOKEN_COOKIE = "ri_node";

export async function getOffplanSessionToken(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(OFFPLAN_TOKEN_COOKIE)?.value;
  if (!value?.trim()) return null;
  return value.trim();
}

export async function setOffplanSessionCookie(token: string): Promise<void> {
  if (!token?.trim()) return;
  const env = getBaseEnv();
  const jar = await cookies();
  jar.set(OFFPLAN_TOKEN_COOKIE, token.trim(), {
    httpOnly: true,
    secure: env.SESSION_COOKIE_SECURE || env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: env.SESSION_COOKIE_MAX_AGE,
  });
}

export async function clearOffplanSessionCookie(): Promise<void> {
  const env = getBaseEnv();
  const jar = await cookies();
  jar.set(OFFPLAN_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: env.SESSION_COOKIE_SECURE || env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
