import "server-only";

import {
  socialApiPublicRequest,
  socialApiRequest,
} from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  clearSessionCookie,
  getSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";
import { decodeJwtPayload } from "@/features/auth/lib/decode-jwt-payload";
import {
  backendMessage,
  extractNodeToken,
  extractRealtorsinToken,
  isBackendSuccess,
  mapToPublicMember,
  resolvePostAuthPath,
} from "@/features/auth/lib/map-member";
import {
  clearOffplanSessionCookie,
  setOffplanSessionCookie,
} from "@/lib/auth/offplan-session";
import type {
  AuthActionFailure,
  AuthActionResult,
  PublicMember,
  SessionView,
} from "@/features/auth/types/auth.types";
import type {
  CompleteProfileInput,
  EmailSendOtpInput,
  EmailVerifyOtpInput,
  PasswordLoginInput,
  PhoneSendOtpInput,
  PhoneVerifyOtpInput,
} from "@/features/auth/validators/auth.validators";

type LoginResponse = {
  success?: boolean | string;
  status?: boolean | string;
  message?: string;
  user?: Record<string, unknown>;
};

type CheckResponse = {
  status?: boolean | string;
  message?: string;
  data?: Record<string, unknown>;
};

async function establishSessionFromUser(
  user: Record<string, unknown>,
  next?: string | null
): Promise<AuthActionResult | AuthActionFailure> {
  const token = extractRealtorsinToken(user);
  if (!token) {
    return {
      ok: false,
      message: "Login succeeded but no session token was returned",
      code: "MISSING_TOKEN",
    };
  }

  await setSessionCookie(token);
  const nodeToken = extractNodeToken(user);
  if (nodeToken) {
    await setOffplanSessionCookie(nodeToken);
  }
  const member = mapToPublicMember(user);
  const redirectTo = resolvePostAuthPath(member, getSafeNextPath(next));
  return { ok: true, member, redirectTo };
}

function failFromError(error: unknown, fallback: string): AuthActionFailure {
  if (error instanceof ApiError) {
    return {
      ok: false,
      message: error.message || fallback,
      code: error.code,
    };
  }
  return { ok: false, message: fallback };
}

export async function loginWithPassword(
  input: PasswordLoginInput,
  next?: string | null
): Promise<AuthActionResult | AuthActionFailure> {
  try {
    const payload = await socialApiPublicRequest<LoginResponse>({
      path: "/api/login/password",
      method: "POST",
      data: {
        username_or_email: input.usernameOrEmail,
        password: input.password,
      },
    });

    if (!isBackendSuccess(payload) || !payload.user) {
      return {
        ok: false,
        message: backendMessage(payload, "Invalid credentials"),
        code: "LOGIN_FAILED",
      };
    }

    return establishSessionFromUser(payload.user, next);
  } catch (error) {
    return failFromError(error, "Unable to sign in with password");
  }
}

export async function sendPhoneOtp(
  input: PhoneSendOtpInput
): Promise<{ ok: true; message: string } | AuthActionFailure> {
  try {
    const payload = await socialApiPublicRequest<Record<string, unknown>>({
      path: "/api/login/phone/send-otp",
      method: "POST",
      data: {
        phone: input.phone,
        // Digits only — backend builds E.164; avoid "+92" → "++92…"
        phone_dial_code: input.phoneDialCode.replace(/\D/g, ""),
        ...(input.phoneCountryCode
          ? { phone_country_code: input.phoneCountryCode.toUpperCase() }
          : {}),
      },
    });

    if (!isBackendSuccess(payload)) {
      return {
        ok: false,
        message: backendMessage(payload, "Failed to send verification code"),
      };
    }

    return {
      ok: true,
      message: backendMessage(payload, "Verification code sent"),
    };
  } catch (error) {
    return failFromError(error, "Failed to send verification code");
  }
}

export async function verifyPhoneOtp(
  input: PhoneVerifyOtpInput,
  next?: string | null
): Promise<AuthActionResult | AuthActionFailure> {
  try {
    const payload = await socialApiPublicRequest<LoginResponse>({
      path: "/api/login/phone/verify-otp",
      method: "POST",
      data: {
        phone: input.phone,
        phone_dial_code: input.phoneDialCode.replace(/\D/g, ""),
        code: input.code,
        ...(input.phoneCountryCode
          ? { phone_country_code: input.phoneCountryCode.toUpperCase() }
          : {}),
      },
    });

    if (!isBackendSuccess(payload) || !payload.user) {
      return {
        ok: false,
        message: backendMessage(payload, "Invalid or expired verification code"),
      };
    }

    return establishSessionFromUser(payload.user, next);
  } catch (error) {
    return failFromError(error, "Unable to verify phone code");
  }
}

export async function sendEmailOtp(
  input: EmailSendOtpInput
): Promise<
  { ok: true; message: string; expiresIn: number } | AuthActionFailure
> {
  try {
    const payload = await socialApiPublicRequest<{
      status?: boolean;
      message?: string;
      data?: { expires_in?: number };
    }>({
      path: "/api/login/email/send-otp",
      method: "POST",
      data: { email: input.email },
    });

    if (!isBackendSuccess(payload)) {
      return {
        ok: false,
        message: backendMessage(payload, "Failed to send email code"),
      };
    }

    return {
      ok: true,
      message: backendMessage(payload, "OTP sent successfully to your email"),
      expiresIn: payload.data?.expires_in ?? 300,
    };
  } catch (error) {
    return failFromError(error, "Failed to send email code");
  }
}

export async function verifyEmailOtp(
  input: EmailVerifyOtpInput,
  next?: string | null
): Promise<AuthActionResult | AuthActionFailure> {
  try {
    const payload = await socialApiPublicRequest<LoginResponse>({
      path: "/api/login/email/verify-otp",
      method: "POST",
      data: {
        email: input.email,
        code: input.code,
      },
    });

    if (!isBackendSuccess(payload) || !payload.user) {
      return {
        ok: false,
        message: backendMessage(payload, "Invalid or expired verification code"),
      };
    }

    return establishSessionFromUser(payload.user, next);
  } catch (error) {
    return failFromError(error, "Unable to verify email code");
  }
}

export async function getValidatedSession(): Promise<SessionView> {
  const token = await getSessionToken();
  if (!token) {
    return {
      authenticated: false,
      hasSessionCookie: false,
      member: null,
    };
  }

  const signedOut = async (): Promise<SessionView> => {
    await clearSessionCookie().catch(() => undefined);
    await clearOffplanSessionCookie().catch(() => undefined);
    return { authenticated: false, hasSessionCookie: false, member: null };
  };

  const check = () =>
    socialApiRequest<CheckResponse>({
      path: "/api/social_profile/check",
      method: "GET",
      auth: true,
    });

  let payload: CheckResponse;
  try {
    payload = await check();
  } catch (error) {
    // Only a real auth rejection ends the session. A timeout / 5xx / network
    // blip used to clear the cookie too, silently signing members out.
    if (isAuthRejection(error)) return signedOut();
    try {
      payload = await check();
    } catch (retryError) {
      if (isAuthRejection(retryError)) return signedOut();
      throw retryError; // surfaced by the route error boundary ("Try again")
    }
  }

  if (!isBackendSuccess(payload) || !payload.data) {
    return signedOut();
  }

  return {
    authenticated: true,
    hasSessionCookie: true,
    member: mapToPublicMember(payload.data),
  };
}

function isAuthRejection(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 ||
      error.status === 403 ||
      error.code === "UNAUTHORIZED" ||
      error.code === "SESSION_EXPIRED")
  );
}

export async function logoutMember(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await socialApiRequest({
        path: "/api/login/logout",
        method: "POST",
        auth: true,
        data: { device: "web" },
      });
    } catch {
      // Always clear local session even if backend logout fails.
    }
  }
  await clearSessionCookie();
  await clearOffplanSessionCookie();
}

export async function completeMemberProfile(
  input: CompleteProfileInput,
  member: PublicMember
): Promise<AuthActionResult | AuthActionFailure> {
  try {
    const form = new FormData();
    if (member.socialProfileId) {
      form.append("id", String(member.socialProfileId));
    }
    form.append("name", input.name);
    form.append("last_name", input.lastName);
    form.append("email", member.email ?? "");
    form.append("phone", member.phone ?? "");
    form.append("phone_dial_code", member.phoneDialCode ?? "971");
    form.append("phone_country_code", "ae");
    form.append("user_name", input.userName);
    form.append("company", input.company);
    if (input.agencyName) form.append("agency_name", input.agencyName);
    form.append("user_role", input.userRole);
    if (input.reraNumber) form.append("rera_number", input.reraNumber);
    if (input.ornNumber) form.append("orn_number", input.ornNumber);
    if (input.cities?.length) form.append("cities", input.cities.join(","));
    if (input.propertyTypes?.length) {
      form.append("property_types", input.propertyTypes.join(","));
    }
    if (input.password) form.append("password", input.password);
    if (input.referralCode) form.append("referral_code", input.referralCode);

    const payload = await socialApiRequest<{
      status?: boolean | string;
      message?: string;
      data?: Record<string, unknown>;
    }>({
      path: "/api/social_profile",
      method: "POST",
      auth: true,
      data: form,
      isFormData: true,
    });

    if (!isBackendSuccess(payload)) {
      return {
        ok: false,
        message: backendMessage(payload, "Could not save profile"),
      };
    }

    const updated = mapToPublicMember({
      ...payload.data,
      has_profile: true,
      social_profile_id:
        payload.data?.social_profile_id ?? member.socialProfileId,
      email: payload.data?.email ?? member.email,
      phone: payload.data?.phone ?? member.phone,
      phone_dial_code: payload.data?.phone_dial_code ?? member.phoneDialCode,
      user_name: payload.data?.user_name ?? input.userName,
    });

    return {
      ok: true,
      member: updated,
      redirectTo: updated.needsOnboarding
        ? "/onboarding/profile"
        : "/onboarding/welcome",
    };
  } catch (error) {
    return failFromError(error, "Could not save profile");
  }
}

export type SocialSignInInput =
  | { provider: "google"; credential: string }
  | { provider: "facebook"; accessToken: string };

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function buildSocialLoginBody(
  input: SocialSignInInput
): Promise<Record<string, unknown> | AuthActionFailure> {
  if (input.provider === "google") {
    const claims = decodeJwtPayload(input.credential);
    const id = str(claims?.sub);
    const email = str(claims?.email);
    if (!id || !email) {
      return { ok: false, message: "Google did not return an email address" };
    }
    return {
      id,
      email,
      first_name: str(claims?.given_name),
      last_name: str(claims?.family_name),
      profile_image: str(claims?.picture),
      idToken: input.credential,
    };
  }

  if (input.provider === "facebook") {
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name,name&access_token=${encodeURIComponent(input.accessToken)}`,
      { cache: "no-store" }
    );
    const me = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const id = str(me?.id);
    const email = str(me?.email);
    if (!res.ok || !id) {
      return { ok: false, message: "Facebook sign-in failed" };
    }
    if (!email) {
      return {
        ok: false,
        message: "Your Facebook account has no email address. Use email sign-in instead.",
      };
    }
    return {
      id,
      email,
      first_name: str(me?.first_name),
      last_name: str(me?.last_name),
      name: str(me?.name),
      accessToken: input.accessToken,
    };
  }

  return { ok: false, message: "Unsupported sign-in provider" };
}

/** Same backend endpoints as mobile: POST /api/login/{google|facebook}. */
export async function loginWithSocialProvider(
  input: SocialSignInInput,
  next?: string | null
): Promise<AuthActionResult | AuthActionFailure> {
  try {
    const body = await buildSocialLoginBody(input);
    if ("ok" in body && body.ok === false) return body as AuthActionFailure;

    const payload = await socialApiPublicRequest<LoginResponse>({
      path: `/api/login/${input.provider}`,
      method: "POST",
      data: body,
    });
    if (!isBackendSuccess(payload) || !payload.user) {
      return {
        ok: false,
        message: backendMessage(payload, "Sign-in failed"),
        code: "LOGIN_FAILED",
      };
    }
    return establishSessionFromUser(payload.user, next);
  } catch (error) {
    return failFromError(error, "Unable to sign in");
  }
}
