import "server-only";

import { headers } from "next/headers";
import { getEnv } from "@/lib/env";

/**
 * Web requests reach SocialProfileREM through this server, so on its own the
 * backend would log *our* IP and axios as the user agent for every web action.
 * These headers carry the visitor's real IP, browser and platform. The
 * backend only trusts them when `x-bff-key` matches its BFF_SHARED_SECRET.
 */
const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

function firstIp(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first && IP_PATTERN.test(first) ? first : null;
}

export async function getClientContextHeaders(): Promise<Record<string, string>> {
  const out: Record<string, string> = { "x-client-platform": "web" };
  const secret = getEnv().BFF_SHARED_SECRET;
  if (secret) out["x-bff-key"] = secret;

  let incoming: Headers | null = null;
  try {
    incoming = await headers();
  } catch {
    return out; // outside a request (build / background job)
  }

  // Set by the proxy in front of Next (nginx / load balancer / CDN).
  const ip =
    firstIp(incoming.get("cf-connecting-ip")) ??
    firstIp(incoming.get("x-real-ip")) ??
    firstIp(incoming.get("x-forwarded-for"));
  if (ip) out["x-client-ip"] = ip;

  const ua = incoming.get("user-agent");
  if (ua) out["x-client-user-agent"] = ua.slice(0, 512);

  return out;
}
