import { bffRequest } from "@/lib/api/client";
import type { PublicMember, SessionView } from "@/features/auth/types/auth.types";

type AuthSuccess = {
  ok: true;
  member: PublicMember;
  redirectTo: string;
};

export async function fetchSession(signal?: AbortSignal): Promise<SessionView> {
  return bffRequest<SessionView>({ path: "session", method: "GET", signal });
}

export async function passwordLoginRequest(input: {
  usernameOrEmail: string;
  password: string;
  next?: string;
}) {
  return bffRequest<AuthSuccess>({
    path: "auth/login/password",
    method: "POST",
    data: input,
  });
}

export async function phoneSendOtpRequest(input: {
  phone: string;
  phoneDialCode: string;
  phoneCountryCode?: string;
}) {
  return bffRequest<{ ok: true; message: string }>({
    path: "auth/otp/phone/send",
    method: "POST",
    data: input,
  });
}

export async function phoneVerifyOtpRequest(input: {
  phone: string;
  phoneDialCode: string;
  phoneCountryCode?: string;
  code: string;
  next?: string;
}) {
  return bffRequest<AuthSuccess>({
    path: "auth/otp/phone/verify",
    method: "POST",
    data: input,
  });
}

export async function emailSendOtpRequest(input: { email: string }) {
  return bffRequest<{ ok: true; message: string; expiresIn: number }>({
    path: "auth/otp/email/send",
    method: "POST",
    data: input,
  });
}

export async function emailVerifyOtpRequest(input: {
  email: string;
  code: string;
  next?: string;
}) {
  return bffRequest<AuthSuccess>({
    path: "auth/otp/email/verify",
    method: "POST",
    data: input,
  });
}

export async function completeProfileRequest(
  input: Record<string, unknown>
) {
  return bffRequest<AuthSuccess>({
    path: "auth/profile/complete",
    method: "POST",
    data: input,
  });
}

export async function logoutRequest() {
  return bffRequest<{ ok: true }>({
    path: "auth/logout",
    method: "POST",
  });
}
