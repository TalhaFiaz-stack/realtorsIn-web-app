import type { PublicMember } from "@/features/auth/types/auth.types";

type RawUser = Record<string, unknown>;

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

/** Login/check may return a string URL or `{ url }` media object. */
function mapAvatarUrl(raw: unknown): string | null {
  const direct = asString(raw);
  if (direct) return direct;
  if (raw && typeof raw === "object") {
    return asString((raw as RawUser).url);
  }
  return null;
}

/** Maps backend user/check payloads to a browser-safe member (no tokens). */
export function mapToPublicMember(raw: unknown): PublicMember {
  const data = (raw && typeof raw === "object" ? raw : {}) as RawUser;
  const userName = asString(data.user_name);
  const activeStatus = asString(data.active_status);
  const hasProfile = asBool(data.has_profile) || asBool(data.profile_exists);
  const needsOnboarding = !userName;
  const isInactive =
    Boolean(activeStatus) &&
    activeStatus !== "active" &&
    activeStatus !== "1";

  return {
    socialProfileId: asNumber(data.social_profile_id),
    userName,
    name: asString(data.name),
    lastName: asString(data.last_name),
    fullName: asString(data.full_name),
    email: asString(data.email),
    phone: asString(data.phone),
    phoneDialCode: asString(data.phone_dial_code),
    phoneVerified: asBool(data.phone_verified),
    emailVerified: asBool(data.email_verified),
    avatarUrl:
      mapAvatarUrl(data.profile_image) ?? mapAvatarUrl(data.user_image),
    coverUrl: mapAvatarUrl(data.cover_image),
    company: asString(data.company),
    userRole: asString(data.user_role),
    location: asString(data.location),
    description: asString(data.description),
    hasProfile,
    isProfileComplete: asBool(data.is_profile_complete),
    profileCompletionPercentage: asNumber(data.profile_completion_percentage) ?? 0,
    activeStatus,
    needsOnboarding,
    isInactive,
  };
}

export function extractRealtorsinToken(rawUser: unknown): string | null {
  if (!rawUser || typeof rawUser !== "object") return null;
  const token = (rawUser as RawUser).realtorsin_token;
  return typeof token === "string" && token.trim() ? token : null;
}

/** REM / off-plan catalog Bearer (mobile `USER.node_token`). Never expose to the client. */
export function extractNodeToken(rawUser: unknown): string | null {
  if (!rawUser || typeof rawUser !== "object") return null;
  const token = (rawUser as RawUser).node_token;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export function backendMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const message = (payload as RawUser).message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

export function isBackendSuccess(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as RawUser;
  return p.success === true || p.success === "true" || p.status === true || p.status === "true";
}

export function resolvePostAuthPath(
  member: PublicMember,
  nextPath: string
): string {
  if (member.isInactive) {
    return "/login?error=inactive";
  }
  if (member.needsOnboarding) {
    return "/onboarding/profile";
  }
  return nextPath;
}
