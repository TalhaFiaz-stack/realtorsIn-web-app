import {
  fetchSession,
  logoutRequest,
} from "@/features/auth/services/auth.client";

export async function getSessionView(signal?: AbortSignal) {
  return fetchSession(signal);
}

export async function logoutSession(signal?: AbortSignal) {
  await logoutRequest();
  void signal;
}
