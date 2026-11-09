import "server-only";

import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getEnv } from "@/lib/env";
import { getSessionToken, clearSessionCookie } from "@/lib/auth/session";
import { ApiError, mapHttpStatusToCode, toApiError } from "@/lib/api/errors";
import { getRequestLocale } from "@/features/localization/server/locale.server";

const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * Dev-only: say *why* the Social API call failed. The old message always said
 * "run SocialProfileREM", even when it was running and just refused, dropped
 * or timed out one request.
 */
function describeSocialApiNetworkError(
  error: unknown,
  base: string,
  path: string,
  timeoutMs: number
): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const where = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  switch (code) {
    case "ECONNREFUSED":
      return `Social API is not running at ${base} (connection refused). Start SocialProfileREM (port 3000) or set SOCIAL_API_URL in .env.local.`;
    case "ECONNABORTED":
    case "ETIMEDOUT":
      return `Social API timed out after ${Math.round(timeoutMs / 1000)}s: ${where}. The backend is running but slow or busy.`;
    case "ECONNRESET":
    case "EPIPE":
      return `Social API dropped the connection (${code}): ${where}. The backend may have restarted or crashed on this request — check its log.`;
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return `Social API host not found (${code}): ${base}. Check SOCIAL_API_URL in .env.local.`;
    default:
      return `Cannot reach Social API at ${base}${code ? ` (${code})` : ""}: ${where}. Check that SocialProfileREM is running (port 3000) or set SOCIAL_API_URL in .env.local.`;
  }
}

function createBaseClient(): AxiosInstance {
  const { SOCIAL_API_URL } = getEnv();
  return axios.create({
    baseURL: SOCIAL_API_URL.replace(/\/$/, ""),
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
    },
  });
}

export type ServerRequestOptions = {
  auth?: boolean;
  /** Override Bearer token (e.g. immediately after login before cookie write). */
  bearerToken?: string | null;
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** When true, do not set Content-Type (multipart boundary). */
  isFormData?: boolean;
  /** Override axios timeout (ms). PDF generation needs a longer window. */
  timeoutMs?: number;
  /** Axios responseType when streaming binary (e.g. PDF download). */
  responseType?: AxiosRequestConfig["responseType"];
};

export async function socialApiRequest<T>(
  options: ServerRequestOptions
): Promise<T> {
  const {
    auth = true,
    bearerToken,
    path,
    method = "GET",
    data,
    params,
    signal,
    headers = {},
    isFormData = false,
    timeoutMs,
    responseType,
  } = options;

  const client = createBaseClient();
  const requestHeaders: Record<string, string> = { ...headers };

  if (!isFormData && !(data instanceof FormData)) {
    requestHeaders["Content-Type"] =
      requestHeaders["Content-Type"] ?? "application/json";
  }

  if (auth || bearerToken) {
    const token = bearerToken ?? (await getSessionToken());
    if (!token) {
      throw new ApiError("SESSION_EXPIRED", "Session required", 401);
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const locale = await getRequestLocale();
  requestHeaders.locale = locale;

  const config: AxiosRequestConfig = {
    url: path.startsWith("/") ? path : `/${path}`,
    method,
    data,
    params,
    signal,
    headers: requestHeaders,
    timeout: timeoutMs,
    responseType,
  };

  try {
    const response = await client.request<T>(config);
    return response.data;
  } catch (error) {
    let apiError = toApiError(error);
    if (
      apiError.code === "NETWORK" &&
      process.env.NODE_ENV === "development"
    ) {
      const base = getEnv().SOCIAL_API_URL.replace(/\/$/, "");
      apiError = new ApiError(
        "NETWORK",
        describeSocialApiNetworkError(error, base, path, timeoutMs ?? DEFAULT_TIMEOUT_MS),
        0,
        apiError.details
      );
    }
    if (apiError.status === 401 && (auth || bearerToken)) {
      await clearSessionCookie().catch(() => undefined);
      throw new ApiError(
        "SESSION_EXPIRED",
        "Session expired or invalid",
        401,
        apiError.details
      );
    }
    if (apiError.code === "UNKNOWN" && apiError.status) {
      throw new ApiError(
        mapHttpStatusToCode(apiError.status),
        apiError.message,
        apiError.status,
        apiError.details
      );
    }
    throw apiError;
  }
}

/** Public Social API call (login/OTP send) — no Bearer. */
export async function socialApiPublicRequest<T>(
  options: Omit<ServerRequestOptions, "auth" | "bearerToken">
): Promise<T> {
  return socialApiRequest<T>({ ...options, auth: false });
}
